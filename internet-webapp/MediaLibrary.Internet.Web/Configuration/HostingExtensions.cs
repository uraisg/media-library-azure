using System;
using System.Collections.Generic;
using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace MediaLibrary.Internet.Web.Configuration
{
    public class HostingOptions
    {
        public const string Hosting = "Hosting";

        // Request path base
        public string PathBase { get; set; }

        // Header forwarding options
        public bool UseForwardedHeaders { get; set; } = false;
        public string ForwardedHostHeaderName { get; set; } = ForwardedHeadersDefaults.XForwardedHostHeaderName;
        public int? ForwardLimit { get; set; } = 1;
        public List<string> KnownNetworks { get; set; } = new List<string>();
    }

    public static class HostingExtensions
    {
        public static IServiceCollection AddCustomHostingConfig(this IServiceCollection services, IConfiguration config)
        {
            var section = config.GetSection(HostingOptions.Hosting);
            var settings = section.Get<HostingOptions>();
            services.Configure<HostingOptions>(section);

            if (settings.UseForwardedHeaders)
            {
                services.Configure<ForwardedHeadersOptions>(options =>
                {
                    options.ForwardedHeaders = ForwardedHeaders.All;

                    if (string.IsNullOrEmpty(settings.ForwardedHostHeaderName))
                    {
                        throw new ArgumentNullException(nameof(settings.ForwardedHostHeaderName));
                    }
                    options.ForwardedHostHeaderName = settings.ForwardedHostHeaderName;

                    options.ForwardLimit = settings.ForwardLimit;

                    if (settings.KnownNetworks.Count > 0)
                    {
                        options.KnownNetworks.Clear();

                        foreach (var network in settings.KnownNetworks)
                        {
                            string[] parts = network.Split('/');
                            if (parts.Length != 2)
                            {
                                throw new ArgumentException(
                                    $"Invalid HostingOptions.KnownNetworks element: '{network}'",
                                    "HostingOptions.KnownNetworks"
                                );
                            }
                            var prefix = IPAddress.Parse(parts[0]);
                            int prefixLength = int.Parse(parts[1]);
                            options.KnownNetworks.Add(new IPNetwork(prefix, prefixLength));
                        }
                    }
                });
            }

            return services;
        }

        public static IApplicationBuilder UseCustomHostingConfig(this IApplicationBuilder app)
        {
            if (app == null)
            {
                throw new ArgumentNullException(nameof(app));
            }

            var settings = app.ApplicationServices.GetService<IOptions<HostingOptions>>().Value;

            if (settings.UseForwardedHeaders)
            {
                app.UseForwardedHeaders();
            }

            if (!string.IsNullOrEmpty(settings.PathBase))
            {
                app.UsePathBase(settings.PathBase);
            }

            return app;
        }
    }
}
