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
        private readonly IConfiguration _config;
        public MediaLibraryContext(IConfiguration configuration)
        {
            _config = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            string connectionString = _config.GetConnectionString("MyConn");
            optionsBuilder.UseSqlServer(connectionString,
                x => x.UseNetTopologySuite());
        }

        public DbSet<DashboardActivity> dashboardActivity { get; set; }
        public DbSet<AllActivity> allActivity { get; set; }
        public DbSet<FileDetails> fileDetails { get; set; }
        public DbSet<Region> region { get; set; }
        public DbSet<PlanningArea> planningArea { get; set; }
        public DbSet<DeletedFiles> deletedFiles { get; set; }
    }
}
