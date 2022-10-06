using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System;
using Microsoft.Azure.Cosmos.Table;

namespace MediaLibrary.Internet.Web.Models
{
    public class DraftModel
    {
    }
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

    public class AddImageModel
    {
        [Required]
        [Display(Name = "Title for the images")]
        public string name { get; set; }
        [Required]
        [Display(Name = "Location of the images")]
        public string location { get; set; }
        [Required]
        [Display(Name = "Copyright Ownership")]
        public string copyright { get; set; }
        [Required]
        [Display(Name = "Image(s) to upload")]
        public IFormFile file { get; set; }
    }
}
