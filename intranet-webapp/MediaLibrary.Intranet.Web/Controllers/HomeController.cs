using System.Diagnostics;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MediaLibrary.Intranet.Web.Controllers
{
    [Authorize(Roles = UserRole.Admin + "," + UserRole.Curator + "," + UserRole.User)]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            //Set value in Session object.
            /*if (string.IsNullOrEmpty(HttpContext.Session.GetString("SSName")))
            {
                HttpContext.Session.SetString("ssName", "MLSession");

                string sessionID = HttpContext.Session.Id;

                _logger.LogInformation("Session id churned for instance: " + sessionID);
            }*/

            return Redirect(HttpContext.Request.PathBase + "/s");
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

    }
}
