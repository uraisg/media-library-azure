using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediaLibrary.Intranet.Web.Common
{
    public interface IGeoSearchHelper
    {
        List<string> GetNames();

        Dictionary<string, string> GetDictionary();
    }
}
