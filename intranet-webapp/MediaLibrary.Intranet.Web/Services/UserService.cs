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
using Microsoft.Extensions.Configuration;

namespace MediaLibrary.Intranet.Web.Services
{
    public class UserService
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<UserService> _logger;
        private readonly IConfiguration Config;

    public UserService(IOptions<AppSettings> appSettings, ILogger<UserService> logger, IConfiguration config)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
            Config = config;
        }

        public Tuple<List<ACMStaffInfoResult>,int>  GetAllUsersByPage(UserQuery user)
        {
            // string acmConnectionString = _appSettings.intranetmlizconndb;
            string acmConnectionString = Config.GetConnectionString("intranetmlizconndb");
            ACMPage pagination = new ACMPage();
            List<ACMStaffInfoResult> staffInfoResults = new List<ACMStaffInfoResult>();
            string searchQuery = user.SearchQuery;
            string sortOption = user.SortOption;
            string sql2 = "SELECT COUNT(*) AS total_count from ACMStaffInfo si\r\ninner join ACMStaffLogin sl on si.UserID = sl.UserID\r\ninner join ACMSession ses on si.UserID = ses.UserID\r\ninner join ACMGroupMaster gm on si.GroupID = gm.GroupID\r\ninner join ACMDeptMaster dm on si.DeptID = dm.DeptID and gm.GroupID = dm.GroupID";
            
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
                    string newsql = string.Format(" Suspendeddate >= '{0}' and Suspendeddate <= '{1}'", SuspendedStartDate.ToString(dateFormat), SuspendedEndDate.ToString(dateFormat));
                    filterConditions.Add(newsql);
                }

                string filterStatus = getFilterResult(user.filterbystatus);
                if (!string.IsNullOrEmpty(filterStatus))
                {
                    Debug.WriteLine("hii{0}",filterStatus);
                    string newsql = string.Format("status in {0}", filterStatus);
                    Debug.WriteLine(newsql);
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
                    _logger.LogError("Error in sorting Users report by {sort}", sortOption);
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
                                sql = String.Format("{0} order by Suspendeddate OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by Suspendeddate OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
                            }
                            break;

                        case AllSortOption.SuspendedDateDSC:
                            if (user.Page > 1)
                            {
                                sql = String.Format("{0} order by Suspendeddate desc OFFSET {1} ROWS FETCH NEXT {2} ROWS ONLY", sql, user.currPageCount, user.pagelimit);
                            }
                            else
                            {
                                sql = String.Format("{0} order by Suspendeddate desc OFFSET 0 ROWS FETCH NEXT {1} ROWS ONLY", sql, user.pagelimit);
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

                        if (reader.GetString(5) == "A")
                        {
                            staffInfoResult.Status = "Active";
                        }

                        else
                        {
                            staffInfoResult.Status = "Suspended";
                        }

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
            //string acmConnectionString = _appSettings.intranetmlizconndb;
            string acmConnectionString = Config.GetConnectionString("intranetmlizconndb");
            using SqlConnection conn = new SqlConnection(acmConnectionString);
            try
            {
                conn.Open();
                string sql = ACMQueries.Queries.UpdateSuspendedDate;
                
                string dateFormat = "yyyy/MM/dd";
        
                using SqlCommand cmd = new SqlCommand(sql, conn);
               

                    if (status == "Active")
                    {
                        status = "A";
                        cmd.Parameters.AddWithValue("@suspendedDate", DBNull.Value);
                    }
                    else
                    {
                        status = "Suspended";
                        cmd.Parameters.AddWithValue("@suspendedDate", todayDate.ToString(dateFormat));
                    }

                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@lastupdated", lastupdatedby);
                cmd.Parameters.AddWithValue("@status", status);

                using SqlDataReader reader = cmd.ExecuteReader();
                conn.Close();

                conn.Open();
                string sql2 = ACMQueries.Queries.UpdateStatus;
               
                using SqlCommand cmd2 = new SqlCommand(sql2, conn);
              
                cmd2.Parameters.AddWithValue("@userid", userid);
              
                cmd2.Parameters.AddWithValue("@status", status);
                using SqlDataReader reader2 = cmd2.ExecuteReader();
                conn.Close();
                UpdateAuditLog(email, status, DateTime.Now);


            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating the users");
            }
        }

        public void UpdateAuditLog(string email,string status, DateTime date)
        {
            //string acmConnectionString = _appSettings.intranetmlizconndb;
            string acmConnectionString = Config.GetConnectionString("intranetmlizconndb");
            using SqlConnection conn = new SqlConnection(acmConnectionString);

            try
            {
                conn.Open();
                string Auditsql = ACMQueries.Queries.UpdateAuditLog;
                using SqlCommand cmd = new SqlCommand(Auditsql, conn);
                string lastaction = "";

                string actionuserid = ACMGetUserID(email);

                if (status == "Active" || status == "A")
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
                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating the audit log table");
            }
        }
        private string ACMGetUserID(string email)
        {
            //string acmConnectionString = _appSettings.intranetmlizconndb;
            string acmConnectionString = Config.GetConnectionString("intranetmlizconndb");
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
                conn.Close();
            }
           
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in getting the user ID");
            }
            return userid;
        }

        public Tuple<List<string>, List<string>> ACMDropdownOptions(UserQuery userquery)
        {
            //string acmConnectionString = _appSettings.intranetmlizconndb;
            string acmConnectionString = Config.GetConnectionString("intranetmlizconndb");
            dropdownoptions dropdownoptions = new dropdownoptions();

            List<string> options = new List<string>();
            List<string> groupOptions = new List<string>();

            dropdownoptions.departmentoptions = options;
            dropdownoptions.groupoptions = groupOptions;

            try
            {
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                conn.Open();
                string filterGroups = getFilterResult(userquery.filterbygroup);
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
            //string acmConnectionString = _appSettings.intranetmlizconndb;
            string acmConnectionString = Config.GetConnectionString("intranetmlizconndb");
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
                    string newsql = string.Format(" Suspendeddate >= '{0}' and Suspendeddate <= '{1}'", SuspendedStartDate.ToString(dateFormat), SuspendedEndDate.ToString(dateFormat));
                    filterConditions.Add(newsql);
                }

                string filterStatus = getFilterResult(user.filterbystatus);
                if (!string.IsNullOrEmpty(filterStatus))
                {
                    Debug.WriteLine(filterStatus);
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

                            if (reader.GetString(5) == "A" || reader.GetString(5) =="Active")
                            {
                                report1.Status = "Active";
                            }

                            else
                            {
                                report1.Status = "Suspended";
                            }

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
