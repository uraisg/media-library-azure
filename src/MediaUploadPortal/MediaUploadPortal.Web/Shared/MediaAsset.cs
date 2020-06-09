using System;
using System.Collections.Generic;
using System.Text;

namespace MediaUploadPortal.Web.Shared
{
    public class MediaAsset
    {
        public string ProjectName { get; set; }
        
        public string EventName { get; set; }
        
        public string Location { get; set; }
        
        public string StorageUrl { get; set; }

        public List<string> Tags { get; } = new List<string>();
    }
}
