using System.Collections.Generic;
using System.Dynamic;
using System.Linq;

namespace MediaLibrary.Intranet.Web.Common
{
    public class GeoSearchHelper : IGeoSearchHelper
    {
        private readonly Dictionary<string, AreaPolygon> _dictionary; // key = name, value = WKT string for search boundary

        public GeoSearchHelper()
        {
            _dictionary = LoadData("planning-area-boundary.json");
        }

        private static Dictionary<string, AreaPolygon> LoadData(string path)
        {
            dynamic data = JsonHelper.ReadJsonFromFile<ExpandoObject>(path);
            var result = new Dictionary<string, AreaPolygon>();

            foreach (var feature in data.features)
            {
                // Extract polygon outer boundary from json, ignoring any inner rings
                List<object> outerRing = feature.geometry.coordinates[0] as List<object>;
                List<double[]> pointsList = outerRing.Select(x => (x as List<object>).Cast<double>().ToArray()).ToList();

                // Generate WKT
                string wkt = "POLYGON((" + string.Join(",", pointsList.Select(point => string.Join(" ", point))) + "))";

                string id = feature.properties.PLN_AREA_C;
                result.Add(id, new AreaPolygon()
                {
                    Id = feature.properties.PLN_AREA_C,
                    Name = feature.properties.PLN_AREA_N,
                    WktPolygon = wkt
                });
            }

            return result;
        }

        public Dictionary<string, AreaPolygon> GetDictionary()
        {
            return _dictionary;
        }
    }
}
