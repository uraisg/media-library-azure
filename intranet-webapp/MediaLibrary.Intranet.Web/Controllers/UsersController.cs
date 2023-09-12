using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using MediaLibrary.Intranet.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediaLibrary.Intranet.Web.Controllers
{
    [Authorize(Roles = UserRole.Admin )]
    public class UsersController : Controller
    {
        private readonly ACMUserRoleService _userRoleService;

        public UsersController(ACMUserRoleService userRoleService)
        {
            _userRoleService = userRoleService;
        }

        public IActionResult Index()
        {
            bool isAdmin = User.IsInRole(UserRole.Admin);

            if (isAdmin)

            {
                bool CheckAdmin = true;
                ViewData["userRole"] = CheckAdmin;
            }

            else
            {
                bool CheckAdmin = false;
                ViewData["userRole"] = CheckAdmin;
            }

            return View();
        }
    }
}
