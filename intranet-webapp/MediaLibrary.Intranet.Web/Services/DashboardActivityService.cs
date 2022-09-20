using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NetTopologySuite.Geometries;
using NPOI.SS.Formula.Functions;

namespace MediaLibrary.Intranet.Web.Services
{
    public class DashboardActivityService
    {
        private readonly MediaLibraryContext _mediaLibraryContext;
        private readonly MediaSearchService _mediaSearchService;
        private readonly ILogger<DashboardActivityService> _logger;
      
        public DashboardActivityService(MediaLibraryContext mlContext, MediaSearchService mediaSearchService, ILogger<DashboardActivityService> logger)
        {
            _mediaLibraryContext = mlContext;
            _mediaSearchService = mediaSearchService;
            _logger = logger;
        }

        public bool EmailExist(string email)
        {
            return _mediaLibraryContext.dashboardActivity.Where(e => e.Activity == (int)DBActivity.Upload || e.Activity == (int)DBActivity.Download).Any(e => e.Email == email);
        }

        public bool ActivityExist(string fileId)
        {
            return _mediaLibraryContext.dashboardActivity.Any(e => e.FileId == fileId);
        }

        public bool UploadActivityExist(string fileId)
        {
            return _mediaLibraryContext.dashboardActivity.Where(x => x.Activity == (int)DBActivity.Upload).Any(e => e.FileId == fileId);
        }

        public bool PlanningAreaExist(string planningArea)
        {
            if (planningArea == "ALL")
            {
                return false;
            }
            return _mediaLibraryContext.planningArea.Any(e => e.PlanningAreaName == planningArea);
        }

        public DashboardActivity GetActivityByFileId(string fileId)
        {
            DashboardActivity activity = _mediaLibraryContext.dashboardActivity.Where(e => e.FileId == fileId).FirstOrDefault();
            return activity;
        }

        public async Task<bool> AddActivityAsync(DashboardActivity activity)
        {
            await _mediaLibraryContext.AddAsync(activity);
            try
            {
                await _mediaLibraryContext.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                System.Diagnostics.Debug.WriteLine("Error adding into database: " + e);
                _logger.LogError("Error adding {FileId} into DashboardActivity", activity.FileId);
                return false;
            }
            return true;
        }

        public async Task AddActivityForUpload(IList<MediaItem> mediaItem)
        {
            foreach (var item in mediaItem)
            {
                if (!UploadActivityExist(item.Id))
                {
                    DashboardActivity dashboardActivity = new DashboardActivity
                    {
                        DActivityId = Guid.NewGuid(),
                        FileId = item.Id,
                        Email = item.Author,
                        ActivityDateTime = item.UploadDate,
                        Activity = (int)DBActivity.Upload
                    };
                    if (await AddActivityAsync(dashboardActivity))
                    {
                        _logger.LogInformation("Added {FileId} into DashboardActivity", dashboardActivity.FileId);
                    }
                }
            }
        }

        public async Task<List<DashboardActivity>> GetAllActivityByFileIdAsync(string fileId)
        {
            return await _mediaLibraryContext.dashboardActivity.Where(e => e.FileId == fileId).ToListAsync();
        }

        public async Task<bool> DeleteActivityByFileIdAsync(string fileId, string userEmail)
        {
            List<DashboardActivity> activities = await GetAllActivityByFileIdAsync(fileId);
            foreach (DashboardActivity activity in activities)
            {
                if (activity.Activity == (int)DBActivity.View)
                {
                    //Remove all view activity
                    _mediaLibraryContext.Remove(activity);
                }
                else
                {
                    //Update FileId to "Deleted"
                    activity.FileId = "Deleted";
                    _mediaLibraryContext.Attach(activity).State = EntityState.Modified;
                }
            }

            //Adding deleted item into DeletedFiles Table in DB
            DashboardActivity dashboardActivity = new DashboardActivity()
            {
                DActivityId = Guid.NewGuid(),
                FileId = fileId,
                Email = userEmail,
                ActivityDateTime = DateTime.Now,
                Activity = (int)DBActivity.Delete
            };
            await _mediaLibraryContext.AddAsync(dashboardActivity);

            try
            {
                await _mediaLibraryContext.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                System.Diagnostics.Debug.WriteLine("Error deleteing from database: " + e);
                _logger.LogError("Error with deleting {FileId} from DashboardActivity", fileId);
                return false;
            }
            return true;
        }

