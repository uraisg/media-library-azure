using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace MediaLibrary.Intranet.Web.Models
{
    public class MediaLibraryContext : DbContext
    {
        public MediaLibraryContext(DbContextOptions<MediaLibraryContext> options) : base(options)
        {
        }

        public DbSet<DashboardActivity> dashboardActivity { get; set; }
        public DbSet<AllActivity> allActivity { get; set; }
        public DbSet<FileDetails> fileDetails { get; set; }
        public DbSet<Region> region { get; set; }
        public DbSet<PlanningArea> planningArea { get; set; }
        public DbSet<DeletedFiles> deletedFiles { get; set; }
    }
}
