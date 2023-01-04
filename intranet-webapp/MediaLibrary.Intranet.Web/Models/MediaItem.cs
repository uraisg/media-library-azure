using System;
using System.Collections.Generic;
using MediaLibrary.Intranet.Web.Common;
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
        [IsFilterable]
        public string Id { get; set; }

        [IsSearchable, IsSortable]
        public string Name { get; set; }

        [IsFilterable, IsSortable, IsFacetable]
        public DateTime DateTaken { get; set; }

        [JsonConverter(typeof(GeographyPointJsonConverter))]
        [IsFilterable, IsSortable]
        public GeographyPoint Location { get; set; }

        [IsSearchable, IsFilterable, IsSortable, IsFacetable]
        public string[] Tag { get; set; }

        [IsSearchable]
        public string Caption { get; set; }

        [IsSearchable, IsFilterable, IsSortable, IsFacetable]
        public string Author { get; set; }

        [IsFilterable, IsSortable, IsFacetable]
        public DateTime UploadDate { get; set; }

        public string FileURL { get; set; }

        public string ThumbnailURL { get; set; }

        [IsSearchable, IsFilterable, IsSortable, IsFacetable]
        public string Project { get; set; }

        [IsSearchable, IsFilterable, IsSortable, IsFacetable]
        public string Event { get; set; }

        [IsSearchable, IsFilterable, IsSortable, IsFacetable]
        public string LocationName { get; set; }

        [IsFilterable, IsSortable, IsFacetable]
        public string Copyright { get; set; }

        public string AdditionalField { get; set; }
    }
}
