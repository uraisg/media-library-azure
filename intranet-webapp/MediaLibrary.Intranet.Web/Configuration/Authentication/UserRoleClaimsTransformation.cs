using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace MediaLibrary.Intranet.Web.Configuration
{
    /// <summary>
    /// UserRoleClaimsTransformation validates the ClaimsPrincipal and adds the appropriate Role claim. 
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

                // Skip adding roles if user's email address format is unexpected
                if (!principal.GetUserGraphEmail().ToLower().Contains("from.") && (principal.GetUserGraphEmail().ToLower().EndsWith("@ura.gov.sg")))
                {
                    // Check if user's email address is in list of admins
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
