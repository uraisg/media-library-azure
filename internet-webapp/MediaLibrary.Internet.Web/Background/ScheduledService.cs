using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Spatial;
using NCrontab;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Table;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json.Linq;
using MediaLibrary.Internet.Web.Controllers;

namespace MediaLibrary.Internet.Web.Background
{
    /// <summary>
    /// A recurring background job to delete Draft after some time
    /// </summary>
    public class ScheduledService : BackgroundService
    {
        private CrontabSchedule _schedule;
        private DateTime _nextRun;

        // Run once at every second minute
        private static readonly string Schedule = "59 23 * * *";
        private static readonly int timeBetweenRun = 1; // Days

        private static readonly string DraftPartitionKey = "draft";

        private readonly AppSettings _appSettings;
        private readonly ILogger<ScheduledService> _logger;

        public ScheduledService(IOptions<AppSettings> appSettings, ILogger<ScheduledService> logger)
        {
            _schedule = CrontabSchedule.Parse(Schedule);
            _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Yield();

            _logger.LogInformation("ScheduledService started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    if (now > _nextRun)
                    {
                        await Process();
                        _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unhandled exception occurred, will retry processing at next interval");
                }

                await Task.Delay(15000, stoppingToken);
            }
        }

        private async Task Process()
        {
            _logger.LogInformation("Starting background processing");

            await DraftController.RemoveDraftAndImages(_appSettings.TableConnectionString, _appSettings.TableName, _appSettings.MediaStorageContainer, _appSettings.MediaStorageConnectionString);
        }
    }
}
