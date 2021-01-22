using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Search;
using Microsoft.Extensions.Options;
using Microsoft.Rest.Azure;

namespace MediaLibrary.Intranet.Web.Controllers
{
    [ApiController]
    public class WebApiController : ControllerBase
    {
        private readonly AppSettings _appSettings;

        private static BlobContainerClient _blobContainerClient = null;

        private static SearchServiceClient _searchServiceName = null;
        private static ISearchIndexClient _searchIndexClient = null;

        public WebApiController(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;

            InitStorage();
            InitSearch();
        }

        private void InitStorage()
        {
            if (_blobContainerClient == null)
            {
                if (!string.IsNullOrEmpty(_appSettings.MediaStorageConnectionString))
                {
                    _blobContainerClient = new BlobContainerClient(_appSettings.MediaStorageConnectionString, _appSettings.MediaStorageImageContainer);
                }
                else
                {
                    string containerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}",
                        _appSettings.MediaStorageAccountName, _appSettings.MediaStorageImageContainer);
                    _blobContainerClient = new BlobContainerClient(new Uri(containerEndpoint), new DefaultAzureCredential());
                }
            }
        }

        private void InitSearch()
        {
            if (_searchServiceName == null)
                _searchServiceName = new SearchServiceClient(_appSettings.SearchServiceName, new SearchCredentials(_appSettings.SearchServiceQueryApiKey));

            if (_searchIndexClient == null)
                _searchIndexClient = _searchServiceName.Indexes.GetClient(_appSettings.SearchIndexName);
        }

        [HttpGet("/api/assets/{name}", Name = nameof(GetMediaFile))]
        public async Task<IActionResult> GetMediaFile(string name)
        {
            BlobClient blobClient = _blobContainerClient.GetBlobClient(name);

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

        [HttpGet("/api/media/{id}", Name = nameof(GetMediaItem))]
        public async Task<IActionResult> GetMediaItem(string id)
        {
            try
            {
                MediaItem item = await _searchIndexClient.Documents.GetAsync<MediaItem>(id);
                return Ok(item);
            }
            catch (CloudException ex) when (ex.Response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound();
            }
        }

        [HttpDelete("/api/media/{name}", Name = nameof(DeleteMediaFile))]
        public async Task<IActionResult> DeleteMediaFile(string name)
        {
            BlobClient blobClient = _blobContainerClient.GetBlobClient(name);
            try
            {
                await blobClient.DeleteIfExistsAsync();
                return Ok();
            }
            catch (RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.BlobNotFound)
            {
                return NotFound();
            }
        }
    }
}
