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
        private readonly DashboardActivityService _dashboardActivityService;
        private readonly MediaSearchService _mediaSearchService;
        private DBActivity activitySelected = new DBActivity();

        public GalleryController(ILogger<GalleryController> logger, ItemService itemService, DashboardActivityService dashboardActivityService, MediaSearchService mediaSearchService)
        {
            _logger = logger;
            _itemService = itemService;
            _dashboardActivityService = dashboardActivityService;
            _mediaSearchService = mediaSearchService;
        }

        public IActionResult Index()
        {
            //await UpdateUploadActivity();

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
            // Update view activity in DashboardActivity table
            DashboardActivity activity = new DashboardActivity()
            {
                DActivityId = Guid.NewGuid(),
                FileId = id,
                Email = User.Identity.Name,
                ActivityDateTime = DateTime.Now,
                Activity = activitySelected.View
            };
            if(await _dashboardActivityService.AddActivityAsync(activity))
            {
                _logger.LogInformation("Successfully added view activity for {FileId}", id);
            }

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

        private async Task UpdateUploadActivity()
        {
            var results = await _mediaSearchService.GetAllMediaItemsAsync();

            foreach (var result in results)
            {
                await _dashboardActivityService.AddActivityForUpload(result.Items);
            }
        }
    }
}
