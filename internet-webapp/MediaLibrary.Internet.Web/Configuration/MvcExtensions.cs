using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Identity.Web.UI;

namespace MediaLibrary.Internet.Web.Configuration
{
    public static class MvcExtensions
    {
        public static IServiceCollection AddCustomMvcConfig(this IServiceCollection services)
        {
            // Customise Antiforgery options
            // AddControllersWithViews() internally calls AddAntiforgery()
            services.AddAntiforgery(options =>
            {
                // Improve cookie security
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            });

            services.AddControllersWithViews(options =>
            {
                // Enable Antiforgery Token Validation for unsafe HTTP methods by default
                options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());

                options.CacheProfiles.Add("Private600",
                    new CacheProfile()
                    {
                        Location = ResponseCacheLocation.Client,
                        Duration = 600
                    });
            });

            services.AddRazorPages()
                .AddMicrosoftIdentityUI();

            return services;
        }
    }
}
