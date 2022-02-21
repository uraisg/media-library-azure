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

            ViewData["mediaId"] = id;
            return View();
        }

        public IActionResult Edit([BindRequired, FromRoute] string id)
        {
            if (!ModelState.IsValid)
            {                
                return NotFound();
            }

            ViewData["mediaId"] = id;
            return View();
        }

       // [HttpPost]
       // public IActionResult Edit(MediaItem id) {
       // }
    }
}

