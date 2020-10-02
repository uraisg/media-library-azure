using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.Search;
using Microsoft.Spatial;
using Newtonsoft.Json;

namespace MediaLibrary.Intranet.Web.Models
{
    public class MediaItem
    {
        [IsSearchable, IsSortable]
        public string Name { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public DateTime DateTaken { get; set; }
        
        public GeographyPoint Location { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public string[] Tag { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public DateTime UploadDate { get; set; }

        [IsSearchable, IsFilterable]
        public string FileURL { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public string Project { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public string Event { get; set; }

        [IsSearchable, IsFilterable, IsSortable, IsFacetable]
        public string LocationName { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public string Copyright { get; set; }

        [JsonProperty("metadata_storage_name")]
        public string MetadataStorageName { get; set; }
    }
}
