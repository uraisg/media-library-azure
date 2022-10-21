using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ImageMagick;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Models;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision.Models;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MediaLibrary.Internet.Web.Controllers
{
    public class ImageUploadController : Controller
    {
        private static readonly string TransferPartitionKey = "transfer";
        private static readonly string DraftPartitionKey = "draft";

        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;

        public ImageUploadController(IOptions<AppSettings> appSettings, ILogger<ImageUploadController> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("FileUpload/{rowkey}")]
        public async Task<JsonResult> Index(string rowkey)
        {
            _logger.LogInformation("{UserName} uploading to intranet", User.Identity.Name);

            try
            {
                string tableConnectionString = _appSettings.TableConnectionString;
                string tableName = _appSettings.TableName;

                //initialize table client
                CloudStorageAccount storageAccount;
                storageAccount = CloudStorageAccount.Parse(tableConnectionString);
                CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
                CloudTable table = tableClient.GetTableReference(tableName);

                TableOperation retrieveOperation = TableOperation.Retrieve<Draft>(
                    partitionKey: DraftPartitionKey,
                    rowkey: rowkey
                );

                TableResult result = await table.ExecuteAsync(retrieveOperation);

                // Check if the draft author and user are the same person
                var obj = JsonConvert.DeserializeObject<Draft>(JsonConvert.SerializeObject(result.Result));
                if (User.Identity.Name != obj.Author)
                {
                    return Json(new
                    {
                        success = false,
                        errorMessage = "The draft does not exist or the user logged in is not the same as the draft's author."
                    });
                }

                string resultJSON = JsonConvert.SerializeObject(result.Result);
                JObject resultObject = JObject.Parse(resultJSON);
                JArray jsonArray = JArray.Parse(resultObject["ImageEntities"].ToString());

                // Upload To Be Transfered Files
                foreach (var image in jsonArray)
                {
                    string id = GenerateId();

                    //create json for indexing
                    ImageEntity json = new ImageEntity();
                    json.PartitionKey = TransferPartitionKey;
                    json.RowKey = id;
                    json.Id = id;
                    json.Name = image["Name"].ToString();
                    json.DateTaken = DateTime.Parse(image["DateTaken"].ToString());
                    json.Location = JsonConvert.SerializeObject(image["Location"].ToString());
                    json.Tag = image["Tag"].ToString();
                    json.Caption = image["Caption"].ToString();
                    json.Author = image["Author"].ToString();
                    json.UploadDate = DateTime.Parse(image["UploadDate"].ToString());
                    json.FileURL = image["FileURL"].ToString();
                    json.ThumbnailURL = image["ThumbnailURL"].ToString();
                    json.Project = image["Project"].ToString();
                    json.LocationName = image["LocationName"].ToString();
                    json.Copyright = image["Copyright"].ToString();
                    json.AdditionalField = JsonConvert.DeserializeObject<List<object>>(image["AdditionalField"].ToString());

                    await IndexUploadToTable(json, _appSettings);
                }

                // Remove draft
                var tableEntity = new Draft
                {
                    PartitionKey = DraftPartitionKey,
                    RowKey = rowkey,
                    ETag = "*"
                };

                TableOperation deleteOperation = TableOperation.Delete(tableEntity);
                await table.ExecuteAsync(deleteOperation);

                return Json(new
                {
                    success = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Got exception while uploading files to intranet.");

                return Json(new
                {
                    success = false,
                    errorMessage = "Failed to upload draft. Please correct the errors and try again."
                });
            }
        }

        /// <summary>
        /// Generate a new ID (random 16 character string using Base58 alphabet).
        /// </summary>
        /// <returns>A new ID.</returns>
        private static string GenerateId()
        {
            var base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            return Nanoid.Nanoid.Generate(base58Alphabet, 16);
        }

        private static async Task<string> ImageUploadToBlob(string fileName, MemoryStream imageStream, string contentType, AppSettings appSettings)
        {
            var containerName = appSettings.MediaStorageContainer;
            var storageConnectionString = appSettings.MediaStorageConnectionString;

            //create a blob container client
            BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString, containerName);

            //create a blob
            BlobClient blobClient = blobContainerClient.GetBlobClient(fileName);
            var blobUploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                }
            };

            await blobClient.UploadAsync(imageStream, blobUploadOptions);

            //get url (without query string as it will contain SAS token if used in connection string)
            string url = blobClient.Uri.GetLeftPart(UriPartial.Path);
            return url;
        }

        public static DateTime TruncateMilliseconds(DateTime dateTime)
        {
            return dateTime.AddTicks(-(dateTime.Ticks % TimeSpan.TicksPerSecond));
        }

        private static async Task IndexUploadToTable(ImageEntity json, AppSettings appSettings)
        {
            string tableName = appSettings.TableName;
            string tableConnectionString = appSettings.TableConnectionString;

            //initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(tableConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            JArray jsonArray = new JArray();
            foreach (var i in json.AdditionalField)
            {
                JObject additionalFields = JObject.FromObject(i);
                jsonArray.Add(additionalFields);
            }

            json.Location = json.Location.Replace("\\", "");
            json.Location = json.Location.Substring(1, json.Location.Length - 2);

            TransferEntity transferEntity = new TransferEntity()
            {
                RowKey = json.RowKey,
                Id = json.Id,
                Name = json.Name,
                DateTaken = json.DateTaken,
                Location = json.Location,
                Tag = json.Tag,
                Caption = json.Caption,
                Author = json.Author,
                UploadDate = json.UploadDate,
                FileURL = json.FileURL,
                ThumbnailURL = json.ThumbnailURL,
                Project = json.Project,
                Event = json.Event,
                LocationName = json.LocationName,
                Copyright = json.Copyright,
                AdditionalField = jsonArray.ToString()
            };

            TableOperation insertOperation = TableOperation.Insert(transferEntity);
            await table.ExecuteAsync(insertOperation);
        }

        public class TransferEntity : TableEntity
        {
            public TransferEntity()
            {
                PartitionKey = TransferPartitionKey;
                RowKey = Guid.NewGuid().ToString();
            }
            public string Id { get; set; }
            public string Name { get; set; }
            public DateTime DateTaken { get; set; }
            public string Location { get; set; }
            public string Tag { get; set; }
            public string Caption { get; set; }
            public string Author { get; set; }
            public DateTime UploadDate { get; set; }
            public string FileURL { get; set; }
            public string ThumbnailURL { get; set; }
            public string Project { get; set; }
            public string Event { get; set; }
            public string LocationName { get; set; }
            public string Copyright { get; set; }
            public string AdditionalField { get; set; }
        }
    }
}
