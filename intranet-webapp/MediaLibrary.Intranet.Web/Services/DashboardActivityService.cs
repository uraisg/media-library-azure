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
        private List<string> allSortOption = new AllSortOption().SortOptions;
        public DBActivity selectActivity = new DBActivity();
        private readonly ILogger<DashboardActivityService> _logger;
        public DashboardActivityService(MediaLibraryContext mlContext, MediaSearchService mediaSearchService, ILogger<DashboardActivityService> logger)
        {
            _mediaLibraryContext = mlContext;
            _mediaSearchService = mediaSearchService;
            _logger = logger;
        }

        public bool EmailExist(string email)
        {
            return _mediaLibraryContext.dashboardActivity.Where(e => e.Activity == selectActivity.Upload || e.Activity == selectActivity.Download).Any(e => e.Email == email);
        }

        public bool ActivityExist(string fileId)
        {
            return _mediaLibraryContext.dashboardActivity.Any(e => e.FileId == fileId);
        }

        public bool UploadActivityExist(string fileId)
        {
            return _mediaLibraryContext.dashboardActivity.Where(x => x.Activity == selectActivity.Upload).Any(e => e.FileId == fileId);
        }

        public bool PlanningAreaExist(string planningArea)
        {
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
            catch(DbUpdateException e)
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
                    DashboardActivity dashboardActivity = new DashboardActivity();
                    dashboardActivity.DActivityId = Guid.NewGuid();
                    dashboardActivity.FileId = item.Id;
                    dashboardActivity.Email = item.Author;
                    dashboardActivity.ActivityDateTime = item.UploadDate;
                    dashboardActivity.Activity = selectActivity.Upload;
                    if(await AddActivityAsync(dashboardActivity))
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
            foreach(DashboardActivity activity in activities)
            {
                if(activity.Activity == selectActivity.View)
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
                Activity = selectActivity.Delete
            };
            await _mediaLibraryContext.AddAsync(dashboardActivity);

            try
            {
                await _mediaLibraryContext.SaveChangesAsync();
            }
            catch(DbUpdateException e)
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
            if(planningArea == "ALL")
            {
                year = await _mediaLibraryContext.dashboardActivity.OrderBy(e => e.ActivityDateTime).Select(e => e.ActivityDateTime.Year).FirstOrDefaultAsync();
            }
            else
            {
                if (PlanningAreaExist(planningArea))
                {
                    var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                    year = await (from da in _mediaLibraryContext.Set<DashboardActivity>()
                                  join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                                  where areaPolygon.Contains(fd.AreaPoint)
                                  orderby da.ActivityDateTime
                                  select new { da.ActivityDateTime.Year }).Select(e => e.Year).FirstOrDefaultAsync();
                }
            }
            return year;
        }

        private async Task<Geometry> GetPlanningAreaPolygonAsync(string planningArea)
        {
            //Retrieve the Polygon
            var polygon = await (from pa in _mediaLibraryContext.Set<PlanningArea>()
                           where pa.PlanningAreaName == planningArea
                           select new { pa.AreaPolygon }).FirstOrDefaultAsync();
            return polygon.AreaPolygon;
        }
        public async Task<Tuple<string,string>> GetActivityCountAsync(string planningArea)
        {
            //Item1 = Upload Count
            //Item2 = Download Count
            var result = Tuple.Create("0", "0");
            if (planningArea == "ALL")
            {
                var uploadCount = await (from da in _mediaLibraryContext.Set<DashboardActivity>()
                          where da.Activity == selectActivity.Upload && da.FileId != "Deleted"
                          select new { da.DActivityId }).CountAsync();
                var downloadCount = await (from da in _mediaLibraryContext.Set<DashboardActivity>()
                                     where da.Activity == selectActivity.Download && da.FileId != "Deleted"
                                     select new { da.DActivityId }).CountAsync();
                return Tuple.Create(uploadCount.ToString(), downloadCount.ToString());
            }
            else
            {
                if (PlanningAreaExist(planningArea))
                {
                    var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                    var uploadCount = await (from da in _mediaLibraryContext.Set<DashboardActivity>()
                              join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                              where areaPolygon.Contains(fd.AreaPoint) && da.Activity == selectActivity.Upload && da.FileId != "Deleted"
                              select new { da.DActivityId }).CountAsync();
                    var downloadCount = await (from da in _mediaLibraryContext.Set<DashboardActivity>()
                                         join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                                         where areaPolygon.Contains(fd.AreaPoint) && da.Activity == selectActivity.Download && da.FileId != "Deleted"
                                         select new { da.DActivityId }).CountAsync();
                    return Tuple.Create(uploadCount.ToString(), downloadCount.ToString());
                }
            }
            return result;
        }

        public async Task<IQueryable> GetActivityCountByMonthAsync(string planningArea, int year, int activitySelected)
        {
            IQueryable result = null;

            if (planningArea == "ALL")
            {
                result = from d in _mediaLibraryContext.Set<DashboardActivity>()
                         where d.Activity == activitySelected && d.ActivityDateTime.Year == year && d.FileId != "Deleted"
                         group d by d.ActivityDateTime.Month
                            into g
                         select new { g.Key, Count = g.Count() };
            }
            else
            {
                if (PlanningAreaExist(planningArea))
                {
                    var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                    result = from d in _mediaLibraryContext.Set<DashboardActivity>()
                             join fd in _mediaLibraryContext.Set<FileDetails>() on d.FileId equals fd.FileId
                             where d.Activity == activitySelected && d.ActivityDateTime.Year == year && areaPolygon.Contains(fd.AreaPoint) && d.FileId != "Deleted"
                             group d by d.ActivityDateTime.Month
                                into g
                             select new { g.Key, Count = g.Count() };
                }
            }

            return result;
        }

        public async Task<IQueryable> GetViewCountTop5Async(string planningArea)
        {
            IQueryable result = null;
            if(planningArea == "ALL")
            {
                result = (from da in _mediaLibraryContext.Set<DashboardActivity>()
                              where da.Activity == selectActivity.View && da.FileId != "Deleted"
                              group da by da.FileId
                              into g
                              orderby g.Count() descending
                              select new { g.Key, Count = g.Count() }).Take(5);
            }
            else
            {
                if (PlanningAreaExist(planningArea))
                {
                    var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                    result = (from da in _mediaLibraryContext.Set<DashboardActivity>()
                              join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                              where da.Activity == selectActivity.View && areaPolygon.Contains(fd.AreaPoint) && da.FileId != "Deleted"
                              group da by da.FileId
                                into g
                              orderby g.Count() descending
                              select new { g.Key, Count = g.Count() }).Take(5);
                }
            }
            return result;
        }

        public async Task<Tuple<List<ActivityReportResult>, int, int>> GetActivityReport(ActivityReport report)
        {
            int activityOption = report.ActivityOption;
            string planningArea = report.PlanningArea;
            List<int> option = new List<int>();
            if(activityOption == 0)
            {
                option.Add(selectActivity.Upload);
                option.Add(selectActivity.Download);
            }
            else
            {
                option.Add(activityOption);
            }

            List<ActivityReportResult> result = new List<ActivityReportResult>();

            if (planningArea == "ALL")
            {
                result = (from da in _mediaLibraryContext.Set<DashboardActivity>()
                          join a in _mediaLibraryContext.Set<AllActivity>() on da.Activity equals a.AActivityId
                          join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                          where option.Contains(da.Activity) && da.FileId != "Deleted"
                          select new ActivityReportResult { FileId = da.FileId, ActivityDateTime = da.ActivityDateTime, ActivityType = a.ActivityType, Location = GetPlanningAreaNameByPoint(_mediaLibraryContext, fd.AreaPoint), ThumbnailURL = fd.ThumbnailURL, Email = da.Email, StaffName = da.DisplayName, Department = da.Department }).ToList();
            }
            else
            {
                if (PlanningAreaExist(planningArea))
                {
                    var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                    List<string> locationList = new List<string> { planningArea };

                    result = (from da in _mediaLibraryContext.Set<DashboardActivity>()
                              join a in _mediaLibraryContext.Set<AllActivity>() on da.Activity equals a.AActivityId
                              join fd in _mediaLibraryContext.Set<FileDetails>() on da.FileId equals fd.FileId
                              where option.Contains(da.Activity) && areaPolygon.Contains(fd.AreaPoint) && da.FileId != "Deleted"
                              select new ActivityReportResult { FileId = da.FileId, ActivityDateTime = da.ActivityDateTime, ActivityType = a.ActivityType, Location = locationList, ThumbnailURL = fd.ThumbnailURL, Email = da.Email, StaffName = da.DisplayName, Department = da.Department }).ToList();

                }
            }
            
            return GetActivityReportResult(result, report);
        }

        private static List<string> GetPlanningAreaNameByPoint(MediaLibraryContext mlContext,Point areaPoint)
        {
            var result = (from pa in mlContext.Set<PlanningArea>()
                          where pa.AreaPolygon.Contains(areaPoint)
                         select pa.PlanningAreaName).ToList();
            return result;
        }

        private int getTotalPage(int itemPerPage, int? totalItem)
        {
            int totalPage = (((int)totalItem - 1) / itemPerPage) + 1;
            return totalPage;
        }

        public Tuple<List<ActivityReportResult>, int, int> GetActivityReportResult(List<ActivityReportResult> result, ActivityReport report)
        {
            int activityOption = report.ActivityOption;
            string sortOption = report.SortOption;
            List<ActivityReportResult> originalResult = result;
            if (report.StartDate != null)
            {
                DateTime startDate = Convert.ToDateTime(report.StartDate);
                DateTime endDate = Convert.ToDateTime(report.EndDate).AddDays(1);
                result = result.Where(e => e.ActivityDateTime >= startDate && e.ActivityDateTime <= endDate).ToList();
            }

            int pageno = report.Page - 1;
            int itemPerPage = 30;
            int skipItem = pageno * itemPerPage;

            if (!allSortOption.Contains(sortOption))
            {
                return Tuple.Create(new List<ActivityReportResult>(), 1, 1);
            }

            if (sortOption == "dateASC")
            {
                result = result.OrderBy(e => e.ActivityDateTime).ToList();
            }
            else if (sortOption == "dateDSC")
            {
                result = result.OrderByDescending(e => e.ActivityDateTime).ToList();
            }
            if (report.Email != null && report.Email != "")
            {
                result = result.Where(e => e.Email == report.Email).ToList();
                return Tuple.Create(result.Skip(skipItem).Take(itemPerPage).ToList(), getTotalPage(itemPerPage, result.Count()), pageno + 1);
            }
            return Tuple.Create(result.Skip(skipItem).Take(itemPerPage).ToList(), getTotalPage(itemPerPage, result.Count()), pageno + 1);
        }

        public Tuple<IEnumerable<StaffResult>, int, int> GetAllStaff(StaffQuery staff)
        {
            List<int> option = new List<int>();
            option.Add(selectActivity.Upload);
            option.Add(selectActivity.Download);
            List<StaffResult> result = new List<StaffResult>();
            string searchQuery = staff.SearchQuery;

            if(searchQuery == null)
            {
                result = (from da in _mediaLibraryContext.Set<DashboardActivity>()
                          where option.Contains(da.Activity) && da.FileId != "Deleted"
                          group da by da.Email
                         into g
                          select new StaffResult { Email = g.Key, UploadCount = GetUploadCountByEmail(_mediaLibraryContext, g.Key), DownloadCount = GetDownloadCountByEmail(_mediaLibraryContext, g.Key), StaffName = GetStaffByEmail(_mediaLibraryContext, g.Key).Item1, Department = GetStaffByEmail(_mediaLibraryContext, g.Key).Item2 }).ToList();
            }
            else
            {
                result = (from da in _mediaLibraryContext.Set<DashboardActivity>()
                              where option.Contains(da.Activity) && da.Email.Contains(staff.SearchQuery) && da.FileId != "Deleted"
                              group da by da.Email
                         into g
                              select new StaffResult { Email = g.Key, UploadCount = GetUploadCountByEmail(_mediaLibraryContext, g.Key), DownloadCount = GetDownloadCountByEmail(_mediaLibraryContext, g.Key), StaffName = GetStaffByEmail(_mediaLibraryContext, g.Key).Item1, Department = GetStaffByEmail(_mediaLibraryContext, g.Key).Item2 }).ToList();
            }
            
            return GetStaffResult(result, staff);
        }

        private static int GetUploadCountByEmail(MediaLibraryContext mlContext, string email)
        {
            DBActivity selectActivity = new DBActivity();
            var result = (from da in mlContext.Set<DashboardActivity>()
                         where da.Activity == selectActivity.Upload && da.Email == email && da.FileId != "Deleted"
                          group da by da.Email
                         into g
                         select g.Count()).FirstOrDefault();
            return result;
        }

        private static int GetDownloadCountByEmail(MediaLibraryContext mlContext, string email)
        {
            DBActivity selectActivity = new DBActivity();
            var result = (from da in mlContext.Set<DashboardActivity>()
                          where da.Activity == selectActivity.Download && da.Email == email && da.FileId != "Deleted"
                          group da by da.Email
                          into g
                          select g.Count()).FirstOrDefault();
            return result;
        }

        private static Tuple<string, string> GetStaffByEmail(MediaLibraryContext mlContext, string email)
        {
            DBActivity selectActivity = new DBActivity();
            var result = (from da in mlContext.Set<DashboardActivity>()
                          where da.Activity == selectActivity.Upload && da.Email == email && da.FileId != "Deleted"
                          select new { da.DisplayName, da.Department }).FirstOrDefault();
            return Tuple.Create(result.DisplayName, result.Department);
        }

        public Tuple<IEnumerable<StaffResult>, int, int> GetStaffResult(List<StaffResult> result, StaffQuery staff)
        {
            int pageno = staff.Page - 1;
            int itemPerPage = 30;
            int skipResult = pageno * itemPerPage;
            string sortOption = staff.SortOption;

            if (!allSortOption.Contains(sortOption))
            {
                result = new List<StaffResult>();
            }

            if(sortOption == "uploadDSC")
            {
                result = result.OrderByDescending(e => e.UploadCount).ToList();
            }
            else if (sortOption == "uploadASC")
            {
                result = result.OrderBy(e => e.UploadCount).ToList();
            }
            else if(sortOption == "downloadDSC")
            {
                result = result.OrderByDescending(e => e.DownloadCount).ToList();
            }
            else if (sortOption == "downloadASC")
            {
                result = result.OrderBy(e => e.DownloadCount).ToList();
            }

            return Tuple.Create(result.Skip(skipResult).Take(itemPerPage), getTotalPage(itemPerPage, result.Count()), pageno + 1);
        }

        public List<DashboardActivity> GetAllActivity(string fileId)
        {
            List<int> option = new List<int>();
            option.Add(selectActivity.Upload);
            option.Add(selectActivity.Download);
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
            option.Add(selectActivity.Upload);
            option.Add(selectActivity.Download);
            option.Add(selectActivity.Edit);
            option.Add(selectActivity.Delete);

            var dashboardActivities = _mediaLibraryContext.dashboardActivity.Where(e => option.Contains(e.Activity)).ToList();
            foreach(DashboardActivity activity in dashboardActivities)
            {
                GenerateReportResult report = new GenerateReportResult();
                string fileId = activity.FileId;
                MediaItem item = new MediaItem();
                DeletedFiles deletedFile = new DeletedFiles();

                if(fileId == "Deleted" || activity.Activity == selectActivity.Delete)
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
                    report.StaffName = activity.DisplayName;
                    report.Email = deletedFile.Email;
                    report.Department = activity.Department;
                    report.Group = "(Group)";
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
                    report.ImageURL = "";
                    report.StaffName = activity.DisplayName;
                    report.Email = activity.Email;
                    report.Department = activity.Department;
                    report.Group = "(Group)";
                    report.ActivityDateTime = activity.ActivityDateTime;
                }

                report.Activity = GetActivityName(activity.Activity);
                result.Add(report);
            }
            return result;
        }
    }
}
