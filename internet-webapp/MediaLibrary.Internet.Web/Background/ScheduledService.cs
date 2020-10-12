using MediaLibrary.Internet.Web.Models;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using NCrontab;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MediaLibrary.Internet.Web.Background
{
    public class ScheduledService : BackgroundService
    {
        private CrontabSchedule _schedule;
        private DateTime _nextRun;
        //Run every 1 hour
        private string Schedule => "0 0/1 * * * *";

        private readonly AppSettings _appSettings;

        public ScheduledService(IOptions<AppSettings> appSettings)
        {
            _schedule = CrontabSchedule.Parse(Schedule, new CrontabSchedule.ParseOptions { IncludingSeconds = true });
            _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
            _appSettings = appSettings.Value;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            do
            {
                var now = DateTime.Now;
                var nextrun = _schedule.GetNextOccurrence(now);
                if (now > _nextRun)
                {
                    await Process();
                    _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
                }
                await Task.Delay(5000, stoppingToken);
            }
            while (!stoppingToken.IsCancellationRequested);
        }

        private async Task Process()
        {
            string tableName = _appSettings.MediaStorageTable;
            string storageConnectionString = _appSettings.MediaStorageConnectionString;

            //initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(storageConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            //generate partition key - delete images from past 5 minute
            string partitionKey = DateTime.UtcNow.AddHours(8).AddMinutes(-5).Minute.ToString();

            //query by partition key
            try
            {
                TableQuery<ImageEntity> partitionScanQuery = new TableQuery<ImageEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, partitionKey));

                TableContinuationToken token = null;

                do
                {
                    TableQuerySegment<ImageEntity> segment = await table.ExecuteQuerySegmentedAsync(partitionScanQuery, token);
                    token = segment.ContinuationToken;

                    int deleteCount = 0;
                    foreach (ImageEntity entity in segment)
                    {
                        TableOperation deleteOperation = TableOperation.Delete(entity);
                        TableResult result = await table.ExecuteAsync(deleteOperation);
                        deleteCount++;
                    }

                    Console.WriteLine($"Deleted {deleteCount} entities, with partition {partitionKey}");
                }
                while (token != null);
            }
            catch (StorageException e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
    }
}
