using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Options;

namespace MediaLibrary.Internet.Web.Configuration
{
    /// <summary>
    /// Custom IPostConfigureOptions used to override CookieAuthenticationOptions.TicketDataFormat
    /// to WafCompatibleTicketDataFormat.
    /// </summary>
    internal class CustomPostConfigureCookieAuthenticationOptions : IPostConfigureOptions<CookieAuthenticationOptions>
    {
        private readonly IDataProtectionProvider _dp;

        public CustomPostConfigureCookieAuthenticationOptions(IDataProtectionProvider dataProtection)
        {
            _dp = dataProtection ?? throw new ArgumentNullException(nameof(dataProtection));
        }

        public void PostConfigure(String name, CookieAuthenticationOptions options)
        {
            options.DataProtectionProvider ??= _dp;

            IDataProtector dataProtector = options.DataProtectionProvider.CreateProtector(
                "Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationMiddleware",
                name,
                "v2"
            );

            options.TicketDataFormat = new WafCompatibleTicketDataFormat(dataProtector);
        }
    }
}
