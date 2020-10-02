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

        public async Task<ActionResult> Index(SearchData model)
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
                    model.Layout = DisplayMode.List;
                }

                // Make the search call for the first page.
                await RunQueryAsync(model, 0, 0, "", "", "");

                // Ensure temporary data is stored for the next call.
                //TempData["page"] = 0;
                //TempData["leftMostPage"] = 0;
                //TempData["searchfor"] = model.SearchText;
            }

            catch (Exception ex)
            {
                return View("Error", new ErrorViewModel { RequestId = "1" });
            }
            return View(model);
        }

        public async Task<ActionResult> Facet(SearchData model)
        {
            try
            {
                // Filters set by the model override those stored in temporary data.
                string locationFilter;
                string tagFilter;
                string spatialFilter;
                if (model.LocationFilter != null)
                {
                    locationFilter = model.LocationFilter;
                }
                else
                {
                    locationFilter = TempData["locationFilter"].ToString();
                }

                if (model.TagFilter != null)
                {
                    tagFilter = model.TagFilter;
                }
                else
                {
                    tagFilter = TempData["tagFilter"].ToString();
                }

                if (model.SpatialFilter != null)
                {
                    spatialFilter = model.SpatialFilter;
                }
                else
                {
                    spatialFilter = TempData["spatialFilter"].ToString();
                }

                // Recover the search text.
                model.SearchText = TempData["searchfor"].ToString();

                // Initiate a new search.
                await RunQueryAsync(model, 0, 0, locationFilter, tagFilter, spatialFilter);
            }

            catch
            {
                return View("Error", new ErrorViewModel { RequestId = "2" });
            }
            return View("Index", model);
        }

        public async Task<ActionResult> Page(SearchData model)
        {
            try
            {
                int page;

                switch (model.Paging)
                {
                    case "prev":
                        page = (int)TempData["page"] - 1;
                        break;

                    case "next":
                        page = (int)TempData["page"] + 1;
                        break;

                    default:
                        page = int.Parse(model.Paging);
                        break;
                }

                // Layout set by the model override the one stored in temporary data
                model.Layout = model.Layout ?? (DisplayMode)TempData["layout"];

                // Recover the leftMostPage.
                int leftMostPage = (int)TempData["leftMostPage"];

                // Recover the filters.
                string locationFilter = TempData["locationFilter"].ToString();
                string tagFilter = TempData["tagFilter"].ToString();
                string spatialFilter = TempData["spatialFilter"].ToString();

                // Recover the search text.
                model.SearchText = TempData["searchfor"].ToString();

                // Search for the new page.
                await RunQueryAsync(model, page, leftMostPage, locationFilter, tagFilter, spatialFilter);

                // Ensure Temp data is stored for next call, as TempData only stored for one call.
                //TempData["page"] = (object)page;
                //TempData["searchfor"] = model.SearchText;
                //TempData["leftMostPage"] = model.LeftMostPage;
            }

            catch
            {
                return View("Error", new ErrorViewModel { RequestId = "2" });
            }
            return View("Index", model);
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

        private async Task<ActionResult> RunQueryAsync(SearchData model, int page, int leftMostPage, string locationFilter, string tagFilter, string spatialFilter)
        {
            InitSearch();

            string facetFilter = "";

            if (locationFilter.Length > 0 && tagFilter.Length > 0)
            {
                // Both facets apply.
                facetFilter = $"{locationFilter} and {tagFilter}";
            }
            else
            {
                // One, or zero, facets apply.
                facetFilter = $"{locationFilter}{tagFilter}";
            }

            spatialFilter = TransformSpatialFilter(spatialFilter);

            if (facetFilter.Length > 0 && spatialFilter.Length > 0)
            {
                // Both facets apply.
                facetFilter = $"{facetFilter} and {spatialFilter}";
            }
            else
            {
                // One, or zero, facets apply.
                facetFilter = $"{facetFilter}{spatialFilter}";
            }

            var parameters = new SearchParameters
            {
                Filter = facetFilter,

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
            

            // Ensure Temp data is stored for the next call.
            TempData["page"] = page;
            TempData["leftMostPage"] = model.LeftMostPage;
            TempData["layout"] = model.Layout;
            TempData["searchfor"] = model.SearchText;
            TempData["locationFilter"] = locationFilter;
            TempData["tagFilter"] = tagFilter;
            TempData["spatialFilter"] = spatialFilter;

            // Return the new view.
            return View("Index", model);
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