        public async Task<int> GetFirstYearAsync(string planningArea)
        {
            int year = DateTime.Now.Year;
            var result = from da in _mediaLibraryContext.Set<DashboardActivity>()
                         join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                         select new { da, fd };

            if (PlanningAreaExist(planningArea))
            {
                var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                result = result.Where(e => areaPolygon.Contains(e.fd.AreaPoint));
            }

            year = await result.OrderBy(e => e.da.ActivityDateTime).Select(e => e.da.ActivityDateTime.Year).FirstOrDefaultAsync();

            return year;
        }

        private async Task<Geometry> GetPlanningAreaPolygonAsync(string planningArea)
        {
            //Retrieve the Polygon
            var polygon = await _mediaLibraryContext.planningArea.Where(e => e.PlanningAreaName == planningArea).Select(e => e.AreaPolygon).FirstOrDefaultAsync();
            return polygon;
        }
        public async Task<(int, int)> GetActivityCountAsync(string planningArea)
        {
            //Item1 = Upload Count
            //Item2 = Download Count
            var result = from da in _mediaLibraryContext.Set<DashboardActivity>()
                         join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                         where da.FileId != "Deleted"
                         select new { da, fd };

            if (PlanningAreaExist(planningArea))
            {
                var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                result = result.Where(e => areaPolygon.Contains(e.fd.AreaPoint));
            }

            int uploadCount = await result.Where(e => e.da.Activity == (int)DBActivity.Upload).CountAsync();
            int downloadCount = await result.Where(e => e.da.Activity == (int)DBActivity.Download).CountAsync();
            return (uploadCount, downloadCount);
        }

        public async Task<IQueryable> GetActivityCountByMonthAsync(string planningArea, int year, int activitySelected)
        {
            var result = from da in _mediaLibraryContext.Set<DashboardActivity>()
                                join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                                where da.FileId != "Deleted" && da.ActivityDateTime.Year == year && da.Activity == activitySelected
                                select new { da, fd };
            
            if (PlanningAreaExist(planningArea))
            {
                var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                result = result.Where(e => areaPolygon.Contains(e.fd.AreaPoint));
            }

            var monthlyResult = result.GroupBy(e => e.da.ActivityDateTime.Month).Select(e => new { Month = e.Key, Count = e.Count() });
            return monthlyResult;
        }

        public async Task<IQueryable> GetViewCountTop5Async(string planningArea)
        {
            var result = from da in _mediaLibraryContext.Set<DashboardActivity>()
                         join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                         where da.Activity == (int)DBActivity.View && da.FileId != "Deleted"
                         select new { da, fd };

            if (PlanningAreaExist(planningArea))
            {
                var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                result = result.Where(e => areaPolygon.Contains(e.fd.AreaPoint));
            }
            
            var topView = result.GroupBy(e => e.da.FileId).OrderByDescending(e => e.Count()).Select(e => new { FileId = e.Key, ViewCount = e.Count() });
            return topView;
        }

        public async Task<(List<ActivityReportResult> Result, int TotalPage, int CurrentPage)> GetActivityReport(ActivityReport report)
        {
            int activityOption = report.ActivityOption;
            string planningArea = report.PlanningArea;
            List<int> option = new List<int>();
            if(activityOption == 0)
            {
                option.Add((int)DBActivity.Upload);
                option.Add((int)DBActivity.Download);
            }
            else
            {
                option.Add(activityOption);
            }

            var result = from da in _mediaLibraryContext.Set<DashboardActivity>()
                         join a in _mediaLibraryContext.Set<AllActivity>() on da.Activity equals a.AActivityId
                         join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                         where option.Contains(da.Activity) && da.FileId != "Deleted"
                         select new { da, a, fd };

            if (PlanningAreaExist(planningArea))
            {
                var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                result = result.Where(e => areaPolygon.Contains(e.fd.AreaPoint));
            }

            var activityReportResults = result.Select(e => new ActivityReportResult
            {
                FileId = e.da.FileId,
                ActivityDateTime = e.da.ActivityDateTime,
                ActivityType = e.a.ActivityType,
                Location = GetPlanningAreaNameByPoint(_mediaLibraryContext, e.fd.AreaPoint),
                ThumbnailURL = e.fd.ThumbnailURL,
                Email = e.da.Email
            }).AsQueryable();
            
            return GetActivityReportResult(activityReportResults, report);
        }

        private static List<string> GetPlanningAreaNameByPoint(MediaLibraryContext mlContext,Point areaPoint)
        {
            var result = mlContext.planningArea.Where(e => e.AreaPolygon.Contains(areaPoint)).Select(e => e.PlanningAreaName).ToList();
            return result;
        }

