using System.Collections.Generic;
using System.Dynamic;
using System.Linq;

namespace MediaLibrary.Intranet.Web.Common
{
    public class GeoSearchHelper : IGeoSearchHelper
    {
        private readonly Dictionary<string, AreaPolygon> _dictionary; // key = name, value = WKT string for search boundary
        private readonly List<PlanningRegion> _regions;

        public GeoSearchHelper()
        {
            _dictionary = LoadData("planning-area-boundary.json");
            _regions = GroupRegions(_dictionary);
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
                    Region = feature.properties.CA_IND == "Y" ? "CENTRAL AREA" : feature.properties.REGION_N,
                    WktPolygon = wkt
                });
            }

            return result;
        }

        private static List<PlanningRegion> GroupRegions(Dictionary<string, AreaPolygon> dictionary)
        {
            var areasByRegion = dictionary.Values
                .OrderBy(s => s.Region)
                .ThenBy(s => s.Name)
                .GroupBy(s => s.Region, (region, areas) => new PlanningRegion()
                {
                    Region = region,
                    Areas = areas.Select(s => new PlanningArea() { Id = s.Id, Name = s.Name }).ToList().AsReadOnly()
                });

            return areasByRegion.ToList();
        }

        public bool TryGetPolygonFromId(string id, out AreaPolygon areaPolygon)
        {
            return _dictionary.TryGetValue(id, out areaPolygon);
        }

        public IList<PlanningRegion> GetRegions()
        {
            return _regions.AsReadOnly();
        }
    }
}
