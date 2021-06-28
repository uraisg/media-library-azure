using System.Collections.Generic;

namespace MediaLibrary.Intranet.Web.Common
{
    public interface IGeoSearchHelper
    {
        Dictionary<string, AreaPolygon> GetDictionary();
    }

    public class AreaPolygon
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string WktPolygon { get; set; }
    }
}
