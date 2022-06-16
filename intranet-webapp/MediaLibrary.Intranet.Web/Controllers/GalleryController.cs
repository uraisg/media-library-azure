using System;
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
            bool isAdmin = User.IsInRole(UserRole.Admin);
            ViewData["showDashboard"] = isAdmin;

            return View();
        }

        public async Task<IActionResult> Item([BindRequired, FromRoute] string id)
        {
            if (!ModelState.IsValid)
            {
                return NotFound();
            }

            bool isAdmin = User.IsInRole(UserRole.Admin);

            // Get item info and check if user is author
            bool isAuthor = (await GetItemAuthorAsync(id)) == User.GetUserGraphEmail();

            // Get item upload date info and check if within 1 day
            DateTime? itemUploadDateTime = (await GetItemUploadDateAsync(id));
            DateTime currentDateTime = DateTime.UtcNow;
            bool isOneDayValid = itemUploadDateTime != null && currentDateTime.Subtract(itemUploadDateTime.Value).TotalHours <= 24;

            ViewData["mediaId"] = id;
            ViewData["showEditActions"] = isAdmin || isAuthor;
            ViewData["showDelActions"] = isAdmin || (isAuthor && isOneDayValid);
            ViewData["showDashboard"] = isAdmin;
            return View();
        }

        public async Task<IActionResult> Edit([BindRequired, FromRoute] string id)
        {
            if (!ModelState.IsValid)
            {
                return NotFound();
            }

            bool isAdmin = User.IsInRole(UserRole.Admin);

            // Get item info and check if user is author
            bool isAuthor = (await GetItemAuthorAsync(id)) == User.GetUserGraphEmail();

            if (isAdmin || isAuthor)
            {
                ViewData["mediaId"] = id;
                ViewData["showDashboard"] = isAdmin;
                return View();
            }
            else
            {
                return Forbid();
            }
        }

        private async Task<string> GetItemAuthorAsync(string id)
        {
            _logger.LogInformation("Getting item author details for id {id}", id);

            MediaItem item = await _itemService.GetItemAsync(id);

            return item?.Author;
        }

        private async Task<DateTime?> GetItemUploadDateAsync(string id)
        {
            _logger.LogInformation("Getting item upload date for id {id}", id);

            MediaItem item = await _itemService.GetItemAsync(id);

            return item?.UploadDate;
        }
    }
}
