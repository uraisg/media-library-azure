using System;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;

namespace MediaLibrary.Internet.Web.Configuration
{
    public static class AuthenticationExtensions
    {
        private static readonly TimeSpan TicketExpiry = TimeSpan.FromMinutes(30);

        public static IServiceCollection AddCustomAuthenticationConfig(this IServiceCollection services, IConfiguration config)
        {
            services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
                .EnableWafCompatibleTicketDataFormat()
                // Add Microsoft identity platform sign-in
                .AddMicrosoftIdentityWebApp(
                    // Microsoft identity platform options
                    options =>
                    {
                        config.Bind("AzureAdB2C", options);
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

                        // Use in-memory ticket store
                        options.SessionStore = new MemoryCacheTicketStore(TicketExpiry);
                    });

            return services;
        }

        private static AuthenticationBuilder EnableWafCompatibleTicketDataFormat(this AuthenticationBuilder builder)
        {
            builder.Services.AddSingleton<IPostConfigureOptions<CookieAuthenticationOptions>>(
                serviceProvider =>
                    new CustomPostConfigureCookieAuthenticationOptions(
                        serviceProvider.GetRequiredService<IDataProtectionProvider>()
                    )
            );

            return builder;
        }
    }
}
