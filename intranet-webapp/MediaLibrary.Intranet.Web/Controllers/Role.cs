using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class Role : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
