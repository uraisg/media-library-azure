using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Newtonsoft.Json.Linq;

namespace MediaLibrary.Internet.Web.Controllers
{
    [Route("/api/[controller]/[action]")]
    [ApiController]
    public class RetrieveController : ControllerBase
    {
        private readonly AppSettings _appSettings;

        public RetrieveController(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        [HttpGet("{hour}")]
        [ActionName("table")]
        public async Task<IActionResult> GetTable(string hour)
        {
            string tableName = _appSettings.MediaStorageTable;
            string storageConnectionString = _appSettings.MediaStorageConnectionString;

            string partitionKey = hour;

            List<ImageEntity> listEntities = new List<ImageEntity>();

            //initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(storageConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            //query by partition key
            try
            {
                TableQuery<ImageEntity> partitionScanQuery = new TableQuery<ImageEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, partitionKey));

                TableContinuationToken token = null;

                do
                {
                    TableQuerySegment<ImageEntity> segment = await table.ExecuteQuerySegmentedAsync(partitionScanQuery, token);
                    token = segment.ContinuationToken;
                    foreach (ImageEntity entity in segment)
                    {
                        listEntities.Add(entity);
                    }
                }
                while (token != null);

                //return array
                return Ok(listEntities);
            }
            catch (StorageException e)
            {
                return NotFound();
                throw;
            }
        }

        [HttpPost]
        [ActionName("image")]
        public async Task<IActionResult> GetImage()
        {
            string requestbody;

            var storageAccountName = _appSettings.MediaStorageAccountName;
            var storageAccountKey = _appSettings.MediaStorageAccountKey;

            //get request body
            using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
            {
                requestbody = await reader.ReadToEndAsync();
            }

            //get the image url
            var json = JObject.Parse(requestbody);
            string imageUrl = (string)json["url"];

            //authenticate with blob and down image via URL
            StorageSharedKeyCredential credential = new StorageSharedKeyCredential(storageAccountName, storageAccountKey);           
            BlobClient blobClient = new BlobClient(new System.Uri(imageUrl),credential);
            BlobDownloadInfo content = await blobClient.DownloadAsync();

            //return stream content
            return Ok(content.Content);
        }
    }
}
