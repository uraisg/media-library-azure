using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using MediaLibrary.Intranet.Web.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Spatial;
using NCrontab;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;

namespace MediaLibrary.Intranet.Web.Background
{
    /// <summary>
    /// A recurring background job to query internet API for new media uploads and transfer them to intranet component.
    /// </summary>
    public class ScheduledService : BackgroundService
    {
        private CrontabSchedule _schedule;
        private DateTime _nextRun;

        // Run once at every second minute
        private static readonly string Schedule = "*/2 * * * *";

        private readonly AppSettings _appSettings;
        private readonly ILogger<ScheduledService> _logger;
        private readonly IHttpClientFactory _clientFactory;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public ScheduledService(IOptions<AppSettings> appSettings, ILogger<ScheduledService> logger, IHttpClientFactory clientFactory, IServiceScopeFactory scopeFactory)
        {
            _schedule = CrontabSchedule.Parse(Schedule);
            _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
            _appSettings = appSettings.Value;
            _logger = logger;
            _clientFactory = clientFactory;
            _serviceScopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Yield();

            _logger.LogInformation("ScheduledService started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    if (now > _nextRun)
                    {
                        await Process();
                        _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unhandled exception occurred, will retry processing at next interval");
                }

                await Task.Delay(15000, stoppingToken);
            }
        }

        private async Task Process()
        {
            _logger.LogInformation("Starting background processing");

            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string storageAccountName = _appSettings.MediaStorageAccountName;
            string imageContainerName = _appSettings.MediaStorageImageContainer;
            string indexContainerName = _appSettings.MediaStorageIndexContainer;

            // Initialize blob container clients
            BlobContainerClient imageBlobContainerClient;
            BlobContainerClient indexBlobContainerClient;

            if (!string.IsNullOrEmpty(storageConnectionString))
            {
                imageBlobContainerClient = new BlobContainerClient(storageConnectionString, imageContainerName);
                indexBlobContainerClient = new BlobContainerClient(storageConnectionString, indexContainerName);
            }
            else
            {
                string imageContainerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}",
                    storageAccountName, imageContainerName);
                imageBlobContainerClient = new BlobContainerClient(new Uri(imageContainerEndpoint), new DefaultAzureCredential());

