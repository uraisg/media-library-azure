using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AspNetCore.Authentication.ApiKey;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MediaLibrary.Internet.Api
{
    class ApiKeyProvider : IApiKeyProvider
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private const string OptionName = "ApiKey";

        public ApiKeyProvider(IOptions<AppSettings> appSettings, ILogger<IApiKeyProvider> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        public Task<IApiKey> ProvideAsync(string key)
        {
            try
            {
                if (string.IsNullOrEmpty(_appSettings.ApiKey))
                {
                    throw new OptionsValidationException(OptionName, typeof(AppSettings), new[] { $"The '{OptionName}' option must be provided." });
                }

                if (string.Compare(key, _appSettings.ApiKey, StringComparison.Ordinal) == 0)
                {
                    return Task.FromResult<IApiKey>(new ApiKey(key, "API client"));
                }

                return Task.FromResult<IApiKey>(null);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, exception.Message);
                throw;
            }
        }
    }

    class ApiKey : IApiKey
    {
        public ApiKey(string key, string owner, List<Claim> claims = null)
        {
            Key = key;
            OwnerName = owner;
            Claims = claims ?? new List<Claim>();
        }

        public string Key { get; }
        public string OwnerName { get; }
        public IReadOnlyCollection<Claim> Claims { get; }
    }
}
