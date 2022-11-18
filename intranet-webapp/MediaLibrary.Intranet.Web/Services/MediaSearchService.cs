using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Azure.Search;
using Microsoft.Azure.Search.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Rest.Azure;

namespace MediaLibrary.Intranet.Web.Services
{
    public class MediaSearchService
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<MediaSearchService> _logger;
        private readonly IGeoSearchHelper _geoSearchHelper;
        private readonly SearchIndexClient _searchIndexClient;
        private readonly SearchIndexClient _searchIndexAdminClient;

        public MediaSearchService(
            IOptions<AppSettings> appSettings,
            ILogger<MediaSearchService> logger,
            IGeoSearchHelper geoSearchHelper)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
            _geoSearchHelper = geoSearchHelper;

            string searchServiceName = _appSettings.SearchServiceName;
            string searchServiceQueryApiKey = _appSettings.SearchServiceQueryApiKey;
            string searchIndexName = _appSettings.SearchIndexName;
            _searchIndexClient = new SearchIndexClient(
                searchServiceName,
                searchIndexName,
                new SearchCredentials(searchServiceQueryApiKey));

            string searchServiceAdminApiKey = _appSettings.SearchServiceAdminApiKey;
            _searchIndexAdminClient = new SearchIndexClient(
                searchServiceName,
                searchIndexName,
                new SearchCredentials(searchServiceAdminApiKey));
        }

        public async Task<MediaItem> GetItemAsync(string id)
        {
            try
            {
                var item = await _searchIndexClient.Documents.GetAsync<MediaItem>(id);
                return item;
            }
            catch (CloudException ex) when (ex.Response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<MediaSearchResult> QueryAsync(
            string searchTerm,
            MediaSearchOptions searchOptions,
            int? count = null,
            int? skip = null)
        {
            searchTerm = searchTerm ?? "";
            string newSearchTerm = "";

            string filterExpression;
            try
            {
                var keyList = new List<string>();
                var valueList = new List<string>();
                List<int> foundIndexes = new List<int>();
                for (int i = searchTerm.IndexOf('\"'); i > -1; i = searchTerm.IndexOf('\"', i + 1))
                {
                    foundIndexes.Add(i);
                }

                var originalSearch = searchTerm;
                if (foundIndexes.Count == 0)
                {
                    newSearchTerm = originalSearch;
                }
                else
                {
                    for (int i = 0; i < foundIndexes.Count; i++)
                    {
                        var indexOfChar = originalSearch.IndexOf("\"");

                        var left = originalSearch.Substring(0, indexOfChar);
                        var right = originalSearch.Substring(indexOfChar);

                        if (i % 2 != 0)
                        {
                            valueList.Add(left.Replace("\"", ""));
                        }
                        else
                        {
                            var strList = left.Split(" ");

                            foreach (var str in strList)
                            {
                                if (str.Contains(":"))
                                {
                                    keyList.Add(str.Replace(":", ""));
                                }
                                else
                                {
                                    newSearchTerm += str;
                                }
                            }
                        }

                        originalSearch = right.Substring(1);
                    }

                    newSearchTerm += originalSearch;
                }

                filterExpression = CreateFilterExpression(keyList, valueList, searchOptions);
            }
            catch (ArgumentException ex) // Invalid spatial filter
            {
                return new MediaSearchResult();
            }

            var parameters = new SearchParameters()
            {
                Filter = filterExpression,

                // Enter media property names into this list, so only these values will be returned.
                Select = new[] { "Id", "Name", "Caption", "FileURL", "ThumbnailURL", "Location", "Author", "LocationName", "Tag", "Project", "UploadDate" },

                // Order newest uploads first.
                OrderBy = new[] { "UploadDate desc" },

                // Skip past results that have already been returned.
                Skip = skip,

                // Take only the next page worth of results.
                Top = count,

                // Include the total number of results.
                IncludeTotalResultCount = true,
            };

            var result = await _searchIndexClient.Documents.SearchAsync<MediaItem>(newSearchTerm, parameters);

            _logger.LogInformation("Completed search query successfully");

            return new MediaSearchResult(result);
        }

        private string CreateFilterExpression(List<string> keyList, List<string> valueList, MediaSearchOptions o)
        {
            var subexpressions = new List<string>();

            if (o.LocationFilter != null && o.LocationFilter.Count > 0)
            {
                subexpressions.Add(string.Join(" or ", o.LocationFilter.Select(location => $"LocationName eq '{location.Replace("'", "''")}'")));
            }

            if (o.TagFilter != null && o.TagFilter.Count > 0)
            {
                subexpressions.Add(string.Join(" or ", o.TagFilter.Select(tag => $"Tag/any(t: t eq '{tag.Replace("'", "''")}')")));
            }

            if (o.MinDateTaken != null)
            {
                string minDateTakenString = DateTimeOffset.FromUnixTimeSeconds(o.MinDateTaken.Value).ToString("yyyy-MM-dd'T'HH:mm:ss.fffK", CultureInfo.InvariantCulture);
                subexpressions.Add($"DateTaken ge {minDateTakenString}");
            }

            if (o.MaxDateTaken != null)
            {
                string maxDateTakenString = DateTimeOffset.FromUnixTimeSeconds(o.MaxDateTaken.Value).ToString("yyyy-MM-dd'T'HH:mm:ss.fffK", CultureInfo.InvariantCulture);
                subexpressions.Add($"DateTaken le {maxDateTakenString}");
            }

            if (o.MinDateUploaded != null)
            {
                string minDateUploadedString = DateTimeOffset.FromUnixTimeSeconds(o.MinDateUploaded.Value).ToString("yyyy-MM-dd'T'HH:mm:ss.fffK", CultureInfo.InvariantCulture);
                subexpressions.Add($"UploadDate ge {minDateUploadedString}");
            }

            if (o.MaxDateUploaded != null)
            {
                string maxDateUploadedString = DateTimeOffset.FromUnixTimeSeconds(o.MaxDateUploaded.Value).ToString("yyyy-MM-dd'T'HH:mm:ss.fffK", CultureInfo.InvariantCulture);
                subexpressions.Add($"UploadDate le {maxDateUploadedString}");
            }

            string spatialExpression = TransformSpatialFilter(o.SpatialFilter);
            if (spatialExpression != null)
            {
                subexpressions.Add(spatialExpression);
            }

            if (o.DistanceSearch != null)
            {
                var lat = o.DistanceSearch.Point.Latitude;
                var lon = o.DistanceSearch.Point.Longitude;
                subexpressions.Add($"geo.distance(Location, geography'POINT({lon} {lat})') le {o.DistanceSearch.Radius / 1000.0}");
            }

            subexpressions.AddRange(AddAdvancedSearch(keyList, valueList));

            return string.Join(" and ", subexpressions);
        }

        private List<string> AddAdvancedSearch(List<string> keyList, List<string> valueList)
        {
            var subexpressions = new List<string>();

            for (var i = 0; i < keyList.Count; i++)
            {
                try
                {
                    if (keyList[i] == "Author")
                    {
                        subexpressions.Add($"search.in({keyList[i]}, '{valueList[i]}')");
                    }
                    else
                    {
                        subexpressions.Add($"search.ismatch('{valueList[i]}*', '{keyList[i]}')");
                    }
                }
                catch
                {
                    continue;
                }
            }

            return subexpressions;
        }

        private string TransformSpatialFilter(string spatialFilter)
        {
            if (string.IsNullOrEmpty(spatialFilter))
            {
                return null;
            }

            if (!_geoSearchHelper.TryGetPolygonFromId(spatialFilter, out var ret))
            {
                throw new ArgumentException("Could not find coordinates for given area");
            }

            return "geo.intersects(Location, geography'" + ret.WktPolygon + "')";
        }

        public async Task DeleteItemIndexAsync(string id)
        {
            //Deletes document from indexer
            IEnumerable<string> itemID = new List<string>() { id };
            await _searchIndexAdminClient.Documents.IndexAsync(IndexBatch.Delete("Id", itemID));

            _logger.LogInformation("Deleted {id} from indexer succesfully", id);

        }
    }
}
