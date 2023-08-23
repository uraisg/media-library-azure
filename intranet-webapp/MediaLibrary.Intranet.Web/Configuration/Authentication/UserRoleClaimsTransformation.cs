using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using Microsoft.Graph;

namespace MediaLibrary.Intranet.Web.Configuration
{
    /// <summary>
    /// UserRoleClaimsTransformation validates the ClaimsPrincipal and adds the appropriate Role claim.
    /// </summary>
    class UserRoleClaimsTransformation : IClaimsTransformation
    {/*
        private readonly IEnumerable<string> _adminUsers;

        private bool _hasTransformed = false;
        private readonly string _acmConnectionString;
        string useremail;
        string sql;

        public UserRoleClaimsTransformation(IOptions<AppSettings> appSettings)
        {
            var adminUsersStr = appSettings.Value.AdminUsers;
            _adminUsers = string.IsNullOrEmpty(adminUsersStr)
                ? Enumerable.Empty<string>()
                : adminUsersStr.Split(',').Select(x => x.Trim()).ToHashSet();

            _acmConnectionString = appSettings.Value.AzureSQLConnectionString;
        }
        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            string role = "";

            if (!_hasTransformed)
            {
                _hasTransformed = true;

                // Skip adding roles if user's email address format is unexpected
                if (!principal.GetUserGraphEmail().ToLower().Contains("from.") && (principal.GetUserGraphEmail().ToLower().EndsWith("@ura.gov.sg")))
                {
                    // Check if user's email address is in list of admins
                    string role = _adminUsers.Contains(principal.GetUserGraphEmail())
                        ? UserRole.Admin
                        : UserRole.User;
                    var ci = new ClaimsIdentity();
                    ci.AddClaim(new Claim(ClaimTypes.Role, role));
                    principal.AddIdentity(ci);
                }
            }

            return principal;
        }
    }*/

        private string mlizConnectionString = "";

        public UserRoleClaimsTransformation(IOptions<AppSettings> appSettings)
        {
            mlizConnectionString = appSettings.Value.AzureSQLConnectionString;
        }

        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (!principal.HasClaim(claim => claim.Type == ClaimTypes.Role && claim.Value == "Admin" || claim.Value == "User" || claim.Value == "Curator"))
            {
                Debug.WriteLine("checking claims...");
                string email = principal.GetUserGraphEmail();
                using SqlConnection conn = new SqlConnection(mlizConnectionString);

                conn.Open();
                var userid = await GetUserID(conn, email);
                List<string> roleList = await GetRoleList(conn, userid);

                //Inserts a login session
               // await InsertLoginSession(conn, userid);    
                conn.Close();

                // Check if userid is in list of admins
                bool CheckUserExist =await CheckUserInTable(conn, email);
                var ci = new ClaimsIdentity();
                if (CheckUserExist)
                {
                    foreach (string role in roleList)
                    {
                        ci.AddClaim(new Claim(ClaimTypes.Role, role));
                    }
                    principal.AddIdentity(ci);
                }

            }
            return principal;
        }

        private static async Task<string> GetUserID(SqlConnection conn, string email)
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
                    return userid;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                
            }
            return userid;
        }

        private static async Task<List<string>> GetRoleList(SqlConnection conn, string userid)
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
                Debug.WriteLine(ex);
            }
            return roleList;
        }

        private static async Task<bool> CheckUserInTable(SqlConnection conn, string email)
        {
            bool userexist = false;
            try
            {
                conn.Open();
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
                Debug.WriteLine(ex);
            }
            conn.Close();
            return userexist;
        }

    }
}
