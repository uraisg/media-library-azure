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
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
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
        //Run every 1 hour
        private string Schedule => "0 0/1 * * * *";

        private readonly AppSettings _appSettings;
        private readonly ILogger<ScheduledService> _logger;
        private readonly IHttpClientFactory _clientFactory;

        public ScheduledService(IOptions<AppSettings> appSettings, ILogger<ScheduledService> logger, IHttpClientFactory clientFactory)
        {
            _schedule = CrontabSchedule.Parse(Schedule, new CrontabSchedule.ParseOptions { IncludingSeconds = true });
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

            string url = _appSettings.InternetTableAPI;
            string imageAPI = _appSettings.InternetImageAPI;
            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string storageAccountName = _appSettings.MediaStorageAccountName;
            string imageContainerName = _appSettings.MediaStorageImageContainer;
            string indexContainerName = _appSettings.MediaStorageIndexContainer;
            string cred = _appSettings.ApiName + ":" + _appSettings.ApiPassword;

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

            //retrieve the index from past 2 min
            string partition = DateTime.UtcNow.AddHours(8).AddMinutes(-2).Minute.ToString();
            InternetTableItems[] items = await GetInternetTableItems(url, partition, cred);

            _logger.LogInformation($"Found {items.Length} items to process");
            foreach (InternetTableItems item in items)
            {
                //first retrieve image
                Stream imageStream = await GetImageByURL(imageAPI, item.fileURL, cred);
                string fileName = Path.GetFileName(item.fileURL);
                await ImageUploadToBlob(imageBlobContainerClient, imageStream, fileName);

                //retrieve thumbnail
                Stream tnStream = await GetImageByURL(imageAPI, item.thumbnailURL, cred);
                string thumbnailFileName = Path.GetFileName(item.thumbnailURL);
                await ImageUploadToBlob(imageBlobContainerClient, tnStream, thumbnailFileName);

                //process to coordinate object
                CoordinateObj newCoordinateObject = ProcessCoordinate(item.location);

                //process tag array
                List<string> tags = item.tag.Split(",").ToList();

                //create new json object
                ImageMetadata json = new ImageMetadata()
                {
                    Id = item.id,
                    Name = item.name,
                    DateTaken = item.dateTaken,
                    Location = newCoordinateObject,
                    Tag = tags,
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

                string serialized = JsonConvert.SerializeObject(json);

                //upload to indexer blob
                string indexFileName = item.id + ".json";
                await IndexUploadToBlob(indexBlobContainerClient, serialized, indexFileName);
                _logger.LogInformation("Uploaded item {ID} into {URL}", item.id, indexFileName);
            }

            _logger.LogInformation("Finished background processing");
        }

        private async Task<InternetTableItems[]> GetInternetTableItems(string url,string partition, string cred)
        {
            var http = _clientFactory.CreateClient();
            string requestURL = url + partition;
            var byteArray = Encoding.ASCII.GetBytes(cred);
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
            var response = await http.GetAsync(requestURL);
            var result = await response.Content.ReadAsStringAsync();
            result = result.Replace("event", "_event");
            InternetTableItems[] items = JsonConvert.DeserializeObject<InternetTableItems[]>(result);
            return items;
        }

        private async Task<Stream> GetImageByURL(string url, string imageURL, string cred)
        {
            ImageURLItem itemBody = new ImageURLItem()
            {
                url = imageURL
            };

            string requestBody = JsonConvert.SerializeObject(itemBody);
            var requestBodyData = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var http = _clientFactory.CreateClient();
            var byteArray = Encoding.ASCII.GetBytes(cred);
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
            var response = await http.PostAsync(url, requestBodyData);
            var result = await response.Content.ReadAsStreamAsync();
            return result;
        }

        private static async Task ImageUploadToBlob(BlobContainerClient blobContainerClient, Stream imageStream, string fileName)
        {
            //create a blob
            BlobClient blobClient = blobContainerClient.GetBlobClient(fileName);

            await blobClient.UploadAsync(imageStream, true);
        }

        private static CoordinateObj ProcessCoordinate(string input)
        {
            string json = input.Replace("\\", "");
            CoordinateObj obj = JsonConvert.DeserializeObject<CoordinateObj>(json);
            return obj;
        }

        private static async Task IndexUploadToBlob(BlobContainerClient blobContainerClient, string index, string fileName)
        {
            //create a blob
            BlobClient blobClient = blobContainerClient.GetBlobClient(fileName);

            //convert string to stream
            MemoryStream content = new MemoryStream();
            StreamWriter writer = new StreamWriter(content);
            writer.Write(index);
            writer.Flush();
            content.Position = 0;
            await blobClient.UploadAsync(content, true);
        }
    }
}
