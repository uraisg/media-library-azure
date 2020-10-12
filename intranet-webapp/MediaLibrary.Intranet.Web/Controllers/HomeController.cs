using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Extensions.Options;
using Microsoft.Azure.Search;
using Microsoft.Azure.Search.Models;
using MediaLibrary.Intranet.Web.Common;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AppSettings _appSettings;
        private readonly IGeoSearchHelper _geoSearchHelper;

        private static SearchServiceClient _searchServiceName = null;
        private static ISearchIndexClient _searchIndexClient = null;

        public HomeController(IOptions<AppSettings> appSettings, ILogger<HomeController> logger, IGeoSearchHelper geoSearchHelper)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
            _geoSearchHelper = geoSearchHelper;

            InitSearch();
        }

        private void InitSearch()
        {
            if (_searchServiceName == null)
                _searchServiceName = new SearchServiceClient(_appSettings.SearchServiceName, new SearchCredentials(_appSettings.SearchServiceQueryApiKey));

            if (_searchIndexClient == null)
                _searchIndexClient = _searchServiceName.Indexes.GetClient(_appSettings.SearchIndexName);
        }

        public async Task<ActionResult> Index([FromQuery] SearchData model)
        {
            try
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
            }

            catch (Exception)
            {
                return View("Error", new ErrorViewModel { RequestId = "1" });
            }
            return View(model);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        private async Task<ActionResult> RunQueryAsync(SearchData model)
        {
            InitSearch();

            string filterExpression = GetFilterExpression(model.LocationFilter, model.TagFilter, model.SpatialFilter);
            int page = model.Page ?? 0;

            var parameters = new SearchParameters
            {
                Filter = filterExpression,

                // Return information on the text, and number, of facets in the data.
                Facets = new List<string> { "LocationName,count:20", "Tag,count:20" },

                // Enter media property names into this list, so only these values will be returned.
                Select = new[] { "Name", "Project", "LocationName", "Tag", "Location", "FileURL", "metadata_storage_name" },

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

            if (model.SpatialCategories == null)
            {
                model.SpatialCategories = _geoSearchHelper.GetNames();
            }
            
            // Return the new view.
            return View("Index", model);
        }

        private string GetFilterExpression(IList<string> locationFilter, IList<string> tagFilter, string spatialFilter)
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
