using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Common;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using static System.Net.WebRequestMethods;
using Microsoft.Extensions.Logging;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Extensions.Configuration;
using System.Linq;

namespace MediaLibrary.Intranet.Web.Configuration
{
    /// <summary>
    /// UserRoleClaimsTransformation validates the ClaimsPrincipal and adds the appropriate Role claim.
    /// </summary>
    class UserRoleClaimsTransformation : IClaimsTransformation
    {
        private string mlizConnectionString = "";
        private readonly ILogger<UserRoleClaimsTransformation> _logger;
        private readonly IConfiguration Config;

        public UserRoleClaimsTransformation(IOptions<AppSettings> appSettings, ILogger<UserRoleClaimsTransformation> logger, IConfiguration config)
        {
            _logger = logger;
            Config = config;
            //mlizConnectionString = appSettings.Value.intranetmlizconndb;
            mlizConnectionString = Config.GetConnectionString("intranetmlizconndb");
        }

        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (!principal.HasClaim(claim => claim.Type == ClaimTypes.Role && claim.Value == "Admin" || claim.Value == "User" || claim.Value == "Curator"))
            {
                string email = principal.GetUserGraphEmail();
                using SqlConnection conn = new SqlConnection(mlizConnectionString);
                string userid = "";
                bool CheckUserExist = false;
                List<string> roleList = new List<string>();

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

                //checks role access based off userid
                try
                {
                    roleList = await GetRoleList(conn, userid);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.ToString());
                }

                //Inserts a login session
                try
                {
                    //string ssid = HttpContext.Session.Id;
                    string ssid = "N/A";

                    //SessionHelper sh = new SessionHelper(ssid, userid);
                    //sh.insertSession();
                    await InsertLoginSession(conn, userid, ssid);
                    await InsertAuditlog(conn, userid);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.ToString());
                }

                // Check if email is valid (in staff table)
                try
                {
                    CheckUserExist = await CheckUserInTable(conn, email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.ToString());
                }

                conn.Close();

                var ci = new ClaimsIdentity();
                if (CheckUserExist)
                {
                    if (roleList.Count > 0)
                    {
                        if (roleList.Contains(UserRole.Curator))
                        {
                            ci.AddClaim(new Claim(ClaimTypes.Role, UserRole.Curator));
                        }
                        if (roleList.Contains(UserRole.Admin))
                        {
                            ci.AddClaim(new Claim(ClaimTypes.Role, UserRole.Admin));
                        }
                    }
                    else
                    {
                        ci.AddClaim(new Claim(ClaimTypes.Role, UserRole.User));
                    }
                    principal.AddIdentity(ci);
                }

                var claims = ClaimsPrincipal.Current.Identities.First().Claims.ToList();
                _logger.LogInformation("Claims for user: {claims}", claims);
            }
            return principal;
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

        private async Task<List<string>> GetRoleList(SqlConnection conn, string userid)
        {
            List<string> roleList = new List<string>();
            try
            {
                string sql = ACMQueries.Queries.GetAdminRole;
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@status", "A");
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string role = "";
                    if (reader[0] != DBNull.Value)
                    {
                        role = reader.GetString(0);
                    }
                    //Adds to list
                    roleList.Add(role);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return roleList;
        }

        private async Task<bool> CheckUserInTable(SqlConnection conn, string email)
        {
            bool userexist = false;
            try
            {
                string sql = ACMQueries.Queries.CheckUserExist;
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@email", email);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (reader[0] == DBNull.Value)
                    {
                        userexist = false;
                    }
                    else
                    {
                        userexist = true;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return userexist;
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
