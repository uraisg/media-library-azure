using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Azure.Search.Models;

namespace MediaLibrary.Intranet.Web.Models
{
    public static class GlobalVariables
    {
        public static int ResultsPerPage => 25;

        public static int MaxPageRange => 5;

        public static int PageRangeDelta => 2;
    }

    public enum DisplayMode
    {
        Grid,
        List,
        Map
    }

    public class SearchData
    {
        // The text to search for.
        public string SearchText { get; set; }

        // The current page being displayed.
        public int CurrentPage { get; set; }

        // The total number of pages of results.
        public int PageCount { get; set; }

        // The left-most page number to display.
        public int LeftMostPage { get; set; }

        // The number of page numbers to display - which can be less than MaxPageRange towards the end of the results.
        public int PageRange { get; set; }

        public int? Page { get; set; }

        // Used when page numbers, or next or prev buttons, have been selected.
        public string Paging { get; set; }

        // Used to determine how the results are rendered
        public DisplayMode? Layout { get; set; }

        public IList<string> LocationFilter { get; set; }

        public IList<string> TagFilter { get; set; }

        // Unix timestamp representation (seconds)
        public long? MinDateTaken { get; set; }

        // Unix timestamp representation (seconds)
        public long? MaxDateTaken { get; set; }

        public string SpatialFilter { get; set; }

        public IList<SelectListItem> SpatialCategories { get; set; }

        public double? Lng { get; set; }

        public double? Lat { get; set; }

        // The list of results.
        public DocumentSearchResult<MediaItem> ResultList;
    }
}