        private int getTotalPage(int itemPerPage, int? totalItem)
        {
            int totalPage = (((int)totalItem - 1) / itemPerPage) + 1;
            return totalPage;
        }

        public (List<ActivityReportResult> Result, int TotalPage, int CurrentPage) GetActivityReportResult(IQueryable<ActivityReportResult> result, ActivityReport report)
        {
            int activityOption = report.ActivityOption;
            string sortOption = report.SortOption;

            if (report.StartDate != null)
            {
                DateTime startDate = Convert.ToDateTime(report.StartDate);
                DateTime endDate = Convert.ToDateTime(report.EndDate).AddDays(1);
                result = result.Where(e => e.ActivityDateTime >= startDate && e.ActivityDateTime <= endDate);
            }

            int pageno = report.Page - 1;
            int itemPerPage = 30;
            int skipItem = pageno * itemPerPage;

            AllSortOption option;
            bool checkSort = Enum.TryParse(sortOption, out option);
            if (!checkSort)
            {
                _logger.LogError("Error in sorting activity report by {sort}", sortOption);
                return (new List<ActivityReportResult>(), 1, 1);
            }
            else
            {
                var currentSort = Enum.Parse(typeof(AllSortOption), sortOption);
                IOrderedQueryable newResult = null;
                switch (currentSort)
                {
                    case AllSortOption.dateASC:
                        newResult = result.OrderBy(e => e.ActivityDateTime);
                        break;
                    case AllSortOption.dateDSC:
                        newResult = result.OrderByDescending(e => e.ActivityDateTime);
                        break;
                    default:
                        break;
                }

                IQueryable<ActivityReportResult> activityReportResults = (IQueryable<ActivityReportResult>)newResult;
                if (report.Email != null && report.Email != "")
                {
                    activityReportResults = activityReportResults.Where(e => e.Email == report.Email);
                }

                return (Result: activityReportResults.Skip(skipItem).Take(itemPerPage).ToList(), TotalPage: getTotalPage(itemPerPage, activityReportResults.Count()), CurrentPage: pageno + 1);
            }
        }

        public Tuple<List<StaffResult>, int, int> GetAllStaff(StaffQuery staff)
        {
            List<int> option = new List<int>();
            option.Add((int)DBActivity.Upload);
            option.Add((int)DBActivity.Download);
            string searchQuery = staff.SearchQuery;

            var result = from da in _mediaLibraryContext.Set<DashboardActivity>()
                         where option.Contains(da.Activity) && da.FileId != "Deleted"
                         select da;

            if(searchQuery != null)
            {
                result = result.Where(e => e.Email.Contains(staff.SearchQuery));
            }

            var staffResult = result.GroupBy(e => e.Email).Select(e => new StaffResult
            {
                Email = e.Key,
                UploadCount = _mediaLibraryContext.dashboardActivity.Where(da => da.Activity == (int)DBActivity.Upload && da.Email == e.Key && da.FileId != "Deleted").GroupBy(da => da.Email).Select(da => da.Count()).FirstOrDefault(),
                DownloadCount = _mediaLibraryContext.dashboardActivity.Where(da => da.Activity == (int)DBActivity.Download && da.Email == e.Key && da.FileId != "Deleted").GroupBy(da => da.Email).Select(da => da.Count()).FirstOrDefault()
            }).AsQueryable();
            
            return GetStaffResult(staffResult, staff);
        }
        public Tuple<List<StaffResult>, int, int> GetStaffResult(IQueryable<StaffResult> result, StaffQuery staff)
        {
            int pageno = staff.Page - 1;
            int itemPerPage = 30;
            int skipResult = pageno * itemPerPage;
            string sortOption = staff.SortOption;

            AllSortOption option;
            bool checkSort = Enum.TryParse(sortOption, out option);
            if (!checkSort)
            {
                _logger.LogError("Error in sorting staff by {sort}", sortOption);
                return Tuple.Create(new List<StaffResult>(), 1, 1);
            }
            else
            {
                var currentSort = Enum.Parse(typeof(AllSortOption), sortOption);
                IOrderedQueryable newResult = null;
                switch (currentSort)
                {
                    case AllSortOption.uploadDSC:
                        newResult = result.OrderByDescending(e => e.UploadCount);
                        break;
                    case AllSortOption.uploadASC:
                        newResult = result.OrderBy(e => e.UploadCount);
                        break;
                    case AllSortOption.downloadDSC:
                        newResult = result.OrderByDescending(e => e.DownloadCount);
                        break;
                    case AllSortOption.downloadASC:
                        newResult = result.OrderBy(e => e.DownloadCount);
                        break;
                    default:
                        break;
                }

                IQueryable<StaffResult> staffResult = (IQueryable<StaffResult>)newResult;
                return Tuple.Create(staffResult.Skip(skipResult).Take(itemPerPage).ToList(), getTotalPage(itemPerPage, staffResult.Count()), pageno + 1);
            }
        }

