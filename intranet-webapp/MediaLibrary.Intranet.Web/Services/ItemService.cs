using System;
using System.IO;
using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MediaLibrary.Intranet.Web.Services
{
    public class ItemService
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<ItemService> _logger;

        public ItemService(IOptions<AppSettings> appSettings, ILogger<ItemService> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        public async Task<MediaItem> GetItemAsync(string id)
        {
            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string storageAccountName = _appSettings.MediaStorageAccountName;
            string indexContainerName = _appSettings.MediaStorageIndexContainer;

            // Initialize blob container client
            BlobContainerClient indexBlobContainerClient;

            if (!string.IsNullOrEmpty(storageConnectionString))
            {
                indexBlobContainerClient = new BlobContainerClient(storageConnectionString, indexContainerName);
            }
            else
            {
                string indexContainerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}",
                    storageAccountName, indexContainerName);
                indexBlobContainerClient = new BlobContainerClient(new Uri(indexContainerEndpoint), new DefaultAzureCredential());
            }

            string fileName = id + ".json";
            BlobClient blobClient = indexBlobContainerClient.GetBlobClient(fileName);

            try
            {
                BlobDownloadInfo download = await blobClient.DownloadAsync();
                return JsonHelper.ReadJsonFromStream<MediaItem>(download.Content);
            }
            catch (RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.BlobNotFound)
            {
                return null;
            }
        }

        public async Task UpdateItemAsync(string id, MediaItem mediaItem)
        {
            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string storageAccountName = _appSettings.MediaStorageAccountName;
            string indexContainerName = _appSettings.MediaStorageIndexContainer;

            // Initialize blob container client
            BlobContainerClient indexBlobContainerClient;

            if (!string.IsNullOrEmpty(storageConnectionString))
            {
                indexBlobContainerClient = new BlobContainerClient(storageConnectionString, indexContainerName);
            }
            else
            {
                string indexContainerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}",
                    storageAccountName, indexContainerName);
                indexBlobContainerClient = new BlobContainerClient(new Uri(indexContainerEndpoint), new DefaultAzureCredential());
            }

            // Convert JSON text to stream
            var stream = new MemoryStream();
            JsonHelper.WriteJsonToStream(mediaItem, stream);

            // Upload new JSON to index container
            string fileName = id + ".json";
            var blobClient = indexBlobContainerClient.GetBlobClient(fileName);
            var blobUploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = "application/json"
                }
            };

            await blobClient.UploadAsync(stream, blobUploadOptions);

            _logger.LogInformation("Saved {file} to index blob container succesfully", fileName);
        }

        public async Task DeleteItemAsync(string id, string imageName)
        {
            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string storageAccountName = _appSettings.MediaStorageAccountName;
            string indexContainerName = _appSettings.MediaStorageIndexContainer;
            string imageContainerName = _appSettings.MediaStorageImageContainer;

            // Initialize blob container client
            BlobContainerClient indexBlobContainerClient;
            BlobContainerClient imageBlobContainerClient;

            if (!string.IsNullOrEmpty(storageConnectionString))
            {
                indexBlobContainerClient = new BlobContainerClient(storageConnectionString, indexContainerName);
                imageBlobContainerClient = new BlobContainerClient(storageConnectionString, imageContainerName);
            }
            else
            {
                string indexContainerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}",
                    storageAccountName, indexContainerName);
                indexBlobContainerClient = new BlobContainerClient(new Uri(indexContainerEndpoint), new DefaultAzureCredential());

                string imageContainerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}",
                    storageAccountName, imageContainerName);
                imageBlobContainerClient = new BlobContainerClient(new Uri(imageContainerEndpoint), new DefaultAzureCredential());
            }

            //Deletes json data from container
            string fileName = id + ".json";
            var blobClient = indexBlobContainerClient.GetBlobClient(fileName);
            await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots);

            //Deletes image from container
            string imgName = id + "_" + imageName;
            var imgblobClient = imageBlobContainerClient.GetBlobClient(imgName);
            await imgblobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots);

            //Deletes image thumb from container            
            string imgThumbName = id + "_" + Path.GetFileNameWithoutExtension(imageName) + "_thumb.jpg";
            var imgThumbBlobClient = imageBlobContainerClient.GetBlobClient(imgThumbName);
            await imgThumbBlobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots);

            _logger.LogInformation("Deleted json, image and thumbnail for {file} succesfully", fileName);            

        }
    }
}
