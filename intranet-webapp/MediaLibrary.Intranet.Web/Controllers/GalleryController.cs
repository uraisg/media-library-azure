using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using MediaLibrary.Intranet.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;

namespace MediaLibrary.Intranet.Web.Controllers
{
    public class GalleryController : Controller
    {
        private readonly ILogger<GalleryController> _logger;
        private readonly ItemService _itemService;

        public GalleryController(ILogger<GalleryController> logger, ItemService itemService)
        {
            _logger = logger;
            _itemService = itemService;
        }

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

            // Get item info and check if user is author
            bool isAuthor = false;
            var okObjectResult = GetItemAuthor(id).Result as ObjectResult;
            string itemAuthor = okObjectResult.Value.ToString();
            if (itemAuthor == User.GetUserGraphEmail())
            {
                isAuthor = true;
            }

            ViewData["mediaId"] = id;
            ViewData["showAdminActions"] = isAdmin || isAuthor;
            return View();
        }

        public IActionResult Edit([BindRequired, FromRoute] string id)
        {
            if (!ModelState.IsValid)
            {
                return NotFound();
            }

            bool isAdmin = User.IsInRole(UserRole.Admin);

            // Get item info and check if user is author
            bool isAuthor = false;
            var okObjectResult = GetItemAuthor(id).Result as ObjectResult;
            string itemAuthor = okObjectResult.Value.ToString();
            if (itemAuthor == User.GetUserGraphEmail())
            {
                isAuthor = true;
            }

            if (isAdmin || isAuthor)
            {
                ViewData["mediaId"] = id;
                return View();
            }
            else {
                return Unauthorized();
            }

        }

        public async Task<IActionResult> GetItemAuthor(string id)
        {
            _logger.LogInformation("Getting item author details for id {id}", id);

            MediaItem item = await _itemService.GetItemAsync(id);

            return Ok(item.Author);
        }

    }
}

