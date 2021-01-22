using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MediaLibrary.Internet.Web.Models
{
    public class UploadFormModel
    {
        [Required]
        [Display(Name = "Image(s) to upload")]
        public List<IFormFile> File { get; set; }
        [Display(Name = "Project name")]
        public string Project { get; set; }
        [Display(Name = "Event name")]
        public string Event { get; set; }
        [Display(Name = "Location", Prompt = "e.g., building name, road name")]
        public string LocationText { get; set; }
        [Display(Name = "Copyright", Prompt = "Copyright owner")]
        public string Copyright { get; set; }
    }
}
