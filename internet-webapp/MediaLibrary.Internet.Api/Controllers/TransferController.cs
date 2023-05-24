using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;
using MediaLibrary.Api.Web.Models;

namespace MediaLibrary.Internet.Api.Controllers
{
    [Route("/api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles = UserRole.User)]
    public class TransferController : ControllerBase
    {
        private static readonly string TransferPartitionKey = "transfer";

        private readonly AppSettings _appSettings;
        private readonly ILogger<TransferController> _logger;

        public TransferController(IOptions<AppSettings> appSettings, ILogger<TransferController> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        [HttpGet("mediaItems")]
        [SwaggerOperation(
            Summary = "Return list of media items that are pending transfer",
            OperationId = "GetMediaItems"
        )]
        [Produces("application/json")]
        [SwaggerResponse(StatusCodes.Status200OK, "Successful operation", typeof(IEnumerable<ImageEntity>))]
        public async Task<IActionResult> GetAllAsync()
        {
            _logger.LogInformation("Listing all transfer items");

            string tableName = _appSettings.TableName;
            string tableConnectionString = _appSettings.TableConnectionString;

            List<ImageEntity> listEntities = new List<ImageEntity>();

            // Initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(tableConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            // Query by partition key
            TableQuery<ImageEntity> partitionScanQuery = new TableQuery<ImageEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, TransferPartitionKey));
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

            return Ok(listEntities);
        }

        [HttpDelete("mediaItems/{id}")]
        [SwaggerOperation(
            Summary = "Removes a media transfer item by its ID",
            OperationId = "DeleteMediaItem"
        )]
        [Produces("application/json")]
        [SwaggerResponse(StatusCodes.Status204NoContent, "The media transfer item was removed")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Media item not found")]
        public async Task<IActionResult> DeleteItemAsync(string id)
        {
            _logger.LogInformation("Delete content for id {id}", id);

            string tableName = _appSettings.TableName;
            string tableConnectionString = _appSettings.TableConnectionString;
            string containerName = _appSettings.MediaStorageContainer;
            string storageConnectionString = _appSettings.MediaStorageConnectionString;


            // Initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(tableConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            // Initialize blob container client
            BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString, containerName);

            string rowKey = id;
            TableOperation retrieveOperation = TableOperation.Retrieve<ImageEntity>(TransferPartitionKey, rowKey);
            TableResult result = await table.ExecuteAsync(retrieveOperation);
            ImageEntity entity = result.Result as ImageEntity;

            if (entity == null)
            {
                _logger.LogWarning("Item id {id} not found", id);
                return NotFound();
            }

            var blobUriBuilder = new BlobUriBuilder(new Uri(entity.FileURL));
            BlobClient blobClient = blobContainerClient.GetBlobClient(blobUriBuilder.BlobName);
            await blobClient.DeleteIfExistsAsync();

            blobUriBuilder = new BlobUriBuilder(new Uri(entity.ThumbnailURL));
            blobClient = blobContainerClient.GetBlobClient(blobUriBuilder.BlobName);
            await blobClient.DeleteIfExistsAsync();

            TableOperation deleteOperation = TableOperation.Delete(entity);
            result = await table.ExecuteAsync(deleteOperation);

            return NoContent();
        }

        [HttpPost("fileContents")]
        [SwaggerOperation(
            Summary = "Retrieves file contents by path",
            OperationId = "GetFileContents"
        )]
        [Consumes("application/json")]
        [Produces("application/json", "image/jpeg", "image/png", "image/gif", "image/bmp")]
        [SwaggerResponse(StatusCodes.Status200OK, "Successful operation", typeof(FileStreamResult))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Path not found")]
        public async Task<IActionResult> GetFileContentAsync(
            [FromBody, SwaggerRequestBody("Path to the file", Required = true)] FileContentParams parms)
        {
            _logger.LogInformation("Getting content for file path: {path}", parms.Path);

            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string containerName = _appSettings.MediaStorageContainer;

            // Authenticate with storage and download image via URL
            var blobUriBuilder = new BlobUriBuilder(new Uri(parms.Path));
            BlobClient blobClient = new BlobClient(storageConnectionString, containerName, blobUriBuilder.BlobName);
            try
            {
                BlobDownloadInfo download = await blobClient.DownloadAsync();
                return File(download.Content, download.ContentType);
            }
            catch (RequestFailedException e) when (e.ErrorCode == BlobErrorCode.BlobNotFound)
            {
                return NotFound();
            }
        }

        public class FileContentParams
        {
            public string Path { get; set; }
        }
    }
}
