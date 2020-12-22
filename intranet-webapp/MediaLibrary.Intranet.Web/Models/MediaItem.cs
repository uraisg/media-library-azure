using System;
using Microsoft.Azure.Search;
using Microsoft.Spatial;
using Newtonsoft.Json;

namespace MediaLibrary.Intranet.Web.Models
{
    /// <summary>
    /// Contains metadata associated with a media item.
    /// </summary>
    public class MediaItem
    {
        [System.ComponentModel.DataAnnotations.Key]
        [JsonProperty("metadata_storage_path")] // TODO: assign a proper ID in upstream process
        public string Id { get; set; }

        [IsSearchable, IsSortable]
        public string Name { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public DateTime DateTaken { get; set; }

        [JsonConverter(typeof(GeographyPointJsonConverter))]
        public GeographyPoint Location { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public string[] Tag { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public DateTime UploadDate { get; set; }

        [IsSearchable, IsFilterable]
        public string FileURL { get; set; }

        [IsSearchable, IsFilterable]
        public string ThumbnailURL { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public string Project { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public string Event { get; set; }

        [IsSearchable, IsFilterable, IsSortable, IsFacetable]
        public string LocationName { get; set; }

        [IsSearchable, IsFilterable, IsFacetable]
        public string Copyright { get; set; }
    }
}
