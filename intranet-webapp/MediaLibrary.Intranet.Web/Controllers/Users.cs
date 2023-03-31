using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class Users : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
