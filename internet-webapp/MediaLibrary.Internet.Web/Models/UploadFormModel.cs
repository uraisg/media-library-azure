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
        [Required]
        [Display(Name = "Name", Prompt = "your project or event name")]
        public string Project { get; set; }
        [Required]
        [Display(Name = "Location", Prompt = "e.g., building name, road name")]
        public string LocationText { get; set; }
        [Display(Name = "Copyright", Prompt = "Copyright owner")]
        public string Copyright { get; set; }
    }
}
