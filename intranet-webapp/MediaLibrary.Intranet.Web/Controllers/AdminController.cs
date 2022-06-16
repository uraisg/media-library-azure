using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);

            if (isAdmin)
            {
                ViewData["showDashboard"] = isAdmin;
                return View();
            }
            else
            {
                return Forbid();
            }
        }

        public IActionResult ActivityReport()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);

            if (isAdmin)
            {
                ViewData["showDashboard"] = isAdmin;
                return View();
            }
            else
            {
                return Forbid();
            }
        }

        public IActionResult FileReport()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);

            if (isAdmin)
            {
                ViewData["showDashboard"] = isAdmin;
                return View();
            }
            else
            {
                return Forbid();
            }
        }

        public IActionResult Staff()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);

            if (isAdmin)
            {
                ViewData["showDashboard"] = isAdmin;
                return View();
            }
            else
            {
                return Forbid();
            }
        }

        public IActionResult StaffActivityReport(string email)
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);

            if (isAdmin)
            {
                ViewData["showDashboard"] = isAdmin;
                return View();
            }
            else
            {
                return Forbid();
            }
        }
    }
}
