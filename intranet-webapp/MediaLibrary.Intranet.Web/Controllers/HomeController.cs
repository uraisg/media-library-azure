using System.Diagnostics;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using MediaLibrary.Intranet.Web.Common;

namespace MediaLibrary.Intranet.Web.Controllers
{

    [Authorize(Roles = UserRole.Admin + "," + UserRole.User)]

    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;


        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return Redirect(HttpContext.Request.PathBase + "/s");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {

          return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        
        }
    }
}
