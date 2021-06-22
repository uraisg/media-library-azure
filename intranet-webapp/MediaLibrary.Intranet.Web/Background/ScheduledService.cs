using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Spatial;
using NCrontab;
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

        public ScheduledService(IOptions<AppSettings> appSettings, ILogger<ScheduledService> logger, IHttpClientFactory clientFactory)
        {
            _schedule = CrontabSchedule.Parse(Schedule);
            _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
            _appSettings = appSettings.Value;
            _logger = logger;
            _clientFactory = clientFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            do
            {
                var now = DateTime.Now;
                if (now > _nextRun)
                {
                    await Process();
                    _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
                }
                await Task.Delay(5000, stoppingToken);
            }
            while (!stoppingToken.IsCancellationRequested);
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
                string fileName = Path.GetFileName(item.fileURL);
                await ImageUploadToBlob(imageBlobContainerClient, imageContent, fileName);

                //retrieve thumbnail
                HttpContent thumbnailContent = await GetImageByURL(item.thumbnailURL);
                string thumbnailFileName = Path.GetFileName(item.thumbnailURL);
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
                    FileURL = "/api/assets/" + fileName,
                    ThumbnailURL = "/api/assets/" + thumbnailFileName,
                    Project = item.project,
                    Event = item._event,
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
                result = result.Replace("event", "_event");
                var items = JsonConvert.DeserializeObject<List<InternetTableItems>>(result);
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
