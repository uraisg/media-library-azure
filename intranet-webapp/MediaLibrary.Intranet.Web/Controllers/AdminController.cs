using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using MediaLibrary.Intranet.Web.Models;
using MediaLibrary.Intranet.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Controllers
{
    [Authorize(Roles = UserRole.Admin)]
    public class AdminController : Controller
    {
        private readonly DashboardActivityService _dashboardActivityService;

        public AdminController(DashboardActivityService dashboardActivityService)
        {
            _dashboardActivityService = dashboardActivityService;
        }

        public IActionResult Index()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);
            ViewData["showDashboard"] = isAdmin;
            return View();
        }

        public IActionResult ActivityReport()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);
            ViewData["showDashboard"] = isAdmin;
            return View();
        }

        public IActionResult FileReport()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);
            ViewData["showDashboard"] = isAdmin;
            return View();
        }

        public IActionResult Staff()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);
            ViewData["showDashboard"] = isAdmin;
            return View();
        }

        public IActionResult StaffActivityReport([FromQuery] string Email)
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);
            string email = HttpUtility.UrlDecode(Email);

            if (!_dashboardActivityService.EmailExist(email))
            {
                return NotFound();
            }
            ViewData["Email"] = email;
            ViewData["showDashboard"] = isAdmin;
            return View();
        }
    }
}
