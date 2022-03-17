using System;
using System.Net.Http;
using Azure.Identity;
using Azure.Storage.Blobs;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Common;
using System.IO;
using System.Diagnostics;

namespace MediaLibrary.Intranet.Web.Services
{
    public class ItemService
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<ItemService> _logger;
        private readonly IHttpClientFactory _clientFactory;

        public ItemService(IOptions<AppSettings> appSettings, ILogger<ItemService> logger, IHttpClientFactory httpClientFactory)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
            _clientFactory = httpClientFactory;
           
        }

        public async Task Update(string id, MediaItem mediaItem)
        {
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

            //upload to indexer blob
            string indexFileName = id + ".json";
            await UpdateBlob(indexBlobContainerClient, mediaItem, indexFileName);
        }

        private static async Task UpdateBlob(BlobContainerClient blobContainerClient, MediaItem mediaItem, string fileName)
        {
            Debug.Write("Updating..");

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

