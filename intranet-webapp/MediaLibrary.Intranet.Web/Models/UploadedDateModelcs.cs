using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediaLibrary.Intranet.Web.Models
{
    public class UploadedDateModelcs
    {
        public string uploadDate { get; set; }
        public string takenDate { get; set; }

        public string thedate { get; set; }
    }

    public enum photodate
    {
        uploadDate,
        takenDate
    }
}
