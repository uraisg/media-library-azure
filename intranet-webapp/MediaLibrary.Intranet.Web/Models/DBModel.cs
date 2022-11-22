﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;

namespace MediaLibrary.Intranet.Web.Models
{
    public class DeletedFiles
    {
        public Guid Id { get; set; }
        public string FileId { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public Point PlanningArea { get; set; }
        public string Email { get; set; }
        public DateTime ActivityDateTime { get; set; }
        public Guid DashboardActivityId { get; set; }
    }
    public class AllActivity
    {
        public int Id { get; set; }
        public string ActivityType { get; set; }
    }

    public class DBActivity
    {
        public int View = 1;
        public int Upload = 2;
        public int Download = 3;
        public int Delete = 4;
        public int Edit = 5;
    }

    public class DashboardActivity
    {
        public Guid Id { get; set; }
        public string FileId { get; set; }
        public string Email { get; set; }
        public DateTime ActivityDateTime { get; set; }
        public int Activity { get; set; }

        //TODO: To be Removed
        public string Department { get; set; }
        public string DisplayName { get; set; }
    }

    public class FileDetails
    {
        public Guid Id { get; set; }
        public string FileId { get; set; }
        public decimal FileSize { get; set; }
        public Point AreaPoint { get; set; }
        public string ThumbnailURL { get; set; }
    }

    public class PlanningArea
    {
        public int Id { get; set; }
        [JsonIgnore]
        public Geometry AreaPolygon { get; set; }
        public string PlanningAreaName { get; set; }
        public int RegionId { get; set; }
        public int CA_IND { get; set; }
    }

    public class Region
    {
        public int Id { get; set; }
        public string RegionName { get; set; }
    }
}
