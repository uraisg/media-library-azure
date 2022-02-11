using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.Search.Models;
using Microsoft.Spatial;

namespace MediaLibrary.Intranet.Web.Models
{
    public class MediaSearchResult
    {
        public MediaSearchResult(DocumentSearchResult<MediaItem> result = null)
        {
            if (result != null)
            {
                Items = result.Results.Select(x => x.Document).ToList();
                Total = result.Count;
            }
            else
            {
                Items = new List<MediaItem>();
                Total = 0;
            }
        }
        public IList<MediaItem> Items { get; set; }

        public int Count => Items.Count;

        public long? Total { get; set; }

        public long? TotalPages { get; set; }
    }

    public class MediaSearchOptions
    {
        public IList<string> LocationFilter { get; set; }

        public IList<string> TagFilter { get; set; }

        public string SpatialFilter { get; set; }

        public GeoDistanceSearch DistanceSearch { get; set; }

        // Unix timestamp representation (seconds)
        public long? MinDateTaken { get; set; }

        // Unix timestamp representation (seconds)
        public long? MaxDateTaken { get; set; }

        // Unix timestamp representation (seconds)
        public long? MinDateUploaded { get; set; }

        // Unix timestamp representation (seconds)
        public long? MaxDateUploaded { get; set; }
    }

    public class GeoDistanceSearch
    {
        public GeographyPoint Point { get; set; }

        public int Radius { get; set; } // meters
    }
}
