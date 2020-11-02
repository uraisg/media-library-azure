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
using System.Data.SqlClient;

namespace MediaLibrary.Intranet.Web.Background
{
    public class ScheduledService : BackgroundService
    {
        private CrontabSchedule _schedule;
        private DateTime _nextRun;
        //Run every 1 hour
        private string Schedule => "0 0/1 * * * *";

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
            string cred = _appSettings.ApiName + ":" + _appSettings.ApiPassword;
            string sql_conn = _appSettings.SqlConnection;

            //retrieve the index from past 2 min
            string partition = DateTime.UtcNow.AddHours(8).AddMinutes(-2).Minute.ToString();
            InternetTableItems[] items = await GetInternetTableItems(url, partition,cred);

            foreach(InternetTableItems item in items)
            {
                //first retrieve image
                Stream imageStream = await GetImageByURL(imageAPI, item.fileURL,cred);
                BlobContainerClient ImageBlobContainerClient = new BlobContainerClient(containerConnectionString, imageContainerName);
                string newFileURL = await ImageUploadToBlob(ImageBlobContainerClient, imageStream, item.name);

                //retrieve thumbnail
                Stream tnStream = await GetImageByURL(imageAPI, item.thumbnailURL, cred);
                string newtnURL = await ImageUploadToBlob(ImageBlobContainerClient, tnStream, item.name);

                //process to coordinate object
                CoordinateObj newCoordinateObject = ProcessCoordinate(item.location);

                //process tag array
                List<string> _tags = item.tag.Split(",").ToList();
                string tags = ProcessTag(_tags);

                //create new json object
                ImageMetadata json = new ImageMetadata()
                {
                    Name = Guid.NewGuid().ToString(),
                    DateTaken = item.dateTaken,
                    Location = newCoordinateObject,
                    Tag = tags,
                    Caption = item.caption,
                    Author = item.author,
                    UploadDate = item.uploadDate,
                    FileURL = "/api/assets/" + newFileURL,
                    ThumbnailURL = "/api/assets/" + newtnURL,
                    Project = item.project,
                    Event = item._event,
                    LocationName = item.locationName,
                    Copyright = item.copyright
                };

                //string serialized = JsonConvert.SerializeObject(json);

                //upload to indexer blob
                //BlobContainerClient IndexBlobContainerClient = new BlobContainerClient(containerConnectionString, indexContainerName);
                //await IndexUploadToBlob(IndexBlobContainerClient, serialized);
                //Console.WriteLine($"Uploaded {item.name} into {newFileURL}.");

                //Insert into SQL
                InsertIntoSQL(json, sql_conn);
                Console.WriteLine("Created new entry");
            }
        }

        private static async Task<InternetTableItems[]> GetInternetTableItems(string url,string partition,string cred)
        {
            var http = new HttpClient();
            string requestURL = url + partition;
            var byteArray = Encoding.ASCII.GetBytes(cred);
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
            var response = await http.GetAsync(requestURL);
            var result = await response.Content.ReadAsStringAsync();
            result = result.Replace("event", "_event");
            InternetTableItems[] items = JsonConvert.DeserializeObject<InternetTableItems[]>(result);
            return items;
        }

        private static async Task<Stream> GetImageByURL(string url, string imageURL, string cred)
        {
            ImageURLItem itemBody = new ImageURLItem()
            {
                url = imageURL
            };

            string requestBody = JsonConvert.SerializeObject(itemBody);
            var requestBodyData = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var http = new HttpClient();
            var byteArray = Encoding.ASCII.GetBytes(cred);
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
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

            //return filename
            return blobFileName;
        }

        private static CoordinateObj ProcessCoordinate(string input)
        {
            string json = input.Replace("\\", "");
            CoordinateObj obj = JsonConvert.DeserializeObject<CoordinateObj>(json);
            return obj;
        }

        private static string ProcessTag (List<string> inputs)
        {
            string result = "";
            foreach(string input in inputs)
            {
                result = result + "\"" + input + "\",";
            }
            result = result.TrimEnd(',');
            result = "[" + result + "]";
            return result;
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

        private static void InsertIntoSQL(ImageMetadata json, string db_conn)
        {
            SqlConnection conn = new SqlConnection(db_conn);
            string query = string.Format("INSERT INTO Indexer(Name, DateTaken, Location, Tag, Caption, Author, UploadDate, FileURL, ThumbnailURL, Project, Event, LocationName, Copyright) " +
                "VALUES('{0}','{1}','{2}','{3}', '{4}', '{5}', '{6}', '{7}', '{8}','{9}', '{10}', '{11}', '{12}')",
                json.Name,json.DateTaken,json.Location,json.Tag,json.Caption,json.Author,json.UploadDate,json.FileURL,json.ThumbnailURL,json.Project,json.Event,json.LocationName,json.Copyright);

            SqlCommand command = new SqlCommand(query, conn);
            try
            {
                conn.Open();
                command.ExecuteNonQuery();
            }
            catch (SqlException e)
            {
                Console.WriteLine(e);
            }
            finally
            {
                conn.Close();
            }
        }
    }
}
