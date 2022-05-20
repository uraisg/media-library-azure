using System;
using System.Threading.Tasks;
using MediaLibrary.Internet.Web.Common;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using Microsoft.Identity.Web;

namespace MediaLibrary.Internet.Web.Configuration
{
    public static class AuthenticationExtensions
    {
        private static readonly TimeSpan TicketExpiry = TimeSpan.FromMinutes(30);
        private static readonly string[] DefaultGraphScopes = {
            "User.Read",
            "User.ReadBasic.All"
        };

        public static IServiceCollection AddCustomAuthenticationConfig(this IServiceCollection services, IConfiguration config)
        {
            services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
                .EnableWafCompatibleTicketDataFormat()
                // Add Microsoft identity platform sign-in
                .AddMicrosoftIdentityWebApp(
                    // Microsoft identity platform options
                    options =>
                    {
                        config.Bind("AzureAd", options);
                        // Handling the token validated event (after sign in)
                        options.Events.OnTokenValidated = OnTokenValidatedFunc;
                        // Handling the sign-out event
                        options.Events.OnRedirectToIdentityProviderForSignOut = OnRedirectToIdentityProviderForSignOutFunc;
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
                    })
                // Add ability to call web API (Graph) and get access tokens
                .EnableTokenAcquisitionToCallDownstreamApi(DefaultGraphScopes)
                // Add a GraphServiceClient via dependency injection
                .AddMicrosoftGraph(options =>
                {
                    options.Scopes = string.Join(' ', DefaultGraphScopes);
                })
                // Use in-memory token cache
                // See https://github.com/AzureAD/microsoft-identity-web/wiki/token-cache-serialization
                .AddInMemoryTokenCaches();

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

        /// <summary>
        /// Invoked when an IdToken has been validated and produced an AuthenticationTicket.
        /// See: https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.openidconnect.openidconnectevents.ontokenvalidated?view=aspnetcore-3.1
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        private static async Task OnTokenValidatedFunc(TokenValidatedContext context)
        {
            // Record the user login
            var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger<Startup>();

            var clientIP = context.HttpContext.Connection.RemoteIpAddress;
            var userName = context.Principal.Identity.Name;
            var status = "Successful login";

            logger.LogInformation("User login - {ClientIp} - {UserName} - {Status}", clientIP, userName, status);

            // Query additional user properties from Graph API
            await GetGraphClaims(context).ConfigureAwait(false);

            await Task.CompletedTask.ConfigureAwait(false);
        }

        /// <summary>
        /// Invoked before redirecting to the identity provider to sign out.
        /// See: https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.openidconnect.openidconnectevents.onredirecttoidentityproviderforsignout?view=aspnetcore-3.1
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        private static async Task OnRedirectToIdentityProviderForSignOutFunc(RedirectContext context)
        {
            // Record the user logout
            var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger<Startup>();

            var clientIP = context.HttpContext.Connection.RemoteIpAddress;
            var userName = context.HttpContext.User.Identity.Name;
            var status = "Successful logout";

            logger.LogInformation("User logout - {ClientIp} - {UserName} - {Status}", clientIP, userName, status);

            await Task.CompletedTask.ConfigureAwait(false);
        }

        private static async Task GetGraphClaims(TokenValidatedContext context)
        {
            var tokenAcquisition = context.HttpContext.RequestServices
                .GetRequiredService<ITokenAcquisition>();

            var graphClient = new GraphServiceClient(
                new DelegateAuthenticationProvider(async (request) =>
                {
                    var token = await tokenAcquisition
                        .GetAccessTokenForUserAsync(DefaultGraphScopes, user: context.Principal);
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                })
            );

            // Get user information from Graph
            var user = await graphClient.Me.Request()
                .Select(u => new
                {
                    u.DisplayName,
                    u.Mail,
                    u.UserPrincipalName
                })
                .GetAsync();

            context.Principal.AddUserGraphInfo(user);

            if (context.Principal.IsPersonalAccount())
            {
                // Personal accounts do not support getting their photo via Graph
                // Support is there in the beta API
                context.Principal.AddUserGraphPhoto(null);
                return;
            }

            // Get the user's photo
            // If the user doesn't have a photo, this throws
            try
            {
                var req = graphClient.Me
                    .Photos["48x48"]
                    .Content
                    .Request();

                var photo = await req.GetAsync();

                context.Principal.AddUserGraphPhoto(photo);
            }
            catch (ServiceException ex)
            {
                if (!ex.IsMatch("ImageNotFound"))
                {
                    var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
                    var logger = loggerFactory.CreateLogger<Startup>();
                    logger.LogError(ex, "Error getting signed-in user profile photo");
                }
                context.Principal.AddUserGraphPhoto(null);
            }
        }
    }
}