                string indexContainerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}",
                    storageAccountName, indexContainerName);
                indexBlobContainerClient = new BlobContainerClient(new Uri(indexContainerEndpoint), new DefaultAzureCredential());
            }

            List<InternetTableItems> items;
            try
            {
                // Retrieve pending transfer items
                items = await GetInternetTableItems();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Got exception while retriving media transfer items");
                return;
            }

            _logger.LogInformation($"Found {items.Count} items to process");
            foreach (InternetTableItems item in items)
            {
                //first retrieve image
                HttpContent imageContent = await GetImageByURL(item.fileURL);
                string encodedFileName = Path.GetFileName(item.fileURL);
                string fileName = HttpUtility.UrlDecode(encodedFileName);
                await ImageUploadToBlob(imageBlobContainerClient, imageContent, fileName);

                //retrieve thumbnail
                HttpContent thumbnailContent = await GetImageByURL(item.thumbnailURL);
                string encodedThumbnailFileName = Path.GetFileName(item.thumbnailURL);
                string thumbnailFileName = HttpUtility.UrlDecode(encodedThumbnailFileName);
                await ImageUploadToBlob(imageBlobContainerClient, thumbnailContent, thumbnailFileName);

                //create new object to serialize to json
                var mediaItem = new MediaItem()
                {
                    Id = item.id,
                    Name = item.name,
                    DateTaken = item.dateTaken,
                    Location = JsonConvert.DeserializeObject<GeographyPoint>(item.location, new GeographyPointJsonConverter()),
                    Tag = item.tag.Split(",").ToArray(),
                    Caption = item.caption,
                    Author = item.author,
                    UploadDate = item.uploadDate,
                    FileURL = "/api/assets/" + encodedFileName,
                    ThumbnailURL = "/api/assets/" + encodedThumbnailFileName,
                    Project = item.project,
                    Event = item.@event,
                    LocationName = item.locationName,
                    Copyright = item.copyright
                };

                //upload to indexer blob
                string indexFileName = item.id + ".json";
                await IndexUploadToBlob(indexBlobContainerClient, mediaItem, indexFileName);

                // Remove item from transfers list
                await DeleteInternetTableItem(item);

                _logger.LogInformation("Uploaded item {ID} into {URL}", item.id, indexFileName);
            }

            _logger.LogInformation("Finished background processing");
        }

        private async Task DeleteInternetTableItem(InternetTableItems item)
        {
            var request = new HttpRequestMessage(HttpMethod.Delete, $"api/v1/transfer/mediaItems/{item.id}");

            var client = _clientFactory.CreateClient();
            client.BaseAddress = new Uri(_appSettings.ApiDomain);
            client.DefaultRequestHeaders.Add("X-Api-Key", _appSettings.ApiKey);
            var response = await client.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return;
            }
            else
            {
                throw new Exception($"API response is not successful, the status code is {response.StatusCode} with content {await response.Content.ReadAsStringAsync()}");
            }
        }

        private async Task<List<InternetTableItems>> GetInternetTableItems()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "api/v1/transfer/mediaItems");

            var client = _clientFactory.CreateClient();
            client.BaseAddress = new Uri(_appSettings.ApiDomain);
            client.DefaultRequestHeaders.Add("X-Api-Key", _appSettings.ApiKey);
            var response = await client.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var items = JsonConvert.DeserializeObject<List<InternetTableItems>>(result);

                //Adding into database
                using (var scope = _serviceScopeFactory.CreateScope())
                {
                    var dashboardActivityContext = scope.ServiceProvider.GetRequiredService<DashboardActivityService>();
                    var fileDetailsContext = scope.ServiceProvider.GetRequiredService<FileDetailsService>();
                    foreach (InternetTableItems item in new List<InternetTableItems>(items))
                    {
                        //Get filesize
                        HttpContent thumbnailContent = await GetImageByURL(item.thumbnailURL);
                        var stream = await thumbnailContent.ReadAsStreamAsync();
                        decimal fileSize = (decimal)stream.Length / 1048576;
                        //Get the location
                        var itemLocation = JsonConvert.DeserializeObject<GeographyPoint>(item.location, new GeographyPointJsonConverter());
                        //Get file name
                        string encodedThumbnailFileName = Path.GetFileName(item.thumbnailURL);

                        FileDetails fileDetails = new FileDetails();
                        DashboardActivity dashboardActivity = new DashboardActivity();

                        //Add into FileDetails table
                        fileDetails.FDetailsId = Guid.NewGuid();
                        fileDetails.FileId = item.id;
                        fileDetails.FileSize = Math.Round(fileSize, 2);
                        if (itemLocation != null) //Check if there are any geotag location
                        {
                            Point point = new Point(itemLocation.Longitude, itemLocation.Latitude) { SRID = 4326 };
                            fileDetails.AreaPoint = point;
                        }
                        fileDetails.ThumbnailURL = "/api/assets/" + encodedThumbnailFileName;
                        if (await fileDetailsContext.AddDetailsAsync(fileDetails))
                        {
                            _logger.LogInformation("Added {FileId} into FileDetails", fileDetails.FileId);
                        }

                        //Add into DashboardActivity Table
                        dashboardActivity.DActivityId = Guid.NewGuid();
                        dashboardActivity.FileId = item.id;
                        dashboardActivity.Email = item.author;
                        dashboardActivity.ActivityDateTime = DateTime.Now;
                        dashboardActivity.Activity = 2;
                        if (await dashboardActivityContext.AddActivityAsync(dashboardActivity))
                        {
                            _logger.LogInformation("Added {FileId} into DashboardActivity", dashboardActivity.FileId);
                        }

                    }
                }

                return items;
            }
            else
            {
                throw new Exception($"API response is not successful, the status code is {response.StatusCode} with content {await response.Content.ReadAsStringAsync()}");
            }
        }

        private async Task<HttpContent> GetImageByURL(string imageURL)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "api/v1/transfer/fileContents");
            var requestBody = JsonConvert.SerializeObject(new ImageURLItem() { Path = imageURL });
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var client = _clientFactory.CreateClient();
            client.BaseAddress = new Uri(_appSettings.ApiDomain);
            client.DefaultRequestHeaders.Add("X-Api-Key", _appSettings.ApiKey);
            var response = await client.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return response.Content;
            }
            else
            {
                throw new Exception($"API response is not successful, the status code is {response.StatusCode} with content {await response.Content.ReadAsStringAsync()}");
            }
        }

        private static async Task ImageUploadToBlob(BlobContainerClient blobContainerClient, HttpContent content, string fileName)
        {
            // Get image stream
            var stream = await content.ReadAsStreamAsync();

            //create a blob
            var blobClient = blobContainerClient.GetBlobClient(fileName);
            var blobUploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = content.Headers.ContentType.ToString()
                }
            };

            await blobClient.UploadAsync(stream, blobUploadOptions);
        }

        private static async Task IndexUploadToBlob(BlobContainerClient blobContainerClient, MediaItem mediaItem, string fileName)
        {
            //convert string to stream
            var stream = new MemoryStream();
            JsonHelper.WriteJsonToStream(mediaItem, stream);

            //create a blob
            var blobClient = blobContainerClient.GetBlobClient(fileName);
            var blobUploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = "application/json"
                }
            };

            await blobClient.UploadAsync(stream, blobUploadOptions);
        }
    }
}
