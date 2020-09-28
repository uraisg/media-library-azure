using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class GalleryController : Controller
    {
        public IActionResult Item([BindRequired, FromRoute] Guid id)
        {
            if (!ModelState.IsValid)
            {
                return NotFound();
            }

            ViewData["mediaId"] = id;
            return View();
        }
    }
}
