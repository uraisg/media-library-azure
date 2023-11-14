using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using System.Net.Sockets;
using System.Net;
using Microsoft.Graph;
using Microsoft.Extensions.Configuration;

namespace MediaLibrary.Internet.Web.Configuration
{
    /// <summary>
    /// UserRoleClaimsTransformation validates the ClaimsPrincipal and adds the appropriate Role claim. 
    /// </summary>
    class UserRoleClaimsTransformation : IClaimsTransformation
    {

        private bool _hasTransformed = false;
        private string mlezSelectConn = "";
        private string mlezInsertConn = "";
        private readonly ILogger<UserRoleClaimsTransformation> _logger;
        private readonly IConfiguration Config;

        public UserRoleClaimsTransformation(IOptions<AppSettings> appSettings, ILogger<UserRoleClaimsTransformation> logger, IConfiguration config)
        {
            _logger = logger;
            Config = config;
            mlezSelectConn = Config.GetConnectionString("eServicemlezconndb"); //appSettings.Value.eServicemlezconndb;
            mlezInsertConn = Config.GetConnectionString("eServicemlezbatchconndb"); //appSettings.Value.eServicemlezbatchconndb;           
        }

        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (!_hasTransformed)
            {
                _hasTransformed = true;
                string userid = "";
                string email = principal.GetUserGraphEmail();

                using SqlConnection conn = new SqlConnection(mlezSelectConn);
                conn.Open();
                //Gets userid               
                try
                {
                    userid = await GetUserID(conn, email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.ToString());
                }

                //Checks status
                //returns a true value if status = 'A' (Active)
                bool CheckUserStatus = await Checkstatus(conn, email);
                conn.Close();
                _logger.LogInformation("User {email} current status is: {checkuserstatus}", email, CheckUserStatus);

                using SqlConnection conn2 = new SqlConnection(mlezInsertConn);
                conn2.Open();
                //Inserts a login session
                try
                {
                    //string ssid = HttpContext.Session.Id;
                    string ssid = "N/A";

                    //SessionHelper sh = new SessionHelper(ssid, userid);
                    //sh.insertSession();
                    await InsertLoginSession(conn, userid, ssid);
                    await InsertAuditlog(conn, userid);

                    _logger.LogInformation("Inserted a login session and login log for: {userid}", userid);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.ToString());
                }
                conn2.Close();

                string role = UserRole.User;
                var ci = new ClaimsIdentity();

                if (CheckUserStatus)
                {
                    ci.AddClaim(new Claim(ClaimTypes.Role, role));
                    principal.AddIdentity(ci);
                }      
            }
            return principal;
        }

        private async Task<bool> Checkstatus(SqlConnection conn, string email)
        {
            bool userActive = false;
            try
            {
                conn.Open();
                string sql = ACMQueries.Queries.Checkstatus;
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@email", email);
                cmd.Parameters.AddWithValue("@status", "A");
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (reader[0] == DBNull.Value)
                    {
                        userActive = false;
                    }
                    else
                    {
                        userActive = true;
                    }
                }
                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return userActive;
        }

        private async Task<string> GetUserID(SqlConnection conn, string email)
        {
            string userid = "";
            try
            {
                string sql = ACMQueries.Queries.GetUserID;
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@staffEmail", email);

                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    userid = reader.GetString(0);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return userid;
        }

        private static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }

        private async Task InsertLoginSession(SqlConnection conn, string userid, string ssid)
        {
            try
            {
                string sql = ACMQueries.Queries.InsertLoginSession;
                string ipaddress = GetLocalIPAddress();

                DateTime lastlogout = (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue;
                DateTime timeNow = DateTime.Now;

                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@sessionid", ssid);
                cmd.Parameters.AddWithValue("@ipaddress", ipaddress);
                cmd.Parameters.AddWithValue("@lastlogin", timeNow);
                cmd.Parameters.AddWithValue("@lastlogout", lastlogout);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", timeNow);
                using SqlDataReader reader = cmd.ExecuteReader();

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }

        private async Task InsertAuditlog(SqlConnection conn, string userid)
        {
            try
            {
                string sql = ACMQueries.Queries.InsertAuditLog;

                string userlastaction = ACMActions.Actions.UserAttemptsLogin;

                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@userlastaction", userlastaction);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }
    }
}
