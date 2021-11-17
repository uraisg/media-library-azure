using System;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Identity.Web;

namespace MediaLibrary.Intranet.Web.Configuration
{
    public static class AuthenticationExtensions
    {
        private static readonly TimeSpan TicketExpiry = TimeSpan.FromMinutes(30);

        public static IServiceCollection AddCustomAuthenticationConfig(this IServiceCollection services, IConfiguration config)
        {
            services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
                // Add Microsoft identity platform sign-in
                .AddMicrosoftIdentityWebApp(
                    // Microsoft identity platform options
                    options =>
                    {
                        config.Bind("AzureAd", options);
                    },
                    // Cookie authentication options
                    options =>
                    {
                        // Improve cookie security
                        options.Cookie.SameSite = SameSiteMode.None;
                        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                        options.Cookie.IsEssential = true;

                        // Expire cookies after inactive period
                        options.ExpireTimeSpan = TicketExpiry;
                        options.SlidingExpiration = true;
                    });

            return services;
        }
    }
}
