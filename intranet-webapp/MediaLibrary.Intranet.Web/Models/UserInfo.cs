using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediaLibrary.Intranet.Web.Models
{
    public class UserInfo
    {
        public string Mail { get; set; }
        public string DisplayName { get; set; }

        // TODO: temporary field, to be removed
        public string Department { get; set; }
    }
}
