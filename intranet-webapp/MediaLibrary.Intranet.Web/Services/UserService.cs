using Microsoft.Data.SqlClient;
using System.Diagnostics;
using System;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using MediaLibrary.Intranet.Web.Models;
using MediaLibrary.Intranet.Web.Common;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using SqlKata;
using System.Linq;


namespace MediaLibrary.Intranet.Web.Services
{
    public class UserService
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<UserService> _logger;

    public UserService(IOptions<AppSettings> appSettings, ILogger<UserService> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        public Tuple<List<ACMStaffInfoResult>,int>  GetAllUsersByPage(UserQuery user)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            ACMPage pagination = new ACMPage();
            List<ACMStaffInfoResult> staffInfoResults = new List<ACMStaffInfoResult>();
            string searchQuery = user.SearchQuery;
            string sortOption = user.SortOption;
            string sql2 = "SELECT COUNT(*) AS total_count from acmstaffinfo si left join acmstafflogin sp on si.userid = sp.userid left join acmsession ss on si.userid = ss.userid left join acmgroupmaster gm on gm.groupid = si.groupid left join acmdeptmaster dm on gm.groupid = dm.groupid";

            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string dateFormat = "yyyy/MM/dd";
                string sql = ACMQueries.Queries.GetAllUsers;
                List<string> filterConditions = new List<string>();

                if (!string.IsNullOrEmpty(user.EndDate) && !string.IsNullOrEmpty(user.StartDate))
                {
                    DateTime startDate = Convert.ToDateTime(user.StartDate);
                    DateTime endDate = Convert.ToDateTime(user.EndDate);
                    string newsql = string.Format("lastlogin >= '{0}' and lastlogin <= '{1}'", startDate.ToString(dateFormat), endDate.ToString(dateFormat));
                    filterConditions.Add(newsql);
                }

                if (!string.IsNullOrEmpty(user.SuspendStartDate) && !string.IsNullOrEmpty(user.SuspendEndDate))
                {
                    DateTime SuspendedStartDate = Convert.ToDateTime(user.SuspendStartDate);
                    DateTime SuspendedEndDate = Convert.ToDateTime(user.SuspendEndDate);
                    string newsql = string.Format(" DisabledDate >= '{0}' and DisabledDate <= '{1}'", SuspendedStartDate.ToString(dateFormat), SuspendedEndDate.ToString(dateFormat));
                    filterConditions.Add(newsql);
                }

                string filterStatus = getFilterResult(user.filterbystatus);
                if (!string.IsNullOrEmpty(filterStatus))
                {
                    string newsql = string.Format("status in {0}", filterStatus);
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
                    Debug.WriteLine("test");
                    Debug.WriteLine(sql);
                    sql2 = string.Format("{0} where {1} ", sql2, filteruser);
                }

                //sorting
                AllSortOption options;
                bool checkSort = Enum.TryParse(sortOption, out options);

                if (!checkSort)
                {
                    _logger.LogError("Error in sorting file report by {sort}", sortOption);
                }
                else
                {
                    var currentSort = Enum.Parse(typeof(AllSortOption), sortOption);

                    switch (currentSort)
                    {
                        case AllSortOption.dateASC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by lastlogin OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by lastlogin OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.dateDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by lastlogin desc OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by lastlogin desc OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.groupASC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by groupname OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by groupname OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.groupDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by groupname desc OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by groupname desc OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.departmentASC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by deptname  OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by deptname  OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.departmentDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by deptname desc OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by deptname desc OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql,user.pagelimit);
                            }
                            break;

                        case AllSortOption.SuspendedDateASC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by disableddate OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by disableddate OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.SuspendedDateDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by disableddate desc OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by disableddate desc OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;
                    }
                }
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    using SqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        ACMStaffInfoResult staffInfoResult = new ACMStaffInfoResult();
                        staffInfoResult.id = reader.GetString(0);
                        staffInfoResult.name = reader.GetString(1);
                        staffInfoResult.email = reader.GetString(2);
                        staffInfoResult.Department = reader.GetString(3);
                        staffInfoResult.group = reader.GetString(4);
                        staffInfoResult.Status = reader.GetString(5);

                        DateTime targetDateTime = new DateTime(1900, 1, 1, 0, 0, 0);

                        if (reader[6] != DBNull.Value) {
                            DateTime? datetime1 = reader.GetDateTime(6);
                            if (datetime1 == targetDateTime.Date)
                            {
                                datetime1 = null;
                                staffInfoResult.LastLoginDate = datetime1;
                            }
                            else
                            {
                                staffInfoResult.LastLoginDate = datetime1;
                            }
                    }

                        if (reader[7] != DBNull.Value)
                            {
                                DateTime? datetime = reader.GetDateTime(7);
                                if (datetime == targetDateTime.Date)
                                {
                                    datetime = null;
                                    staffInfoResult.DisableDate = datetime;
                                }

                                else
                                {
                                    staffInfoResult.DisableDate = datetime;
                                }
                        }

                            staffInfoResults.Add(staffInfoResult);
                        }
                    }
                
                using (SqlCommand cmd = new SqlCommand(sql2, conn)) {
                    int totalCounts = (int)cmd.ExecuteScalar();
                    int totalPage = ((totalCounts -1 )/ user.pagelimit) + 1;
                    pagination.totalCount = totalPage;
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "error in retriever users to display");
            }

            pagination.staffInfoResults = staffInfoResults;
            return Tuple.Create(staffInfoResults,pagination.totalCount);
        }

        public void updateStatusById(string status, DateTime todayDate, string lastupdatedby, string userid,string email)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            using SqlConnection conn = new SqlConnection(acmConnectionString);
            try
            {
                conn.Open();
                string sql = ACMQueries.Queries.UpdateStatus;
                string sql2 = ACMQueries.Queries.UpdateStatus2;
                string dateFormat = "yyyy/MM/dd";
                using SqlCommand cmd2 = new SqlCommand(sql2, conn);
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@status", status);

                    if (status == "Active")
                    {
                        cmd.Parameters.AddWithValue("@disableDate", DBNull.Value);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@disableDate", todayDate.ToString(dateFormat));
                    }

                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@lastupdated", lastupdatedby);
                cmd2.Parameters.AddWithValue("@userid", userid);
                cmd2.Parameters.AddWithValue("@status", status);

                using SqlDataReader reader = cmd.ExecuteReader();
                using SqlDataReader reader2 = cmd2.ExecuteReader();
                string actionuserid = ACMGetUserID(email);

                UpdateAuditLog(email, status, DateTime.Now);

                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating the users");
            }
        }

        public void UpdateAuditLog(string email,string status, DateTime date)
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

                if (status == "Active")
                {
                    lastaction = "Activate User";
                }

                else if (status == "Suspended")
                {
                    lastaction = "Suspend User";
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
                    return userid;
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in getting the user ID");
            }
            return userid;
        }

        public Tuple<List<string>, List<string>> ACMDropdownOptions()
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            dropdownoptions dropdownoptions = new dropdownoptions();

            List<string> options = new List<string>();
            List<string> groupOptions = new List<string>();

            dropdownoptions.departmentoptions = options;
            dropdownoptions.groupoptions = groupOptions;

            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string sql = String.Format("Select deptname from acmdeptmaster");
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    string getoptions = reader.GetString(0);
                    options.Add(getoptions);
                }
                string sql2 = String.Format("Select groupname from ACMGroupMaster ");
                using SqlCommand cmd2 = new SqlCommand(sql2, conn);
                using SqlDataReader reader2 = cmd2.ExecuteReader();
                while (reader2.Read())
                {
                    string GetGroupOptions = reader2.GetString(0);
                    groupOptions.Add(GetGroupOptions);
                }
                 return Tuple.Create(options,groupOptions); 

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in getting the dropdown options for groups and departments");
            }
             return Tuple.Create(options, groupOptions); 
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
                return "(" + allStatus.Remove(allStatus.Length-1) + ")";
            }
            return null;
        }

        public List<DownloadUserReport> GetAllUsers(UserQuery user)
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            List<DownloadUserReport> data = new List<DownloadUserReport>();
            string searchQuery = user.SearchQuery;

            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string dateFormat = "yyyy/MM/dd";
                string sql = ACMQueries.Queries.GetAllUsers;

                List<string> filterConditions = new List<string>();

                if (!string.IsNullOrEmpty(user.EndDate) && !string.IsNullOrEmpty(user.StartDate))
                {
                    DateTime startDate = Convert.ToDateTime(user.StartDate);
                    DateTime endDate = Convert.ToDateTime(user.EndDate);
                    string newsql = string.Format("lastlogin >= '{0}' and lastlogin <= '{1}'", startDate.ToString(dateFormat), endDate.ToString(dateFormat));
                    filterConditions.Add(newsql);
                }

                if (!string.IsNullOrEmpty(user.SuspendStartDate) && !string.IsNullOrEmpty(user.SuspendEndDate))
                {
                    DateTime SuspendedStartDate = Convert.ToDateTime(user.SuspendStartDate);
                    DateTime SuspendedEndDate = Convert.ToDateTime(user.SuspendEndDate);
                    string newsql = string.Format(" DisabledDate >= '{0}' and DisabledDate <= '{1}'", SuspendedStartDate.ToString(dateFormat), SuspendedEndDate.ToString(dateFormat));
                    filterConditions.Add(newsql);
                }

                string filterStatus = getFilterResult(user.filterbystatus);
                if (!string.IsNullOrEmpty(filterStatus))
                {
                    string newsql = string.Format("status in {0}", filterStatus);
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
                            DownloadUserReport report1 = new DownloadUserReport();
                            report1.UserName = reader.GetString(1);
                            report1.Email = reader.GetString(2);
                            report1.Department = reader.GetString(3);
                            report1.Group = reader.GetString(4);
                            report1.Status = reader.GetString(5);
                            DateTime targetDateTime = new DateTime(1900, 1, 1, 0, 0, 0);

                            DateTime? datetime1 = reader.GetDateTime(6);
                            if (datetime1 == targetDateTime.Date)
                            {
                                datetime1 = null;
                                report1.LastLoginDate = datetime1;
                            }
                            else
                            {
                                report1.LastLoginDate = datetime1;
                            }

                            if (reader[7] != DBNull.Value)
                            {
                                DateTime? datetime = reader.GetDateTime(7);

                                if (datetime == targetDateTime.Date)
                                {
                                    datetime = null;
                                    report1.DisabledDate = datetime;
                                }

                                else
                                {
                                    report1.DisabledDate = datetime;
                                }
                            }
                            data.Add(report1);  
                        }
                    }
                    conn.Close();
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "error in retriever users for report");
            }
            return data;
        }
    }
}