        public List<DashboardActivity> GetAllActivity(string fileId)
        {
            List<int> option = new List<int>();
            option.Add((int)DBActivity.Upload);
            option.Add((int)DBActivity.Download);
            return (from da in _mediaLibraryContext.Set<DashboardActivity>()
                    where option.Contains(da.Activity) && da.FileId == fileId
                    select new DashboardActivity { DActivityId = da.DActivityId, FileId = da.FileId, Email = da.Email, Activity = da.Activity, ActivityDateTime = da.ActivityDateTime, DisplayName = da.DisplayName, Department = da.Department }).ToList();
        }

        public string GetActivityName(int id)
        {
            return _mediaLibraryContext.allActivity.Where(e => e.AActivityId == id).Select(e => e.ActivityType).FirstOrDefault();
        }

        public async Task<List<GenerateReportResult>> GenerateReport()
        {
            List<GenerateReportResult> result = new List<GenerateReportResult>();

            List<int> option = new List<int>();
            option.Add((int)DBActivity.Upload);
            option.Add((int)DBActivity.Download);
            option.Add((int)DBActivity.Edit);
            option.Add((int)DBActivity.Delete);

            var dashboardActivities = _mediaLibraryContext.dashboardActivity.Where(e => option.Contains(e.Activity)).ToList();
            foreach(DashboardActivity activity in dashboardActivities)
            {
                GenerateReportResult report = new GenerateReportResult();
                string fileId = activity.FileId;
                MediaItem item = new MediaItem();
                DeletedFiles deletedFile = new DeletedFiles();

                if(fileId == "Deleted" || activity.Activity == (int)DBActivity.Delete)
                {
                    if(fileId == "Deleted")
                    {
                        deletedFile = _mediaLibraryContext.deletedFiles.Where(e => e.DashboardActivityId == activity.DActivityId).FirstOrDefault();
                    }
                    else
                    {
                        deletedFile = _mediaLibraryContext.deletedFiles.Where(e => e.FileId == activity.FileId).FirstOrDefault();
                    }
                    if(deletedFile == null)
                    {
                        continue;
                    }
                    report.ImageName = deletedFile.Name;
                    report.ImageLocation = deletedFile.Location;
                    Point areaPoint = null;
                    List<string> planningAreaList = new List<string>();
                    if (deletedFile.PlanningArea != null)
                    {
                        areaPoint = new Point(item.Location.Longitude, item.Location.Latitude) { SRID = 4326 };
                        planningAreaList = GetPlanningAreaNameByPoint(_mediaLibraryContext, areaPoint);
                    }
                    string planningArea = "";
                    foreach (string area in planningAreaList)
                    {
                        planningArea = area;
                    }
                    report.PlanningArea = planningArea;
                    report.ImageURL = "";
                    report.StaffName = "";
                    report.Email = deletedFile.Email;
                    report.Department = "";
                    report.Group = "";
                    report.ActivityDateTime = deletedFile.ActivityDateTime;
                }
                else
                {
                    item = await _mediaSearchService.GetItemAsync(fileId);
                    if(item == null)
                    {
                        continue;
                    }
                    report.ImageName = item.Project;
                    report.ImageLocation = item.LocationName;
                    List<string> planningAreaList = new List<string>();
                    Point areaPoint = null;
                    if (item.Location != null)
                    {
                        areaPoint = new Point(item.Location.Longitude, item.Location.Latitude) { SRID = 4326 };
                        planningAreaList = GetPlanningAreaNameByPoint(_mediaLibraryContext, areaPoint);
                    }
                    string planningArea = "";
                    foreach (string area in planningAreaList)
                    {
                        planningArea = area;
                    }
                    report.PlanningArea = planningArea;
                    report.ImageURL = "https://medialibrary.uraaz.gov.sg/Gallery/Item/" + activity.FileId;
                    report.StaffName = "";
                    report.Email = activity.Email;
                    report.Department = "";
                    report.Group = "";
                    report.ActivityDateTime = activity.ActivityDateTime;
                }

                report.Activity = GetActivityName(activity.Activity);
                result.Add(report);
            }
            return result;
        }
    }
}
