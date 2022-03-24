using System.Collections.Generic;

namespace MediaLibrary.Intranet.Web.Common
{
    public interface IGeoSearchHelper
    {
        /// <summary>
        /// Attempts to get the AreaPolygon associated with the specified id.
        /// </summary>
        /// <param name="id">The id of the AreaPolygon to get</param>
        /// <param name="areaPolygon">
        /// When this method returns, contains the AreaPolygon associated with the specified id if it exists, or <see langword="null" /> is it cannot be found.
        /// </param>
        /// <returns>
        /// <see langword="true"/> if the AreaPolygon is found; <see langword="false"/> otherwise.
        /// </returns>
        bool TryGetPolygonFromId(string id, out AreaPolygon areaPolygon);

        /// <summary>
        /// Returns the list of PlanningRegion.
        /// </summary>
        /// <returns>List of PlanningRegion.</returns>
        IList<PlanningRegion> GetRegions();
    }

    public struct AreaPolygon
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Region { get; set; }
        public string WktPolygon { get; set; }
    }

    public struct PlanningArea
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public struct PlanningRegion
    {
        public string Region { get; set; }

        public IReadOnlyList<PlanningArea> Areas { get; set; }
    }
}
