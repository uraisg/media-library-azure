using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class UsersController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
