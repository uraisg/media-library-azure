using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.Search.Models;

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
    }

    public class MediaSearchOptions
    {
        public IList<string> LocationFilter { get; set; }

        public IList<string> TagFilter { get; set; }

        public string SpatialFilter { get; set; }

        // Unix timestamp representation (seconds)
        public long? MinDateTaken { get; set; }

        // Unix timestamp representation (seconds)
        public long? MaxDateTaken { get; set; }
    }
}
