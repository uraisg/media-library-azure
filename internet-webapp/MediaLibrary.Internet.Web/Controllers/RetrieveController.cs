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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Newtonsoft.Json.Linq;
using System.Net.Http.Headers;

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
            //check request header for authorization key
            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = AuthenticationHeaderValue.Parse(Request.Headers["Authorization"]);
                var credentialBytes = Convert.FromBase64String(authHeader.Parameter);
                var credentials = Encoding.UTF8.GetString(credentialBytes).Split(new[] { ':' }, 2);
                var username = credentials[0];
                var password = credentials[1];

                bool nameMatch = username.Equals(_appSettings.ApiName);
                bool passwordMatch = password.Equals(_appSettings.ApiPassword);

                if(nameMatch && passwordMatch)
                {
                    string tableName = _appSettings.TableName;
                    string tableConnectionString = _appSettings.TableConnectionString;

                    string partitionKey = hour;

                    List<ImageEntity> listEntities = new List<ImageEntity>();

                    //initialize table client
                    CloudStorageAccount storageAccount;
                    storageAccount = CloudStorageAccount.Parse(tableConnectionString);
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
                else
                {
                    return Unauthorized();
                }
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        [ActionName("image")]
        public async Task<IActionResult> GetImage()
        {
            //check request header for authorization key
            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = AuthenticationHeaderValue.Parse(Request.Headers["Authorization"]);
                var credentialBytes = Convert.FromBase64String(authHeader.Parameter);
                var credentials = Encoding.UTF8.GetString(credentialBytes).Split(new[] { ':' }, 2);
                var username = credentials[0];
                var password = credentials[1];

                bool nameMatch = username.Equals(_appSettings.ApiName);
                bool passwordMatch = password.Equals(_appSettings.ApiPassword);

                if(nameMatch && passwordMatch)
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
                    BlobClient blobClient = new BlobClient(new System.Uri(imageUrl), credential);
                    BlobDownloadInfo content = await blobClient.DownloadAsync();

                    //return stream content
                    return Ok(content.Content);
                }
                else
                {
                    return Unauthorized();
                }
            }
            else
            {
                return Unauthorized();
            }
            
        }
    }
}
