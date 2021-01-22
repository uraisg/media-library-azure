using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;

namespace MediaLibrary.Internet.Web.Controllers
{
    [Route("/api/[controller]/[action]")]
    [ApiController]
    public class RetrieveController : ControllerBase
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;

        public RetrieveController(IOptions<AppSettings> appSettings, ILogger<RetrieveController> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
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

                if (nameMatch && passwordMatch)
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
                        _logger.LogWarning(e, "Error while executing query");
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

                if (nameMatch && passwordMatch)
                {
                    string requestbody;

                    var storageConnectionString = _appSettings.MediaStorageConnectionString;
                    var containerName = _appSettings.MediaStorageContainer;

                    //get request body
                    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
                    {
                        requestbody = await reader.ReadToEndAsync();
                    }

                    //get the image url
                    var json = JObject.Parse(requestbody);
                    string imageUrl = (string)json["url"];

                    //authenticate with blob and down image via URL
                    var blobUriBuilder = new BlobUriBuilder(new Uri(imageUrl));
                    BlobClient blobClient = new BlobClient(storageConnectionString, containerName, blobUriBuilder.BlobName);
                    try
                    {
                        BlobDownloadInfo download = await blobClient.DownloadAsync();
                        return File(download.Content, download.ContentType);
                    }
                    catch (RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.BlobNotFound)
                    {
                        return NotFound();
                    }
                }
                else
                {
                    _logger.LogInformation("Incorrect user name or password");
                    return Unauthorized();
                }
            }
            else
            {
                _logger.LogInformation("Missing \"Authentication\" header");
                return Unauthorized();
            }

        }
    }
}
