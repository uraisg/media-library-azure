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

            string tableConnectionString = _appSettings.TableConnectionString;
            string tableName = _appSettings.TableName;
            string containerName = _appSettings.MediaStorageContainer;
            string storageConnectionString = _appSettings.MediaStorageConnectionString;

            //initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(tableConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            //create a blob container client
            BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString, containerName);

            TableQuery<Draft> query = new TableQuery<Draft>();

            foreach (Draft entity in table.ExecuteQuery(query))
            {
                if (entity.PartitionKey == DraftPartitionKey)
                {
                    if (entity.Timestamp < DateTime.Now.AddDays(-timeBetweenRun))
                    {
                        JArray imageEntities = JArray.Parse(entity.ImageEntities);

                        // Delete Images
                        for (int i = 0; i < imageEntities.Count; i++)
                        {
                            var fileName = imageEntities[i]["Id"] + "_" + imageEntities[i]["Name"];

                            var thumbArray = imageEntities[i]["Name"].ToString().Split(".");
                            var thumbName = imageEntities[i]["Id"] + "_" + thumbArray[0];
                            var middleThumbArray = thumbArray.Skip(1).Take(thumbArray.Length - 2);
                            foreach (var thumb in middleThumbArray)
                            {
                                thumbName += "." + thumb;
                            }
                            thumbName += "_thumb.jpg";

                            var fileBlob = blobContainerClient.GetBlobClient(fileName);
                            var thumnBlob = blobContainerClient.GetBlobClient(thumbName);
                            await fileBlob.DeleteIfExistsAsync();
                            await thumnBlob.DeleteIfExistsAsync();
                        }

                        // Delete Draft
                        var tableEntity = new Draft
                        {
                            PartitionKey = DraftPartitionKey,
                            RowKey = entity.RowKey,
                            ETag = "*"
                        };

                        TableOperation deleteOperation = TableOperation.Delete(tableEntity);
                        await table.ExecuteAsync(deleteOperation);
                    }
                }
            }
        }
    }
}
