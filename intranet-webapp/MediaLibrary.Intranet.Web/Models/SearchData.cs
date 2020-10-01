using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.Search.Models;

namespace MediaLibrary.Intranet.Web.Models
{
    public static class GlobalVariables
    {
        public static int ResultsPerPage => 3;

        public static int MaxPageRange => 5;

        public static int PageRangeDelta => 2;
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

        // Used when page numbers, or next or prev buttons, have been selected.
        public string Paging { get; set; }

        public string LocationFilter { get; set; }

        public string TagFilter { get; set; }

        public string SpatialFilter { get; set; }

        public List<string> SpatialCategories { get; set; }

        // The list of results.
        public DocumentSearchResult<MediaItem> ResultList;
    }
}
