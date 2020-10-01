using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace MediaLibrary.Intranet.Web.Common
{
    public class GeoSearchHelper : IGeoSearchHelper
    {
        private readonly Dictionary<string, string> _dictionary; // key = name, value = WKT string for search boundary

        public GeoSearchHelper()
        {
            _dictionary = LoadData("planning-area-boundary.json");
        }

        private static Dictionary<string, string> LoadData(string path)
        {
            dynamic data = JsonHelper.ReadJsonFromFile<ExpandoObject>(path);
            var result = new Dictionary<string, string>();

            foreach (var feature in data.features)
            {
                // Extract polygon outer boundary from json, ignoring any inner rings
                List<object> outerRing = feature.geometry.coordinates[0] as List<object>;
                List<double[]> pointsList = outerRing.Select(x => (x as List<object>).Cast<double>().ToArray()).ToList();

                // Generate WKT
                string wkt = "POLYGON((" + string.Join(",", pointsList.Select(point => string.Join(" ", point))) + "))";

                string name = feature.properties.PLN_AREA_N;
                result.Add(name, wkt);
            }

            return result;
        }

        public Dictionary<string, string> GetDictionary()
        {
            return _dictionary;
        }

        public List<string> GetNames()
        {
            return _dictionary.Keys.ToList();
        }
    }
}
