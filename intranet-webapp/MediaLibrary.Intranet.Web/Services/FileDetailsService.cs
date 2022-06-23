﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;

namespace MediaLibrary.Intranet.Web.Services
{
    public class FileDetailsService
    {
        private readonly MediaLibraryContext _mediaLibraryContext;
        private static BlobContainerClient _blobContainerClient = null;
        private readonly AppSettings _appSettings;
        private readonly ILogger<FileDetailsService> _logger;

        public FileDetailsService(MediaLibraryContext mediaLibraryContext, IOptions<AppSettings> appSettings, ILogger<FileDetailsService> logger)
        {
            _mediaLibraryContext = mediaLibraryContext;
            _appSettings = appSettings.Value;
            _logger = logger;
            InitStorage();
        }

        private void InitStorage()
        {
            if (_blobContainerClient == null)
            {
                if (!string.IsNullOrEmpty(_appSettings.MediaStorageConnectionString))
                {
                    _blobContainerClient = new BlobContainerClient(_appSettings.MediaStorageConnectionString, _appSettings.MediaStorageImageContainer);
                }
                else
                {
                    string containerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}",
                        _appSettings.MediaStorageAccountName, _appSettings.MediaStorageImageContainer);
                    _blobContainerClient = new BlobContainerClient(new Uri(containerEndpoint), new DefaultAzureCredential());
                }
            }
        }

        public bool FileExist(string fileId)
        {
            return _mediaLibraryContext.fileDetails.Any(e => e.FileId == fileId);
        }

        public bool PlanningAreaExist(string planningArea)
        {
            if(planningArea == "ALL")
            {
                return false;
            }
            return _mediaLibraryContext.planningArea.Any(e => e.PlanningAreaName == planningArea);
        }

        public async Task<bool> AddDetailsAsync(FileDetails details)
        {
            await _mediaLibraryContext.AddAsync(details);
            try
            {
                await _mediaLibraryContext.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                System.Diagnostics.Debug.WriteLine("Error adding into database: " + e);
                _logger.LogError("Error adding {FileId} into FileDetails", details.FileId);
                return false;
            }
            return true;
        }

        public async Task AddDetailsForUpload(IList<MediaItem> mediaItem)
        {
            foreach (var item in mediaItem)
            {
                string fileName = item.FileURL.Remove(0, 12);
                BlobClient blobClient = _blobContainerClient.GetBlobClient(fileName);
                decimal fileSize = 0.0M;
                try
                {
                    BlobDownloadInfo download = await blobClient.DownloadAsync();
                    fileSize = (decimal)download.Details.ContentLength / 1048576;
                }
                catch (RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.BlobNotFound)
                {
                    System.Diagnostics.Debug.WriteLine("Error encountered: ", ex);
                }
                if (!FileExist(item.Id))
                {
                    Point areaPoint = null;
                    if(item.Location != null)
                    {
                        areaPoint = new Point(item.Location.Longitude, item.Location.Latitude) { SRID = 4326 };
                    }
                    FileDetails fileDetails = new FileDetails();
                    fileDetails.FDetailsId = Guid.NewGuid();
                    fileDetails.FileId = item.Id;
                    fileDetails.FileSize = fileSize;
                    fileDetails.AreaPoint = areaPoint;
                    fileDetails.ThumbnailURL = item.ThumbnailURL;
                    
                    if(await AddDetailsAsync(fileDetails))
                    {
                        _logger.LogInformation("Added {FileId} into FileDetails", fileDetails.FileId);
                    }
                }
            }
        }

        public FileDetails GetDetailsByFileId(string fileId)
        {
            return _mediaLibraryContext.fileDetails.Where(e => e.FileId == fileId).FirstOrDefault();
        }

        public async Task<bool> DeleteDetailsByFileIdAsync(string fileId)
        {
            FileDetails details = GetDetailsByFileId(fileId);
            _mediaLibraryContext.Remove(details);
            try
            {
                await _mediaLibraryContext.SaveChangesAsync();
            }
            catch(DbUpdateException e)
            {
                System.Diagnostics.Debug.WriteLine("Error deleting from database: " + e);
                _logger.LogError("Error adding {FileId} into FileDetails", fileId);
                return false;
            }
            return true;
        }

        private async Task<Geometry> GetPlanningAreaPolygonAsync(string planningArea)
        {
            return await _mediaLibraryContext.planningArea.Where(e => e.PlanningAreaName == planningArea).Select(e => e.AreaPolygon).FirstOrDefaultAsync();
        }

        public async Task<decimal> GetFileSizeAverageAsync(string planningArea)
        {
            decimal result = 0.0M;
            var allResult = _mediaLibraryContext.fileDetails.Select(e => e).AsQueryable();

            if (PlanningAreaExist(planningArea))
            {
                var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                allResult = allResult.Where(e => areaPolygon.Contains(e.AreaPoint));
            }

            if (allResult.Count() != 0)
            {
                result = Math.Round(allResult.Average(e => e.FileSize), 2);
            }
            return result;
        }

        public class FileSizeGroup
        {
            public decimal FileSize { get; set; }
            public int Count { get; set; }
        }
        public async Task<List<FileSizeGroup>> GetAllFileSizeByGroupAsync(string planningArea, int year)
        {
            var result = (from p in _mediaLibraryContext.Set<FileDetails>()
                        join da in _mediaLibraryContext.Set<DashboardActivity>() on p.FileId equals da.FileId
                        where da.ActivityDateTime.Year == year
                        select new { p, da });

            if (PlanningAreaExist(planningArea))
            {
                var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                result = result.Where(e => areaPolygon.Contains(e.p.AreaPoint));
            }

            var fileSize = await result.GroupBy(e => Math.Round(e.p.FileSize, 0)).Select(e => e.Key).ToListAsync();
            var count = await result.GroupBy(e => Math.Round(e.p.FileSize, 0)).Select(e => e.Count()).ToListAsync();

            List<FileSizeGroup> fileSizeGroup = new List<FileSizeGroup>();
            for(int i = 0; i < count.Count(); i++)
            {
                FileSizeGroup group = new FileSizeGroup()
                {
                    FileSize = fileSize[i],
                    Count = count[i]
                };
                fileSizeGroup.Add(group);
            }

            return fileSizeGroup;
        }

        public async Task<(List<FileReportResult> Result, int TotalPage, int CurrentPage)> GetFileReport(FileReport report)
        {
            string sortOption = report.SortOption;
            string planningArea = report.PlanningArea;
            IQueryable<FileReportResult> result = null;

            result = (from fd in _mediaLibraryContext.Set<FileDetails>()
                      select new FileReportResult
                      {
                          FileId = fd.FileId,
                          FileSize = fd.FileSize,
                          ViewCount = GetViewCountByFileId(_mediaLibraryContext, fd.FileId),
                          Location = GetPlanningAreaNameByFileId(_mediaLibraryContext, fd.FileId),
                          ThumbnailURL = fd.ThumbnailURL,
                          Email = GetEmailByFileId(_mediaLibraryContext, fd.FileId),
                          UploadDateTime = GetDateTimeByFileId(_mediaLibraryContext, fd.FileId),
                          DownloadCount = GetDownloadCountByFileId(_mediaLibraryContext, fd.FileId),
                          AreaPoint = fd.AreaPoint
                      }).AsQueryable();

            if (PlanningAreaExist(planningArea))
            {
                var areaPolygon = await GetPlanningAreaPolygonAsync(planningArea);
                result = result.Where(e => areaPolygon.Contains(e.AreaPoint));
            }

            return await GetFileReportResult(result, report);
        }

        private static int GetViewCountByFileId(MediaLibraryContext mlContext, string fileId)
        {
            var result = mlContext.dashboardActivity.Where(e => e.Activity == (int)DBActivity.View && e.FileId == fileId).GroupBy(e => e.FileId).Select(e => e.Count()).FirstOrDefault();
            return result;
        }

        private static List<string> GetPlanningAreaNameByFileId(MediaLibraryContext mlContext, string fileId)
        {
            var areaPoint = mlContext.fileDetails.Where(e => e.FileId == fileId).Select(e => e.AreaPoint).FirstOrDefault();
            var result = mlContext.planningArea.Where(e => e.AreaPolygon.Contains(areaPoint)).Select(e => e.PlanningAreaName).ToList();
            return result;
        }

        private static DateTime GetDateTimeByFileId(MediaLibraryContext mlContext, string fileId)
        {
            var result = mlContext.dashboardActivity.Where(e => e.Activity == 2 && e.FileId == fileId).Select(e => e.ActivityDateTime).FirstOrDefault();
            return result;
        }

        private static int GetDownloadCountByFileId(MediaLibraryContext mlContext, string fileId)
        {
            var result = mlContext.dashboardActivity.Where(e => e.Activity == (int)DBActivity.Download && e.FileId == fileId).GroupBy(e => e.FileId).Select(e => e.Count()).FirstOrDefault();
            return result;
        }

        private static string GetEmailByFileId(MediaLibraryContext mlContext, string fileId)
        {
            var result = mlContext.dashboardActivity.Where(e => e.Activity == (int)DBActivity.Upload && e.FileId == fileId).Select(e => e.Email).FirstOrDefault();
            return result;
        }

        public async Task<(List<FileReportResult> Result, int TotalPage, int CurrentPage)> GetFileReportResult(IQueryable<FileReportResult> result, FileReport report)
        {
            string sortOption = report.SortOption;
            string planningArea = report.PlanningArea;

            List<FileReportResult> originalResult = await result.ToListAsync();

            if (report.StartDate != null && report.EndDate != null)
            {
                DateTime startDate = Convert.ToDateTime(report.StartDate);
                DateTime endDate = Convert.ToDateTime(report.EndDate).AddDays(1);
                originalResult = await result.Where(e => e.UploadDateTime >= startDate && e.UploadDateTime <= endDate).ToListAsync();
            }

            int itemPerPage = 30;
            int pageno = report.Page - 1;
            int skipItem = itemPerPage * pageno;

            if (!Enum.IsDefined(typeof(AllSortOption), sortOption))
            {
                return (new List<FileReportResult>(), 1, 1);
            }

            if (sortOption == "dateDSC")
            {
                originalResult = originalResult.OrderByDescending(e => e.UploadDateTime).ToList();
            }
            else if (sortOption == "dateASC")
            {
                originalResult = originalResult.OrderBy(e => e.UploadDateTime).ToList();
            }
            else if (sortOption == "fileSizeDSC")
            {
                originalResult = originalResult.OrderByDescending(e => e.FileSize).ToList();
            }
            else if (sortOption == "fileSizeASC")
            {
                originalResult = originalResult.OrderBy(e => e.FileSize).ToList();
            }
            else if (sortOption == "viewStatsDSC")
            {
                originalResult = originalResult.OrderByDescending(e => e.ViewCount).ToList();
            }
            else if (sortOption == "viewStatsASC")
            {
                originalResult = originalResult.OrderBy(e => e.ViewCount).ToList();
            }
            else if (sortOption == "downloadStatsDSC")
            {
                originalResult = originalResult.OrderByDescending(e => e.DownloadCount).ToList();
            }
            else if (sortOption == "downloadStatsASC")
            {
                originalResult = originalResult.OrderBy(e => e.DownloadCount).ToList();
            }
            return (Result: originalResult.Skip(skipItem).Take(itemPerPage).ToList(), TotalPage: getTotalPage(itemPerPage, originalResult.Count()), CurrentPage: pageno + 1);
        }

        public int getTotalPage(int itemPerPage, int? totalItem)
        {
            int totalPage = (((int)totalItem - 1) / itemPerPage) + 1;
            return totalPage;
        }

        public async Task<bool> AddDeletedFileDetailsAsync(DeletedFiles details)
        {
            await _mediaLibraryContext.AddAsync(details);
            try
            {
                await _mediaLibraryContext.SaveChangesAsync();
            }
            catch(DbUpdateException e)
            {
                System.Diagnostics.Debug.WriteLine("Error adding into database: " + e);
                _logger.LogError("Error adding {FileId} into DeletedFiles", details.FileId);
                return false;
            }
            return true;
        }
    }
}
