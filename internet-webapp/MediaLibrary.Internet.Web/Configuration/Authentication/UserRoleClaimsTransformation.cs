using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace MediaLibrary.Internet.Web.Configuration
{
    /// <summary>
    /// UserRoleClaimsTransformation checks if the ClaimsPrincipal represents a normal or an admin
    /// user and adds it as a Role claim. 
    /// </summary>
    class UserRoleClaimsTransformation : IClaimsTransformation
    {
        private readonly IEnumerable<string> _adminUsers;
        private bool _hasTransformed = false;
 
        public UserRoleClaimsTransformation(IOptions<AppSettings> appSettings)
        {
            var adminUsersStr = appSettings.Value.AdminUsers;
            _adminUsers = string.IsNullOrEmpty(adminUsersStr)
                ? Enumerable.Empty<string>()
                : adminUsersStr.Split(',').Select(x => x.Trim()).ToHashSet();
        }

        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (!_hasTransformed)
            {
                _hasTransformed = true;
                // Check if user's email address is in list of admins
                 if (!principal.GetUserGraphEmail().ToLower().Contains("from.") && (principal.GetUserGraphEmail().ToLower().EndsWith("@ura.gov.sg")))
                 {
                     string role = _adminUsers.Contains(principal.GetUserGraphEmail())
                     ? UserRole.Admin
                     : UserRole.User;
                     var ci = new ClaimsIdentity();
                     ci.AddClaim(new Claim(ClaimTypes.Role, role));
                     principal.AddIdentity(ci);
                }
            }

            return Task.FromResult(principal);
        }
    }
}
