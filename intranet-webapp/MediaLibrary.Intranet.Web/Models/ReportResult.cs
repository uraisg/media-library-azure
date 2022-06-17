using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediaLibrary.Intranet.Web.Models
{
    public class ReportResult
    {
        public string FileId { get; set; }
        public string StaffName { get; set; }
        public string Department { get; set; }
        public string Email { get; set; }
        public string ThumbnailURL { get; set; }
        public List<string> Location { get; set; }
    }
    public class ActivityReportResult : ReportResult
    {
        public DateTime ActivityDateTime { get; set; }
        public string ActivityType { get; set; }
        public string LocationName { get; set; }
    }
    public class FileReportResult : ReportResult
    {
        public Decimal FileSize { get; set; }
        public int ViewCount { get; set; }
        public DateTime UploadDateTime { get; set; }
        public int DownloadCount { get; set; }
    }

    public class StaffResult
    {
        public string Email { get; set; }
        public int UploadCount { get; set; }
        public int DownloadCount { get; set; }
        public string StaffName { get; set; }
        public string Department { get; set; }
    }

    public class GenerateReportResult
    {
        public string ImageName { get; set; }
        public string ImageLocation { get; set; }
        public string PlanningArea { get; set; }
        public string ImageURL { get; set; }
        public string StaffName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public string Group { get; set; }
        public DateTime? ActivityDateTime { get; set; }
        public string Activity { get; set; }
    }
}
