﻿using System;
using System.Collections.Generic;
using Microsoft.Azure.Cosmos.Table;
using Newtonsoft.Json;

namespace MediaLibrary.Internet.Api
{
    public class ImageEntity : TableEntity
    {
        public ImageEntity()
        {
            PartitionKey = DateTime.UtcNow.AddHours(8).Minute.ToString();
            RowKey = Guid.NewGuid().ToString();
        }
        public string Id { get; set; }
        public string Name { get; set; }
        public DateTime DateTaken { get; set; }
        public string Location { get; set; }
        public string Tag { get; set; }
        public string Caption { get; set; }
        public string Author { get; set; }
        public DateTime UploadDate { get; set; }
        public string FileURL { get; set; }
        public string ThumbnailURL { get; set; }
        public string Project { get; set; }
        public string Event { get; set; }
        public string LocationName { get; set; }
        public string Copyright { get; set; }
        public string AdditionalField { get; set; }
        public string DeclarationCheckbox { get; set; }
    }
}
