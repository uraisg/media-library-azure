using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Security.Claims;
using System.Threading.Tasks;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Data.SqlClient;
using System.Security.Principal;
using MediaLibrary.Intranet.Web.Common;

namespace MediaLibrary.Internet.Web.Configuration
{
    /// <summary>
    /// UserRoleClaimsTransformation checks if the ClaimsPrincipal represents a normal or an admin
    /// user and adds it as a Role claim. 
    /// </summary>
    ///

    class UserRoleClaimsTransformation : IClaimsTransformation
    {

        private bool _hasTransformed = false;
        private string mlizConnectionString = "";

        public UserRoleClaimsTransformation(IOptions<AppSettings> appSettings)
        {
            mlizConnectionString = appSettings.Value.AzureSQLConnectionString;
        }

        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (!_hasTransformed)
            {
                _hasTransformed = true;
                using SqlConnection conn = new SqlConnection(mlizConnectionString);

                bool CheckUserStatus = await Checkstatus(conn, principal.GetUserGraphEmail());

                bool CheckUserExist = await CheckUserInTable(conn, principal.GetUserGraphEmail());
                // Skip adding roles if user's email address format is unexpected
                if (!principal.GetUserGraphEmail().ToLower().Contains("from.") && CheckUserExist && CheckUserStatus && (principal.GetUserGraphEmail().ToLower().EndsWith("@ura.gov.sg")))
                {
                    string role = UserRole.User;
                    var ci = new ClaimsIdentity();
                    ci.AddClaim(new Claim(ClaimTypes.Role, role));
                    principal.AddIdentity(ci);
                }
             
            }

            return principal;
        }


        private static async Task<bool> CheckUserInTable(SqlConnection conn, string email)
        {
            bool userexist = false;
            try
            { 
                conn.Open();
                string sql = ACMQueries.Queries.CheckUserInTable;
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

        private static async Task<bool> Checkstatus(SqlConnection conn, string email)
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
                Debug.WriteLine(ex);
            }
            return userActive;
        }


    }
}
