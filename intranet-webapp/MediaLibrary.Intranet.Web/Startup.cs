using System;
using MediaLibrary.Intranet.Web.Background;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Configuration;
using MediaLibrary.Intranet.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Logging;

namespace MediaLibrary.Intranet.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.Unspecified;
                // Handling SameSite cookie according to https://docs.microsoft.com/en-us/aspnet/core/security/samesite?view=aspnetcore-3.1
                options.HandleSameSiteCookieCompatibility();
            });
            services.AddCustomHostingConfig(Configuration);
            services.AddCustomAuthenticationConfig(Configuration);
            services.AddAuthorization(options =>
            {
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
            });
            services.AddCustomMvcConfig();

            services.AddOptions<AppSettings>().Bind(Configuration.GetSection("AppSettings"));
            services.AddHttpClient();
            services.AddHostedService<ScheduledService>();
            services.AddSingleton<IGeoSearchHelper, GeoSearchHelper>();
            services.AddSingleton<MediaSearchService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCustomHostingConfig();
            app.UseSecurityHeaders();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                IdentityModelEventSource.ShowPII = true;
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            // Configure default Cache-Control headers that are applied to controllers/actions without a [ResponseCache] attribute set,
            // according to https://docs.microsoft.com/en-us/aspnet/core/performance/caching/middleware?view=aspnetcore-3.1#configuration
            app.Use(async (context, next) =>
            {
                context.Response.GetTypedHeaders().CacheControl =
                    new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                    {
                        NoCache = true,
                        NoStore = true,
                        MaxAge = TimeSpan.Zero
                    };
                context.Response.Headers[Microsoft.Net.Http.Headers.HeaderNames.Pragma] =
                        new string[] { "no-cache" };

                await next();
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapControllerRoute(
                    name: "spa",
                    pattern: "s/{*path}",
                    defaults: new { controller = "Gallery", action = "Index" });
                endpoints.MapRazorPages();
            });
        }
    }
}
