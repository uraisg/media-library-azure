using MediaLibrary.Intranet.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class GalleryController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Item([BindRequired, FromRoute] string id)
        {
            if (!ModelState.IsValid)
            {
                return NotFound();
            }

            bool isAdmin = User.IsInRole(UserRole.Admin);
            // TODO: get item info and check if user is author
            bool isAuthor = false;
            ViewData["mediaId"] = id;
            ViewData["showAdminActions"] = isAdmin || isAuthor;
            return View();
        }

        [Authorize(Roles = UserRole.Admin)]
        public IActionResult Edit([BindRequired, FromRoute] string id)
        {
            if (!ModelState.IsValid)
            {
                return NotFound();
            }

            // TODO: get item info and check if user is author

            ViewData["mediaId"] = id;
            return View();
        }

    }
}

