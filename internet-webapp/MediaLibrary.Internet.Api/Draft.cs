using System;
using Microsoft.Azure.Cosmos.Table;

namespace MediaLibrary.Internet.Api
{
    public class Draft : TableEntity
    {
        public Draft()
        {
            PartitionKey = "draft";
            RowKey = Guid.NewGuid().ToString();
        }
        public DateTime UploadDate { get; set; }
        public string Author { get; set; }
        public string ImageEntities { get; set; }
    }
}
