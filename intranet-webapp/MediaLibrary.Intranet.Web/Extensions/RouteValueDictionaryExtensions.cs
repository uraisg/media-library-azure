using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Routing;

namespace MediaLibrary.Intranet.Web.Extensions
{
    public static class RouteValueDictionaryExtensions
    {
        public static RouteValueDictionary Combine(this RouteValueDictionary v1, IEnumerable<KeyValuePair<string, object>> v2)
        {
            var merged = new RouteValueDictionary(v1);
            v2.ToList().ForEach(x => { merged[x.Key] = x.Value; });
            return merged;
        }
    }
}
