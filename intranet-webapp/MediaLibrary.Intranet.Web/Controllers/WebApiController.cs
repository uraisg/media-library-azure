using System;
using System.Linq;
using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Models;
using MediaLibrary.Intranet.Web.Services;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Spatial;
using MediaLibrary.Intranet.Web.Background;
using System.IO;
using MediaLibrary.Intranet.Web.Common;
using System.Net.Http;
using System.Diagnostics;

namespace MediaLibrary.Intranet.Web.Controllers
{
    [ApiController]
    public class WebApiController : ControllerBase
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<WebApiController> _logger;
        private readonly MediaSearchService _mediaSearchService;
        private readonly ItemService _itemService;
        private readonly IHttpClientFactory _clientFactory;

        private static BlobContainerClient _blobContainerClient = null;

        public WebApiController(
            IOptions<AppSettings> appSettings,
            ILogger<WebApiController> logger,
            MediaSearchService mediaSearchService,
            ItemService itemService,
            IHttpClientFactory clientFactory)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
            _mediaSearchService = mediaSearchService;
            _itemService = itemService;
            _clientFactory = clientFactory;

            InitStorage();
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

        [HttpGet("/api/assets/{name}", Name = nameof(GetMediaFile))]
        public async Task<IActionResult> GetMediaFile(string name)
        {
            _logger.LogInformation("Getting blob with name {name}", name);

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
            _logger.LogInformation("Getting item details for id {id}", id);

            var item = await _mediaSearchService.GetItemAsync(id);

            if (item != null)
            {
                return Ok(item);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost("/api/media/{id}", Name = nameof(UpdateMediaItem))]
        public async Task<IActionResult> UpdateMediaItem(string id, [FromBody] MediaItem mediaItem)
        {
            try
            {
                await _itemService.Update(id, mediaItem);
                return Ok();
            }
            catch (Exception e)
            {
                Console.Write("Error: ", e);
                return BadRequest();
            }

        }

        private IActionResult Json(object p)
        {
            throw new NotImplementedException();
        }

        [HttpDelete("/api/media/{name}", Name = nameof(DeleteMediaFile))]
        public async Task<IActionResult> DeleteMediaFile(string name)
        {
            _logger.LogInformation("Deleting blob with name {name}", name);

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

        [HttpGet("/api/search", Name = nameof(GetSearch))]
        public async Task<IActionResult> GetSearch([FromQuery] SearchData model)
        {
            _logger.LogInformation("Search called");

            int page = Math.Max(1, model.Page ?? 1);
            int skip = (page - 1) * GlobalVariables.ResultsPerPage;

            if ((model.Lat != null && model.Lng == null) ||
                (model.Lng != null && model.Lat == null))
            {
                _logger.LogError(
                    "A value for one of Lat or Lng was provided, but the other is missing." + Environment.NewLine +
                    "URL: {url}",
                    HttpContext.Request.GetDisplayUrl());
                return BadRequest("A value for one of Lat or Lng was provided, but the other is missing");
            }
            GeographyPoint point = null;
            if (model.Lng != null && model.Lat != null)
            {
                point = GeographyPoint.Create(model.Lat.Value, model.Lng.Value);
            }

            var searchOptions = new MediaSearchOptions()
            {
                LocationFilter = model.LocationFilter,
                TagFilter = model.TagFilter,
                SpatialFilter = model.SpatialFilter,
                DistanceSearch = point != null ? new GeoDistanceSearch() { Point = point, Radius = 500 } : null,
                MinDateTaken = model.MinDateTaken,
                MaxDateTaken = model.MaxDateTaken,
                MinDateUploaded = model.MinDateUploaded,
                MaxDateUploaded = model.MaxDateUploaded
            };

            var result = await _mediaSearchService.QueryAsync(model.SearchText, searchOptions, GlobalVariables.ResultsPerPage, skip);
            result.TotalPages = ((int)result.Total + GlobalVariables.ResultsPerPage - 1) / GlobalVariables.ResultsPerPage;

            return Ok(result);
        }

        [HttpGet("/api/areas", Name = nameof(GetAreas))]
        public IActionResult GetAreas()
        {
            var areas = _mediaSearchService.GetSpatialAreas().Select(s => new { Id = s.Id, Name = s.Name });

            return Ok(areas);
        }
    }
}
