using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;

namespace MediaLibrary.Intranet.Web.Common;

/// <summary>
/// Checks that the request's origin or referrer header matches the current site.
/// This attribute can be used along side ValidateAntiForgeryToken as part of a Defence-in-Depth strategy against CSRF.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = false)]
public class ValidateOriginAttribute : Attribute, IAuthorizationFilter
{
    /// <summary>
    /// Called when authorization is required.
    /// </summary>
    /// <param name="context">The filter context.</param>
    /// <exception cref="System.ArgumentNullException">context</exception>
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        // Verify same origin with standard headers
        StringValues source = context.HttpContext.Request.Headers.Origin;
        if (StringValues.IsNullOrEmpty(source))
        {
            source = context.HttpContext.Request.Headers.Referer;
            if (StringValues.IsNullOrEmpty(source))
            {
                // Both Origin and Referer headers are missing
                // Some legitmate clients omit these headers, so we do nothing (allow the request)
                return;
            }
        }

        if (!Uri.TryCreate(source, UriKind.Absolute, out var sourceUri))
        {
            // Header value contains malformed or invalid URI so we block the request
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            return;
        }

        // Compare the source against the expected target origin in Host header
        if (string.Equals(context.HttpContext.Request.Host.Host, sourceUri.Host, StringComparison.OrdinalIgnoreCase) &&
            (context.HttpContext.Request.Host.Port != null && context.HttpContext.Request.Host.Port != sourceUri.Port))
        {
            // Origins are not matching so we block the request
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
        }
    }
}
