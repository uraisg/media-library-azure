﻿using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Azure.Identity;
using Azure.Storage.Blobs;
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

            string filterExpression;
            try
            {
                filterExpression = CreateFilterExpression(searchOptions);
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

            var result = await _searchIndexClient.Documents.SearchAsync<MediaItem>(searchTerm, parameters);

            _logger.LogInformation("Completed search query successfully");

            return new MediaSearchResult(result);
        }

        private string CreateFilterExpression(MediaSearchOptions o)
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

            return string.Join(" and ", subexpressions);
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
            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string storageAccountName = _appSettings.MediaStorageAccountName;
            string indexContainerName = _appSettings.MediaStorageIndexContainer;
            string imageContainerName = _appSettings.MediaStorageImageContainer;

            //Creates searchserviceindex to manage indexes
            string searchServiceName = _appSettings.SearchServiceName;
            string searchServiceAdminApiKey = _appSettings.SearchServiceAdminApiKey;
            string searchIndexName = _appSettings.SearchIndexName;
            SearchIndexClient _searchIndexClient = new SearchIndexClient(searchServiceName, searchIndexName, new SearchCredentials(searchServiceAdminApiKey));

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

            //Deletes document from indexer
            IEnumerable<string> itemID = new List<string>() { id };
            await _searchIndexClient.Documents.IndexAsync(IndexBatch.Delete("Id", itemID));

            _logger.LogInformation("Deleted {id} from indexer succesfully", id);

        }
    }
}
