using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Models
{
 
    public class ActiveAndSuspendUsers
    {

        public List<string> UserIds { get; set; }

        public string UserStatus { get; set; }  
    }

    public class AssignedAndRevokeUsers
    {
        public List<string> UserIds { get; set; }

        public List<string> roles { get; set; }
        public string roleChange { get; set; }
    }
}
