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

        public string ComputerVisionEndpoint { get; set; }

        public string ComputerVisionApiKey { get; set; }
    }
}
