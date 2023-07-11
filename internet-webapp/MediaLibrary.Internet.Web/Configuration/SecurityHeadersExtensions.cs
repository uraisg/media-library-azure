using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace MediaLibrary.Internet.Web.Configuration
{
    public static class SecurityHeadersExtensions
    {
        public static IApplicationBuilder UseCustomSecurityHeaders(this IApplicationBuilder app, IConfiguration config, bool isDevelopment)
        {
            if (app == null)
            {
                throw new ArgumentNullException(nameof(app));
            }

            // Host name of configured AAD instance
            var aadInstanceHost = "";
            var aadInstance = config.GetSection("AzureAD").GetValue<string>("Instance");
            if (!string.IsNullOrEmpty(aadInstance))
            {
                aadInstanceHost = " " + new Uri(aadInstance).Host;
            }

            // Allow eval() script in development
            var scriptSrcUnsafeEval = "";
            if (isDevelopment)
            {
                scriptSrcUnsafeEval = " 'unsafe-eval'";
            }

            app.UseHsts();
            app.Use(async (context, next) =>
            {
                var headers = context.Response.Headers;
                headers["Content-Security-Policy"] = (
                    $"base-uri 'none'; frame-ancestors 'none'; form-action 'self'{aadInstanceHost}; "
                    + $"default-src 'self'; script-src 'self' blob:{scriptSrcUnsafeEval}; "
                    + "object-src 'none'; style-src 'self' https://fonts.googleapis.com; "
                    + "font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:"
                );
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                headers["X-Content-Type-Options"] = "nosniff";
                headers["X-Frame-Options"] = "DENY";
                headers["X-XSS-Protection"] = "1; mode=block";

                await next();
            });

            return app;
        }
    }
}
