using System;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web.UI;
using Newtonsoft.Json.Serialization;

namespace MediaLibrary.Intranet.Web.Configuration
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
            }).AddNewtonsoftJson(options =>
            {
                // Use the default property (Pascal) casing
                options.SerializerSettings.ContractResolver = new DefaultContractResolver();
            });

            services.AddRazorPages()
                .AddMicrosoftIdentityUI();

            services.PostConfigure<ApiBehaviorOptions>(options =>
            {
                var builtInFactory = options.InvalidModelStateResponseFactory;

                options.InvalidModelStateResponseFactory = context =>
                {
                    // Log Automatic HTTP 400 responses triggered by model validation errors in ApiControllers
                    // See https://github.com/dotnet/AspNetCore.Docs/issues/12157
                    if (!context.ModelState.IsValid)
                    {
                        LogApiModelValidationErrors(context);
                    }

                    return builtInFactory(context);
                };
            });

            return services;
        }

        private static void LogApiModelValidationErrors(ActionContext context)
        {
            var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger(context.ActionDescriptor.DisplayName);

            // Get error messages
            var errorMessages = string.Join(" | ", context.ModelState.Values
                .SelectMany(x => x.Errors)
                .Select(x => x.ErrorMessage));

            logger.LogError(
                "Validation errors occurred." + Environment.NewLine +
                "Error(s): {errorMessages}" + Environment.NewLine +
                "URL: {url}",
                errorMessages,
                context.HttpContext.Request.GetDisplayUrl());
        }
    }
}
