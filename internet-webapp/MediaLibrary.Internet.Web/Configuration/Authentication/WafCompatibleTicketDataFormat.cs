using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;

namespace MediaLibrary.Internet.Web.Configuration
{
    /// <summary>
    /// This implements a SecureDataFormat<AuthenticationTicket> that generates strings that are
    /// less likely to run foul of Azure Web Application Firewall when stored as cookie values.
    /// </summary>
    internal class WafCompatibleTicketDataFormat : ISecureDataFormat<AuthenticationTicket>
    {
        private readonly TicketDataFormat _ticketDataFormat;

        public WafCompatibleTicketDataFormat(IDataProtector protector)
        {
            _ticketDataFormat = new TicketDataFormat(protector);
        }

        public string Protect(AuthenticationTicket data)
        {
            return Protect(data, null);
        }

        public string Protect(AuthenticationTicket data, string purpose)
        {
            string base64url = _ticketDataFormat.Protect(data, purpose);

            // Fix up '-' -> '~', as '--' sequence in cookie values trigger
            // "942440 SQL Comment Sequence Detected" rule in Azure WAF
            return base64url.Replace('-', '~');
        }

        public AuthenticationTicket Unprotect(string protectedText)
        {
            return Unprotect(protectedText, null);
        }

        public AuthenticationTicket Unprotect(string protectedText, string purpose)
        {
            // Fix up '~' -> '-' before decoding and unprotecting
            return _ticketDataFormat.Unprotect(protectedText?.Replace('~', '-'), purpose);
        }
    }
}
