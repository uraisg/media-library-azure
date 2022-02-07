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
        [Display(Name = "Name")]
        public string Project { get; set; }
        [Required]
        [Display(Name = "Location")]
        public string LocationText { get; set; }
        [Display(Name = "Copyright owner")]
        public string Copyright { get; set; }
    }
}
