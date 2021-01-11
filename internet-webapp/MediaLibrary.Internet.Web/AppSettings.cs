using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediaLibrary.Internet.Web
{
    public class AppSettings
    {
        public string MediaStorageConnectionString { get; set; }
        public string MediaStorageContainer { get; set; }
        public string TableConnectionString { get; set; }
        public string TableName { get; set; }
        public string ComputerVisionEndpoint { get; set; }
        public string ComputerVisionApiKey { get; set; }
        public string ApiName { get; set; }
        public string ApiPassword { get; set; }
        public string ThumbHeight { get; set; }
        public string ThumbWidth { get; set; }
    }
}
