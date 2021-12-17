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

        // Ui changes: Mandatory
        [Required]
        [Display(Name = "Name", Prompt = "your project or event name")]
        public string Project { get; set; }

        // Ui changes: Commented out "Event name" to sync in "Project Name + Event name" in one single field
        /*[Display(Name = "Event name")]
        public string Event { get; set; }*/

        // Ui changes: Mandatory
        [Required]
        [Display(Name = "Location", Prompt = "e.g., building name, road name")]
        public string LocationText { get; set; }

        // Ui changes: Not making this mandatory to fill in
        [Display(Name = "Copyright", Prompt = "Copyright owner")]
        public string Copyright { get; set; }
    }
}
