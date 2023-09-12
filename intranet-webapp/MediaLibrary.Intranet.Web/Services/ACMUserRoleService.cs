using Microsoft.Data.SqlClient;
using System.Diagnostics;
using System;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using MediaLibrary.Intranet.Web.Models;
using MediaLibrary.Intranet.Web.Common;
using Microsoft.IdentityModel.Tokens;
using SqlKata;
using System.Linq;
using Microsoft.Graph;


namespace MediaLibrary.Intranet.Web.Services
{
    public class ACMUserRoleService
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<ACMUserRoleService> _logger;


        public ACMUserRoleService(IOptions<AppSettings> appSettings, ILogger<ACMUserRoleService> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        public Tuple<List<ACMStaffRoleResult>,int> GetAllUsersRoleByPage(UserRoleQuery user)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            List<ACMStaffRoleResult> ACMStaffRoleResults = new List<ACMStaffRoleResult>();
            int totalPage = 1;
            string searchQuery = user.SearchQuery;
            string sortOption = user.SortOption;
            string sql = ACMQueries.Queries.GetAllUserRole;
            string sql2 = ACMQueries.Queries.GetTotalCountUserRole;
            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();


                string dateFormat = "yyyy/MM/dd";
               
                List<string> filterConditions = new List<string>();
                
                if (!string.IsNullOrEmpty(user.EndDate) && !string.IsNullOrEmpty(user.StartDate))
                   {
                     DateTime startDate = Convert.ToDateTime(user.StartDate);
                     DateTime endDate = Convert.ToDateTime(user.EndDate);
                     string newsql = string.Format("lastlogin >= '{0}' and lastlogin <= '{1}'", startDate.ToString(dateFormat), endDate.ToString(dateFormat));
                    
                      filterConditions.Add(newsql);
                    }

                string filterRole = getFilterResult(user.filterbyrole);
                    if (!string.IsNullOrEmpty(filterRole))
                    {
                      string newsql = string.Format("rolename in {0}", filterRole);
                      filterConditions.Add(newsql);
                    }

                    string filterGroups = getFilterResult(user.filterbygroup);
                    if (!string.IsNullOrEmpty(filterGroups))
                    {
                        string newsql = string.Format("groupname in {0}", filterGroups);
                        filterConditions.Add(newsql);
                     }
                               
                    string filterDepts = getFilterResult(user.filterbydepartment);
                    if (!string.IsNullOrEmpty(filterDepts))
                    {
                        string newsql = string.Format("deptname in {0}", filterDepts);
                        filterConditions.Add(newsql);
                    }

                if (searchQuery != null)
                {
                    string newsql = string.Format("staffemail like '{0}%' or staffname like '{1}%'", searchQuery, searchQuery);
                    filterConditions.Add(newsql);
                }

                if (filterConditions.Any())
                {
                    string filteruser = "";
                    filteruser += String.Join(" and ", filterConditions);
                    sql = string.Format("{0} where {1} ", sql, filteruser);
                    sql2 = string.Format("{0} where {1} ", sql2, filteruser);
                   
                }
                
                //sorting
                AllSortOption options;
                bool checkSort = Enum.TryParse(sortOption, out options);

                if (!checkSort)
                {
                    _logger.LogError("Error in sorting User Role report by {sort}", sortOption);
                }
                else
                {
                    var currentSort = Enum.Parse(typeof(AllSortOption), sortOption);

                    switch (currentSort)
                    {
                        case AllSortOption.dateASC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by lastlogin,staffname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by lastlogin,staffname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.dateDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by lastlogin desc,staffname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by lastlogin desc,staffname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.groupASC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by groupname,staffname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by groupname,staffname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.groupDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by groupname desc,staffname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by groupname desc,staffname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.departmentASC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by deptname,staffname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by deptname,staffname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.departmentDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by deptname desc,staffname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by deptname desc,staffname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.RoleASC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by rolename,staffname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by rolename,staffname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.RoleDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by rolename desc,staffname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by rolename desc,staffname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;
                    }
                }


                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    using SqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        ACMStaffRoleResult staffRoleResult = new ACMStaffRoleResult();
                        staffRoleResult.id = reader.GetString(0);
                        staffRoleResult.name = reader.GetString(1);
                        staffRoleResult.email = reader.GetString(2);
                        staffRoleResult.department = reader.GetString(3);
                        staffRoleResult.group = reader.GetString(4);
                        staffRoleResult.role = reader.GetString(5);

                        DateTime targetDateTime = new DateTime(1900, 1, 1, 0, 0, 0);

                        if (reader[6] != DBNull.Value)
                        {
                            DateTime? datetime1 = reader.GetDateTime(6);
                            if (datetime1 == targetDateTime.Date)
                            {
                                datetime1 = null;
                                staffRoleResult.LastLoginDate = datetime1;
                            }
                            else
                            {
                                staffRoleResult.LastLoginDate = datetime1;
                            }
                        }
                        ACMStaffRoleResults.Add(staffRoleResult);
                    }
                }
                conn.Close();

                conn.Open();
                using (SqlCommand cmd2 = new SqlCommand(sql2, conn))
                {
                    int totalCounts = (int)cmd2.ExecuteScalar();
                    totalPage = ((totalCounts - 1) / user.pagelimit) + 1;

                }

                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "error in retrieving users to display");
            }
           return Tuple.Create(ACMStaffRoleResults,totalPage);
        }
            public Tuple<List<string>, List<string>,List<string>> ACMDropdownOptions(UserRoleQuery userRole)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            dropdownoptions dropdownoptions = new dropdownoptions();

            List<string> options = new List<string>();
            List<string> groupOptions = new List<string>();
            List<string> roleOptions = new List<string>();
            
            dropdownoptions.departmentoptions = options;
            dropdownoptions.groupoptions = groupOptions;
            dropdownoptions.roleoptions = roleOptions;
        
            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string filterGroups = getFilterResult(userRole.filterbygroup);
                if (!string.IsNullOrEmpty(filterGroups))
                {
                    string sql = String.Format("select deptname from ACMGroupMaster gm inner join ACMDeptMaster dm on gm.GroupID = dm.GroupID where groupname in {0}", filterGroups);
                    using SqlCommand cmd = new SqlCommand(sql, conn);
                    using SqlDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        string getoptions = reader.GetString(0);
                        options.Add(getoptions);
                    }
                }
                conn.Close();

                conn.Open();
                string sql2 = String.Format("Select groupname from ACMGroupMaster ");
                using SqlCommand cmd2 = new SqlCommand(sql2, conn);
                using SqlDataReader reader2 = cmd2.ExecuteReader();
                
                while (reader2.Read())
                {
                    string GetGroupOptions = reader2.GetString(0);
                    groupOptions.Add(GetGroupOptions);
                }
                conn.Close();
                conn.Open();
                string sql3 = "select rolename from ACMRoleMaster";
                using SqlCommand cmd3 = new SqlCommand(sql3, conn);
                using SqlDataReader reader3 = cmd3.ExecuteReader();
                while (reader3.Read())
                {
                    string GetRoleOptions = reader3.GetString(0);
                    roleOptions.Add(GetRoleOptions);
                }
                conn.Close();

                return Tuple.Create(options, groupOptions,roleOptions);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in getting the dropdown options for groups, departments and roles");
            }
            return Tuple.Create(options, groupOptions, roleOptions);
        }


        private string getFilterResult(List<string> filterOptions)
        {
            string allStatus = String.Join(",", filterOptions);

            if (!allStatus.IsNullOrEmpty())
            {
                allStatus = "";
                string[] status = filterOptions[0].Split(',');
                foreach (string s in status)
                {
                    allStatus += "'" + s + "',";
                }
                return "(" + allStatus.Remove(allStatus.Length - 1) + ")";
            }
            return null;
        }
        public List<DownloadUserRoleReport> GetUsersRoleReport(UserRoleQuery user)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            List<DownloadUserRoleReport> ACMStaffRoleResults = new List<DownloadUserRoleReport>();
     
            string searchQuery = user.SearchQuery;
           try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string dateFormat = "yyyy/MM/dd";

                string sql = ACMQueries.Queries.GetAllUserRole;
                List<string> filterConditions = new List<string>();

                if (!string.IsNullOrEmpty(user.EndDate) && !string.IsNullOrEmpty(user.StartDate))
                {
                    DateTime startDate = Convert.ToDateTime(user.StartDate);
                    DateTime endDate = Convert.ToDateTime(user.EndDate);
                    string newsql = string.Format("lastlogin >= '{0}' and lastlogin <= '{1}'", startDate.ToString(dateFormat), endDate.ToString(dateFormat));
                    filterConditions.Add(newsql);
                }

                string filterRole = getFilterResult(user.filterbyrole);
                if (!string.IsNullOrEmpty(filterRole))
                {
                    string newsql = string.Format("rolename in {0}", filterRole);
                    filterConditions.Add(newsql);
                }

                string filterGroups = getFilterResult(user.filterbygroup);
                if (!string.IsNullOrEmpty(filterGroups))
                {
                    string newsql = string.Format("groupname in {0}", filterGroups);
                    filterConditions.Add(newsql);
                }

                string filterDepts = getFilterResult(user.filterbydepartment);
                if (!string.IsNullOrEmpty(filterDepts))
                {
                    string newsql = string.Format("deptname in {0}", filterDepts);
                    filterConditions.Add(newsql);
                }

                if (searchQuery != null)
                {
                    string newsql = string.Format("staffemail like '{0}%' or staffname like '{1}%'", searchQuery, searchQuery);
                    filterConditions.Add(newsql);
                }

                if (filterConditions.Any())
                {
                    string filteruser = "";
                    filteruser += String.Join(" and ", filterConditions);
                    sql = string.Format("{0} where {1} ", sql, filteruser);
                }

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    using SqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        DownloadUserRoleReport staffRoleReport = new DownloadUserRoleReport();
                        staffRoleReport.id = reader.GetString(0);
                        staffRoleReport.name = reader.GetString(1);
                        staffRoleReport.email = reader.GetString(2);
                        staffRoleReport.department = reader.GetString(3);
                        staffRoleReport.group = reader.GetString(4);
                        staffRoleReport.role = reader.GetString(5);

                        DateTime targetDateTime = new DateTime(1900, 1, 1, 0, 0, 0);

                        if (reader[6] != DBNull.Value)
                        {
                            DateTime? datetime1 = reader.GetDateTime(6);
                            if (datetime1 == targetDateTime.Date)
                            {
                                datetime1 = null;
                                staffRoleReport.LastLoginDate = datetime1;
                            }
                            else
                            {
                                staffRoleReport.LastLoginDate = datetime1;
                            }
                        }
                        ACMStaffRoleResults.Add(staffRoleReport);
                    }
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "error in retriever users role to display");
            }
            return ACMStaffRoleResults;
        }
        
        public void DeleteRoleById(string lastupdatedby, string userid,string userrole)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            using SqlConnection conn = new SqlConnection(acmConnectionString);
            try
            {
                conn.Open();
                int roleid = ACMGetRoleID(userrole);
                string queryStr = "DELETE FROM ACMRoleUser WHERE UserID=@ID and rolemstrid=@rolemstrid";
  
                SqlCommand cmd = new SqlCommand(queryStr, conn);
                cmd.Parameters.AddWithValue("@ID", userid);
                cmd.Parameters.AddWithValue("@rolemstrid", roleid);

                string useraction = "Revoke";
                UpdateAuditLog(lastupdatedby, useraction, DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();
                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting the user role");
            }
        }

        public void assignedRoleById(string lastupdatedby, string userid, string addrole)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            using SqlConnection conn = new SqlConnection(acmConnectionString);
     
            try
            {
                conn.Open();
                int addroleid = ACMGetRoleID(addrole);
                List<int> allUserRole = new List<int>();
                string useraction = "";
                bool conditionMet = false;

                string checkrolequery = ACMQueries.Queries.CheckuserRole;
                using SqlCommand cmd2 = new SqlCommand(checkrolequery, conn);
                cmd2.Parameters.AddWithValue("@userid", userid);
                using SqlDataReader reader2 = cmd2.ExecuteReader();

                while (reader2.Read())
                {
                    string UserIDsrole = reader2.GetString(0);
                    int useridrole = ACMGetRoleID(UserIDsrole);
                    allUserRole.Add(useridrole);
                }

                conn.Close();
                
                foreach (int id in allUserRole)
                {
                    if (id == addroleid)
                    {
                        conditionMet = true;
                    }
                }

                if (!conditionMet)
                {
                    if (!string.IsNullOrEmpty(addrole))
                    {
                        conn.Open();
                        string addRoleQuery = ACMQueries.Queries.AddRoleUser;

                        SqlCommand cmd3 = new SqlCommand(addRoleQuery, conn);
                        cmd3.Parameters.AddWithValue("@userid", userid);
                        cmd3.Parameters.AddWithValue("@rolemstrid", addroleid);
                        cmd3.Parameters.AddWithValue("@createdby", lastupdatedby);
                        cmd3.Parameters.AddWithValue("@createddate", DateTime.Now);
                        using SqlDataReader reader3 = cmd3.ExecuteReader();
                        conn.Close();
                        useraction = "Add";

                        UpdateAuditLog(lastupdatedby, useraction, DateTime.Now);

                    }
                }
     
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inserting the user role");
            }
        }

        private int ACMGetRoleID(string rolename)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            int roleMstrID = 0;
            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string sql = "select roleMstrid from ACMRoleMaster where rolename =@role";
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@role", rolename);
                using SqlDataReader reader = cmd.ExecuteReader();
             

                while (reader.Read())
                {
                    roleMstrID = reader.GetInt32(0);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in getting the role ID");
            }
            return roleMstrID;
        }


        public List<string> RoleOptions()
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
 
            List<string> roleOptions = new List<string>();

            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string sql3 = "select rolename from ACMRoleMaster";
                using SqlCommand cmd3 = new SqlCommand(sql3, conn);
                using SqlDataReader reader3 = cmd3.ExecuteReader();
                while (reader3.Read())
                {
                    string GetRoleOptions = reader3.GetString(0);
                    roleOptions.Add(GetRoleOptions);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in getting the dropdown options for groups and departments");
            }
            return roleOptions;
        }

        public void UpdateAuditLog(string email,string useraction ,DateTime date)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            using SqlConnection conn = new SqlConnection(acmConnectionString);

            try
            {
                conn.Open();
                string Auditsql = ACMQueries.Queries.UpdateAuditLog;
                using SqlCommand cmd = new SqlCommand(Auditsql, conn);
                string lastaction = "";

                string actionuserid = ACMGetUserID(email);
                 if (useraction == "Revoke")
                {
                    lastaction = "Revoke Role";
                }
                else if (useraction == "Add")
                {
                    lastaction = "Add Role";
                }

                cmd.Parameters.AddWithValue("@userid", actionuserid);
                cmd.Parameters.AddWithValue("@userlastaction", lastaction);
                cmd.Parameters.AddWithValue("@createdby", email);
                cmd.Parameters.AddWithValue("@createddate", date);

                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating the audit log table");
            }
        }
        private string ACMGetUserID(string email)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            string userid = "";
            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string sql = String.Format("SELECT userid FROM ACMStaffInfo WHERE staffemail = '{0}'", email);
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    userid = reader.GetString(0);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in getting the user ID");
            }
            return userid;
        }


        public List<string> getuserrole(string email)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            List<string> userRole = new List<string>();
            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string sql = String.Format("select rolename from acmroleuser su inner join ACMStaffInfo si on su.UserID = si.UserID inner join ACMRoleMaster rm on rm.RoleMstrID = su.RoleMstrID where StaffEmail='{0}'", email);
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string role = reader.GetString(0);
                    userRole.Add(role);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in getting the user role");
            }
            return userRole;
        }
    }
}
