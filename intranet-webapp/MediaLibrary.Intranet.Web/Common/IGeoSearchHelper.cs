using System.Collections.Generic;

namespace MediaLibrary.Intranet.Web.Common
{
    public interface IGeoSearchHelper
    {
        List<string> GetNames();

        Dictionary<string, string> GetDictionary();
    }
}
