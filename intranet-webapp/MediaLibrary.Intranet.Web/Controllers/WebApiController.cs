using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Search;
using Microsoft.Azure.Search.Models;
using Microsoft.Extensions.Options;
using Microsoft.Rest.Azure;

namespace MediaLibrary.Intranet.Web.Controllers
{
    [ApiController]
    public class WebApiController : ControllerBase
    {
        private readonly AppSettings _appSettings;
        private readonly IGeoSearchHelper _geoSearchHelper;

        private static BlobContainerClient _blobContainerClient = null;

        private static SearchServiceClient _searchServiceName = null;
        private static ISearchIndexClient _searchIndexClient = null;

        public WebApiController(IOptions<AppSettings> appSettings, IGeoSearchHelper geoSearchHelper)
        {
            _appSettings = appSettings.Value;
            _geoSearchHelper = geoSearchHelper;

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

        [HttpGet("/api/search", Name = nameof(GetSearch))]
        public async Task<ActionResult> GetSearch([FromQuery] SearchData model)
        {
            // Ensure the search string is valid.
            if (model.SearchText == null)
            {
                model.SearchText = "";
            }

            // Set default result layout
            if (model.Layout == null)
            {
                model.Layout = DisplayMode.Grid;
            }

            // Make the search call for the first page.
            await RunQueryAsync(model);

            return Ok(model);
        }

        private async Task RunQueryAsync(SearchData model)
        {
            InitSearch();

            string filterExpression = GetFilterExpression(model.LocationFilter, model.TagFilter, model.SpatialFilter, model.MinDateTaken, model.MaxDateTaken);
            int page = model.Page ?? 0;

            var parameters = new SearchParameters
            {
                Filter = filterExpression,

                // Enter media property names into this list, so only these values will be returned.
                Select = new[] { "Id", "Name", "Project", "LocationName", "Tag", "Location", "ThumbnailURL" },

                // Skip past results that have already been returned.
                Skip = page * GlobalVariables.ResultsPerPage,

                // Take only the next page worth of results.
                Top = GlobalVariables.ResultsPerPage,

                // Include the total number of results.
                IncludeTotalResultCount = true,
            };

            // For efficiency, the search call should be asynchronous, so use SearchAsync rather than Search.
            model.ResultList = await _searchIndexClient.Documents.SearchAsync<MediaItem>(model.SearchText, parameters);

            // This variable communicates the total number of pages to the view.
            model.PageCount = ((int)model.ResultList.Count + GlobalVariables.ResultsPerPage - 1) / GlobalVariables.ResultsPerPage;

            // This variable communicates the page number being displayed to the view.
            model.CurrentPage = page;

            int leftMostPage = 0;
            // Calculate the range of page numbers to display.
            if (page == 0)
            {
                leftMostPage = 0;
            }
            else
            if (page <= leftMostPage)
            {
                // Trigger a switch to a lower page range.
                leftMostPage = Math.Max(page - GlobalVariables.PageRangeDelta, 0);
            }
            else
            if (page >= leftMostPage + GlobalVariables.MaxPageRange - 1)
            {
                // Trigger a switch to a higher page range.
                leftMostPage = Math.Min(page - GlobalVariables.PageRangeDelta, model.PageCount - GlobalVariables.MaxPageRange);
            }
            model.LeftMostPage = leftMostPage;

            // Calculate the number of page numbers to display.
            model.PageRange = Math.Min(model.PageCount - leftMostPage, GlobalVariables.MaxPageRange);
        }

        private string GetFilterExpression(IList<string> locationFilter, IList<string> tagFilter, string spatialFilter, long? minDateTaken, long? maxDateTaken)
        {
            var subexpressions = new List<string>();

            if (locationFilter != null && locationFilter.Count > 0)
            {
                subexpressions.Add(string.Join(" or ", locationFilter.Select(location => $"LocationName eq '{location.Replace("'", "''")}'")));
            }

            if (tagFilter != null && tagFilter.Count > 0)
            {
                subexpressions.Add(string.Join(" or ", tagFilter.Select(tag => $"Tag/any(t: t eq '{tag.Replace("'", "''")}')")));
            }

            if (minDateTaken != null)
            {
                string minDateTakenString = DateTimeOffset.FromUnixTimeSeconds(minDateTaken.Value).ToString("yyyy-MM-dd'T'HH:mm:ss.fffK", CultureInfo.InvariantCulture);
                subexpressions.Add($"DateTaken ge {minDateTakenString}");
            }

            if (maxDateTaken != null)
            {
                string maxDateTakenString = DateTimeOffset.FromUnixTimeSeconds(maxDateTaken.Value).ToString("yyyy-MM-dd'T'HH:mm:ss.fffK", CultureInfo.InvariantCulture);
                subexpressions.Add($"DateTaken le {maxDateTakenString}");
            }

            string spatialExpression = TransformSpatialFilter(spatialFilter);
            if (!string.IsNullOrEmpty(spatialExpression))
            {
                subexpressions.Add(spatialExpression);
            }

            return string.Join(" and ", subexpressions);
        }

        private string TransformSpatialFilter(string spatialFilter)
        {
            if (string.IsNullOrEmpty(spatialFilter))
            {
                return string.Empty;
            }

            _geoSearchHelper.GetDictionary().TryGetValue(spatialFilter, out var ret);

            if (string.IsNullOrEmpty(ret))
            {
                return string.Empty;
            }

            return "geo.intersects(Location, geography'" + ret + "')";
        }
    }
}
