using Azure.Storage.Blobs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediaLibrary.Intranet.Web.Models
{
    public class InternetTableItems
    {
        public string name { get; set; }
        public DateTime dateTaken { get; set; }
        public string location { get; set; }
        public string tag { get; set; }
        public string author { get; set; }
        public string caption { get; set; }
        public DateTime uploadDate { get; set; }
        public string fileURL { get; set; }
        public string thumbnailURL { get; set; }
        public string project { get; set; }
        public string _event { get; set; }
        public string locationName { get; set; }
        public string copyright { get; set; }
        public string partitionKey { get; set; }
        public string rowKey { get; set; }
        public DateTime timestamp { get; set; }
        public string eTag { get; set; }
    }

    public class ImageURLItem
    {
        public string url { get; set; }
    }

}
