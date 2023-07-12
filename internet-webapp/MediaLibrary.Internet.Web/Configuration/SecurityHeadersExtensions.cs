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

            // Add more allowed sources in development
            var scriptSrcUnsafeEval = "";
            var styleSrcUnsafeInline = "";
            var connectSrcWss = "";
            if (isDevelopment)
            {
                scriptSrcUnsafeEval = " 'unsafe-eval'";
                styleSrcUnsafeInline = " 'unsafe-inline'";
                connectSrcWss = " wss:";
            }

            app.UseHsts();
            app.Use(async (context, next) =>
            {
                var headers = context.Response.Headers;
                headers["Content-Security-Policy"] = (
                    $"base-uri 'none'; frame-ancestors 'none'; form-action 'self'{aadInstanceHost}; "
                    + $"default-src 'self'; script-src 'self' blob:{scriptSrcUnsafeEval}; connect-src 'self'{connectSrcWss}; "
                    + $"object-src 'none'; style-src 'self' https://fonts.googleapis.com{styleSrcUnsafeInline}; "
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
