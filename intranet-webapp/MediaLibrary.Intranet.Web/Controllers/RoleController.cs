using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class RoleController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
