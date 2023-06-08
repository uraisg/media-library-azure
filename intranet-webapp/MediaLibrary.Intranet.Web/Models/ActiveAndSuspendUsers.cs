using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Models
{
 
    public class ActiveAndSuspendUsers
    {

        public List<string> UserIds { get; set; }

        public string UserStatus { get; set; }  
    }
}
