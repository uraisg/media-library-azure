using MediaLibrary.Intranet.Web.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using NCrontab;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.IO;
using System.Text;
using Azure.Storage.Blobs;

namespace MediaLibrary.Intranet.Web.Background
{
    public class ScheduledService : BackgroundService
    {
        private CrontabSchedule _schedule;
        private DateTime _nextRun;
        //Run every 1 hour
        private string Schedule => "0 0 0/1 ? * * *";

        private readonly AppSettings _appSettings;

        public ScheduledService(IOptions<AppSettings> appSettings)
        {
            _schedule = CrontabSchedule.Parse(Schedule, new CrontabSchedule.ParseOptions { IncludingSeconds = true });
            _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
            _appSettings = appSettings.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            do
            {
                var now = DateTime.Now;
                var nextrun = _schedule.GetNextOccurrence(now);
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
            string url = _appSettings.InternetTableAPI;
            string imageAPI = _appSettings.InternetImageAPI;
            string containerConnectionString = _appSettings.MediaStorageConnectionString;
            string imageContainerName = _appSettings.MediaStorageImageContainer;
            string indexContainerName = _appSettings.MediaStorageIndexContainer;

            //retrieve the index from past 1 hour
            string partition = DateTime.UtcNow.AddHours(7).Hour.ToString();
            InternetTableItems[] items = await GetInternetTableItems(url, partition);

            foreach(InternetTableItems item in items)
            {
                //first retrieve image
                Stream imageStream = await GetImageByURL(imageAPI, item.fileURL);
                BlobContainerClient ImageBlobContainerClient = new BlobContainerClient(containerConnectionString, imageContainerName);
                string newFileURL = await ImageUploadToBlob(ImageBlobContainerClient, imageStream, item.name);

                //process to coordinate object
                CoordinateObj newCoordinateObject = ProcessCoordinate(item.location);

                //process tag array
                List<string> tags = item.tag.Split(",").ToList();

                //create new json object
                ImageMetadata json = new ImageMetadata()
                {
                    Name = item.name,
                    DateTaken = item.dateTaken,
                    Location = newCoordinateObject,
                    Tag = tags,
                    UploadDate = item.uploadDate,
                    FileURL = newFileURL,
                    Project = item.project,
                    Event = item._event,
                    LocationName = item.locationName,
                    Copyright = item.copyright
                };

                string serialized = JsonConvert.SerializeObject(json);

                //upload to indexer blob
                BlobContainerClient IndexBlobContainerClient = new BlobContainerClient(containerConnectionString, indexContainerName);
                await IndexUploadToBlob(IndexBlobContainerClient, serialized);
                Console.WriteLine($"Uploaded {item.name} into {newFileURL}.");
            }
        }

        private static async Task<InternetTableItems[]> GetInternetTableItems(string url,string partition)
        {
            var http = new HttpClient();
            string requestURL = url + partition;
            var response = await http.GetAsync(requestURL);
            var result = await response.Content.ReadAsStringAsync();
            result = result.Replace("event", "_event");
            InternetTableItems[] items = JsonConvert.DeserializeObject<InternetTableItems[]>(result);
            return items;
        }

        private static async Task<Stream> GetImageByURL(string url, string imageURL)
        {
            ImageURLItem itemBody = new ImageURLItem()
            {
                url = imageURL
            };

            string requestBody = JsonConvert.SerializeObject(itemBody);
            var requestBodyData = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var http = new HttpClient();
            var response = await http.PostAsync(url, requestBodyData);
            var result = await response.Content.ReadAsStreamAsync();
            return result;
        }

        private static async Task<string> ImageUploadToBlob(BlobContainerClient blobContainerClient, Stream imageStream, string fileName)
        {
            //create a blob
            //use guid together with file name to avoid duplication
            string blobFileName = Guid.NewGuid().ToString() + "_" + fileName;
            BlobClient blobClient = blobContainerClient.GetBlobClient(blobFileName);

            await blobClient.UploadAsync(imageStream, true);

            //get url
            string url = blobClient.Uri.AbsoluteUri.ToString();
            return url;
        }

        private static CoordinateObj ProcessCoordinate(string input)
        {
            string json = input.Replace("\\", "");
            CoordinateObj obj = JsonConvert.DeserializeObject<CoordinateObj>(json);
            return obj;
        }

        private static async Task IndexUploadToBlob(BlobContainerClient blobContainerClient, string index)
        {
            //create a blob
            string fileName = Guid.NewGuid().ToString() + ".json";
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
