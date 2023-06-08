using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace MediaLibrary.Intranet.Web.Models
{
    public class ACMStaffInfoResult
    {
        public string id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string Department { get; set; }
        public string group { get; set; }
        public string Status { get; set; }

        public DateTime? LastLoginDate { get; set; }
        public DateTime? DisableDate { get; set; }
    }


    public class ACMPage {
         public List<ACMStaffInfoResult> staffInfoResults {get; set;}
        public int totalCount { get; set; }
        }
}
