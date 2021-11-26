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
            var aadInstanceHost = new Uri(config.GetSection("AzureAD").GetValue<string>("Instance")).Host;

            var policyCollection = new HeaderPolicyCollection()
                .AddDefaultSecurityHeaders()
                .AddContentSecurityPolicy(builder =>
                {
                    builder.AddFormAction().Self().From(aadInstanceHost);
                    var scriptSrc = builder.AddScriptSrc().Self();
                    if (isDevelopment)
                    {
                        // Allow eval() script in development
                        scriptSrc.UnsafeEval();
                    }
                    builder.AddObjectSrc().None();
                    builder.AddFrameAncestors().None();
                });

            app.UseSecurityHeaders(policyCollection);

            return app;
        }
    }
}
