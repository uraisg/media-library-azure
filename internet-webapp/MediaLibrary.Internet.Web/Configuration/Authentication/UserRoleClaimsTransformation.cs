using System.Security.Claims;
using System.Threading.Tasks;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Authentication;

namespace MediaLibrary.Internet.Web.Configuration
{
    /// <summary>
    /// UserRoleClaimsTransformation validates the ClaimsPrincipal and adds the appropriate Role claim. 
    /// </summary>
    class UserRoleClaimsTransformation : IClaimsTransformation
    {
        private bool _hasTransformed = false;
 
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (!_hasTransformed)
            {
                _hasTransformed = true;

                // Skip adding roles if user's email address format is unexpected
                if (!principal.GetUserGraphEmail().ToLower().Contains("from.") && (principal.GetUserGraphEmail().ToLower().EndsWith("@ura.gov.sg")))
                {
                    string role = UserRole.User;
                    var ci = new ClaimsIdentity();
                    ci.AddClaim(new Claim(ClaimTypes.Role, role));
                    principal.AddIdentity(ci);
                }
            }

            return Task.FromResult(principal);
        }
    }
}
