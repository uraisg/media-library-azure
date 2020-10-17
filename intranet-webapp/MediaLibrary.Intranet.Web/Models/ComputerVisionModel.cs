using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediaLibrary.Intranet.Web.Models
{
    public class CoordinateObj
    {
        public string type { get; set; }
        public List<double> coordinates { get; set; }
    }

    public class ImageMetadata
    {
        public string Name { get; set; }
        public DateTime DateTaken { get; set; }
        public CoordinateObj Location { get; set; }
        public string Tag { get; set; }
        public DateTime UploadDate { get; set; }
        public string Caption { get; set; }
        public string Author { get; set; }
        public string FileURL { get; set; }
        public string ThumbnailURL { get; set; }
        public string Project { get; set; }
        public string Event { get; set; }
        public string LocationName { get; set; }
        public string Copyright { get; set; }
    }
}
