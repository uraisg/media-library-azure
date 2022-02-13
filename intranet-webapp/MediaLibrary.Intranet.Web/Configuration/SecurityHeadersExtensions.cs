using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace MediaLibrary.Intranet.Web.Configuration
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
                headers["Content-Security-Policy"] = $"form-action 'self'{aadInstanceHost}; script-src 'self'{scriptSrcUnsafeEval}; object-src 'none'; frame-ancestors 'none'";
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
