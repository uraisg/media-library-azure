using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Models;

namespace MediaLibrary.Intranet.Web.Services
{
    public class PlanningAreaService
    {
        public readonly MediaLibraryContext _mediaLibraryContext;

        public PlanningAreaService(MediaLibraryContext mediaLibraryContext)
        {
            _mediaLibraryContext = mediaLibraryContext;
        }

        public List<PlanningArea> GetAllPlanningAreaNames()
        {
            var planningAreaName = _mediaLibraryContext.planningArea.ToList<PlanningArea>();
            return planningAreaName;
        }

        public Region GetRegionById(int id)
        {
            var region = _mediaLibraryContext.region.Where<Region>(e=> e.RegionId == id).FirstOrDefault();
            return region;
        }  
    }
}
