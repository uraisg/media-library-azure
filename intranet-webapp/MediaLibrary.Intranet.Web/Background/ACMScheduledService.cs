using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NCrontab;
using Microsoft.Data.SqlClient;
using System.Diagnostics;
using System.Net.Mail;
using System.Net;
using System.Collections;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using Microsoft.Graph;

namespace MediaLibrary.Intranet.Web.Background
{
    /// <summary>
    /// A recurring background job for ACM 
    /// </summary>
    public class ACMScheduledService : BackgroundService
    {
        private CrontabSchedule _schedule;
        private DateTime _nextRun;

        // Run once at every second minute
        private static readonly string Schedule = "*/2 * * * *";

        // Run at 10:00 on every day-of-month
        private static readonly string Schedule2 = "0 10 * /1 * *";

        private readonly AppSettings _appSettings;
        private readonly ILogger<ACMScheduledService> _logger;


        public ACMScheduledService(IOptions<AppSettings> appSettings, ILogger<ACMScheduledService> logger)
        {
            _schedule = CrontabSchedule.Parse(Schedule);
            _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Yield();
            _logger.LogInformation("ACMScheduledService started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    if (now > _nextRun)
                    {
                       
                        _nextRun = _schedule.GetNextOccurrence(DateTime.Now);

                        await ProcessACM();
                      //  _nextRun = _schedule2.GetNextOccurrence(DateTime.Now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unhandled exception occurred, will retry processing at next interval");
                }

                await Task.Delay(15000, stoppingToken);
            }
        }

 
        private async Task ProcessACM()
        {
            string acmConnectionString = _appSettings.AzureSQLConnectionString;
            using SqlConnection conn = new SqlConnection(acmConnectionString);
            bool jobstatus = true;

            try
            {
                conn.Open();
                
                _logger.LogInformation("Syncing UIAM data");
                // await syncUIAMData();

                _logger.LogInformation("Querying staff info");

                List<ACMCustomStaffTable> staffList = new List<ACMCustomStaffTable>();

                // #1.LJ acmstaffinfo, acmsession, acmprofile data
                try
                {
                    string sql = ACMQueries.Queries.GetStaffInfo;
                    staffList = await GetStaffInfo(sql, conn);
            
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Got exception while retriving Staff list");
                    jobstatus = false;
                    return;
                }

                // #2: With data, check all staff
                //Retrieve user last login
                try
                {
                    foreach (var i in staffList)
                    {
                        //Get staff email
                        string staffEmail = i.StaffEmail;

                        //Get status

                        string status = i.Status;

                        //Get lastlogin
                        DateTime lastlogin = i.LastLogin;

                        //Get remindersent1
                        string firstReminderSent = i.FirstReminderSent;

                        //Get remindersent2
                        string secondReminderSent = i.SecondReminderSent;

                        //Get remindersent3
                        string thirdReminderSent = i.ThirdReminderSent;


                        //Get createddate of staff's profile (to prevenet new staff sedning for < 90d)
                        DateTime staffCreatedDate= i.CreatedDate;

                        bool isReminder = true;

                        var todayDate = DateTime.Now;

                        //applies 2 logic ,first is to check last login.Second is to give the user a grace period before auto suspend them.

                        if (todayDate.Subtract(lastlogin).Days > 10 && todayDate.Subtract(staffCreatedDate).Days>10) //for testing, 10 days
                        {

                            // Only process the following actions if status is detected as active
                            if (status == "Active" || status =="A")
                            {
                                string sql = "";

                                // Checks remindersent - if null, send smtp and update table. if all not null, update a 'suspended'
                                if (firstReminderSent == "")
                                {
                                    _logger.LogInformation("Will send 1st reminder");
                                    //send smtp to notify
                                    await SendEmail(staffEmail, isReminder);

                                    //updatetable
                                    sql = ACMQueries.Queries.UpdateReminderSent1;
                                    await UpdateReminderSent(sql, conn, staffEmail);
                                }
                                else //1streminder
                                {
                                    if (secondReminderSent == "")
                                    {
                                        _logger.LogInformation("Will send 2nd reminder");

                                        //send smtp to notify
                                        await SendEmail(staffEmail, isReminder);

                                        //updatetable
                                        sql = ACMQueries.Queries.UpdateReminderSent2;
                                        await UpdateReminderSent(sql, conn, staffEmail);
                                    }
                                    else //2ndreminder
                                    {
                                        if (thirdReminderSent == "")
                                        {
                                            _logger.LogInformation("Will send 3rd reminder");

                                            //send smtp to notify
                                            await SendEmail(staffEmail, isReminder);

                                            //updatetable
                                            sql = ACMQueries.Queries.UpdateReminderSent3;
                                            await UpdateReminderSent(sql, conn, staffEmail);
                                        }
                                        else //3rdreminder
                                        {
                                            _logger.LogInformation("Account will be suspended");

                                            //Changes body of mail
                                            isReminder = false;

                                            //Send smtp to notify
                                            await SendEmail(staffEmail, isReminder);

                                            //Suspend user
                                            sql = ACMQueries.Queries.GettUserID;
                                            string userid = await GetStaffIdByEmail(sql,conn,staffEmail);

                                            sql = ACMQueries.Queries.UpdateServiceSuspendedDate;
                                            await UpdateSuspendedDate(sql, conn, todayDate, userid);

                                            sql = ACMQueries.Queries.updateServiceStatus;

                                            await updateServiceStatus(sql, conn, staffEmail);


                                        }

                                    }
                                }

                            }
                        }
                    }

                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Got exception while processing with 90 days batch job");
                    jobstatus = false;
                    
                }
 
                //insert into job history
                try
                {
                    string sql = ACMQueries.Queries.InsertJobHistory;
                    await InsertJobHistory(sql, conn,jobstatus);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Got exception while inserting job history");
                    return;
                }

                try
                {
                    //get the list of emails who is admin
                    string sql = ACMQueries.Queries.GetAdminEmails;
                    string emails = await GetAdminEmails(sql, conn);

                    //send email to admin for info that job has finish running
                    await sendAdminNotification(jobstatus, emails);

                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Got exception while sending emails to admin");
                    return;
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.ToString());
            }

        }

        private static async Task<string> GetStatus(string sql, SqlConnection conn)
        {
            string status = "";
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    status = reader.GetString(0);
                    return status;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                status = "error";
            }

            return status;
        }

        private static async Task<DateTime> GetLastLogin(string sql, SqlConnection conn)
        {
            DateTime? lastlogin = null;
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    lastlogin = reader.GetDateTime(0);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                
            }

            return (DateTime)lastlogin;
        }

        private static async Task<List<ACMCustomStaffTable>> GetStaffInfo(string sql, SqlConnection conn)
        {
            List<ACMCustomStaffTable> staffList = new List<ACMCustomStaffTable>();
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    //StaffEmail
                    string staffemail = "";
                    if (reader[0] != DBNull.Value)
                    {
                        staffemail = reader.GetString(0);
                    }
                    //Status
                    string status = "";
                    if (reader[1] != DBNull.Value)
                    {
                        status = reader.GetString(1);
                    }
                    //FirstReminderSent
                    string firstremindersent = "";
                    if (reader[2] != DBNull.Value)
                    {
                        firstremindersent = reader.GetString(2);
                    }
                    //SecondReminderSent
                    string secondremindersent = "";
                    if (reader[3] != DBNull.Value)
                    {
                        secondremindersent = reader.GetString(3);
                    }
                    //ThirdReminderSent
                    string thirdremindersent = "";
                    if (reader[4] != DBNull.Value)
                    {
                        thirdremindersent = reader.GetString(4);
                    }
                    //LastLogin
                    DateTime lastlogin = default;
                    if (reader[5] != DBNull.Value)
                    {
                        lastlogin = reader.GetDateTime(5);
                    }

                    //staffCreatedDate

                    DateTime staffCreatedDate = default;
                    if (reader[6] != DBNull.Value)
                    {
                        staffCreatedDate = reader.GetDateTime(6);
                    }

                    //Adds to list
                    staffList.Add(new ACMCustomStaffTable(staffemail, status, firstremindersent, secondremindersent, thirdremindersent, default,staffCreatedDate));
                }
                reader.Close();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }

            return staffList;
        }

        private static async Task UpdateReminderSent(string sql, SqlConnection conn, string staffEmail)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@staffEmail", staffEmail);

                using SqlDataReader reader = cmd.ExecuteReader();
                
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
               
            }
        }

        private static async Task UpdateSuspendedDate(string sql, SqlConnection conn, DateTime todayDate, string userid)
        {
            try
            {
                string dateFormat = "yyyy-MM-dd";

                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@suspendedDate", Convert.ToDateTime(todayDate.ToString(dateFormat)));
                cmd.Parameters.AddWithValue("@lastupdated", "SYSTEM");
                cmd.Parameters.AddWithValue("@userid", userid);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
     
            }
        }
        private static async Task updateServiceStatus(string sql, SqlConnection conn, string staffEmail)
        {
            try
            {

                using SqlCommand cmd = new SqlCommand(sql, conn);
           
                cmd.Parameters.AddWithValue("@staffEmail", staffEmail);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
        }
        private static async Task InsertJobHistory(string sql, SqlConnection conn,bool jobstatus)
        {
            try
            {

                using SqlCommand cmd = new SqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("@jobname", "90 days batch job");
                cmd.Parameters.AddWithValue("@jobstatus", jobstatus);
                cmd.Parameters.AddWithValue("@jobstart", DateTime.Now);
                cmd.Parameters.AddWithValue("@jobend", DateTime.Now);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
               

                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
        }
        private static async Task<string> GetAdminEmails(string sql, SqlConnection conn)
        {
            string emails = "";
            try
            {

                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (reader[0] != DBNull.Value)
                    {
                        emails = emails + reader.GetString(0) + ",";
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
            return emails;

        }

        private async Task SendEmail(string staffEmail, bool isReminder)
        {
            string To = staffEmail;
            string From = _appSettings.SMTPSenderEmail;

            //Setting
            var smtpClient = new SmtpClient()
            {
                Host = "smtp.gmail.com", //urasmtpiz.ura.gov.sg
                Port = 587, //25
                EnableSsl = true,
                Credentials = new NetworkCredential(From, _appSettings.SMTPPW), // in ura intranet ,this one is not needed.
                UseDefaultCredentials = false, // in ura intranet should set to true
            };

            if (isReminder == true)
            {
                //Compose reminder notification email
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(From),
                    Subject = "Expiring Media Library",
                    Body = "<h1>Please be noted that you have an expiring Media Lib access. Please login now to avoid disable.</h1>",
                    IsBodyHtml = true,
                    Priority = MailPriority.High
                };

                //Recipients
                mailMessage.To.Add(To);
                smtpClient.Send(mailMessage);
            }
            else
            {
                //Compose disabled notification email
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(From),
                    Subject = "Disabled Media Library",
                    Body = "<h1>Please be noted that your Media Lib access is disabled. Thank you.</h1>",
                    IsBodyHtml = true,
                    Priority = MailPriority.High
                };

                //Recipients
                mailMessage.To.Add(To);
                smtpClient.Send(mailMessage);
            }

        }
        private async Task sendAdminNotification(bool jobstatus,string staffemails)
        {
            string To = staffemails.Substring(0, staffemails.Length-1);

            Debug.WriteLine(To);

            string From = _appSettings.SMTPSenderEmail;

            //Setting
            var smtpClient = new SmtpClient()
            {
                Host = "smtp.gmail.com", //urasmtpiz.ura.gov.sg
                Port = 587, //25
                EnableSsl = true,
                Credentials = new NetworkCredential(From, _appSettings.SMTPPW), // in ura intranet ,this one is not needed.
                UseDefaultCredentials = false, // in ura intranet should set to true
            };

            if (jobstatus == true)
            {
                //Compose reminder notification email
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(From),
                    Subject = "Media Library 90 days batch job",
                    Body = "<h1>The job has run successfully.</h1>",
                    IsBodyHtml = true,
                    Priority = MailPriority.High
                };

                //Recipients
                mailMessage.To.Add(To);
                smtpClient.Send(mailMessage);
            }
            else
            {
                //Compose disabled notification email
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(From),
                    Subject = "Media Library 90 days batch job",
                    Body = "<h1>The job has failed.</h1>",
                    IsBodyHtml = true,
                    Priority = MailPriority.High
                };

                //Recipients
                mailMessage.To.Add(To);
                smtpClient.Send(mailMessage);
            }

        }

        private async Task syncUIAMData()
        {
            string uiamConnStr = _appSettings.UIAMConnectionString;
            using SqlConnection conn = new SqlConnection(uiamConnStr);

            //Get all the data and stored in a list
            string sql = ACMQueries.Queries.GetUIAMInfo;
            List<UIAMInfo> AllInfoList = await GetUIAMInfo(sql, conn);

            // append data to group table if not there
            sql = ACMQueries.Queries.GetUIAMGroupInfo;
            List<UIAMGroupInfo> list =  await GetUIAMGroupInfo(sql, conn);

            sql = ACMQueries.Queries.GetACMGroupInfo;
            List<ACMGroupInfo> list2 = await GetACMGroupInfo(sql, conn);

           //Iterate ACM/UIAM table to insert new group 
            foreach (var group1 in list2)
            {
                bool groupMatch = false;
                string groupid = "";
                string groupname = "";

                foreach (var group2 in list)   
                {
                    if (group1.GroupName != group2.GroupName)
                    {
                        groupMatch = false;
                        groupid = group2.GroupID;
                        groupname = group2.GroupName;
                        break;
                    }
                    else
                    {
                        groupMatch = true;
                    }
                }
                if (groupMatch == false) { 
                    sql = ACMQueries.Queries.InsertGroupData;
                    await InsertGroupData(sql, conn,groupid,groupname);
                }
            }

            // append data to dept table if not there
          //   sql = ACMQueries.Queries.GetUIAMDeptInfo;
           //  List<UIAMDeptInfo> deptlist1 = await GetUIAMDeptInfo(sql, conn);

            sql = ACMQueries.Queries.GetACMDeptInfo;
            List<ACMDeptInfo> acmdeptlist2 = await GetACMDeptInfo(sql, conn);

                foreach (var row in acmdeptlist2)
                {
                bool isMatch = false;
                string deptid = "";
                string deptname = "";
                string groupid = "";

                foreach (var row2 in AllInfoList)
                {
                    if(row.DeptName != row2.SECTION_DESCRIPTION)
                    {
                        isMatch = false;
                        deptid = row2.SECTION_ID;
                        deptname = row2.SECTION_DESCRIPTION;
                        groupid = row2.DIVISION_ID;
                        break;
                    }
                    else
                    {
                        isMatch = true;
                    }
                }
                if (isMatch == false)
                {
                    sql = ACMQueries.Queries.InsertDeptData;
                    await InsertDeptData(sql, conn, deptid, deptname, groupid);
                }
            }

            // append data to staff table if not there
            sql = ACMQueries.Queries.GetUIAMStaffInfo;
            List<UIAMStaffInfo> staffinfolist1= await GetUIAMStaffInfo(sql, conn);

            sql = ACMQueries.Queries.GetACMStaffInfo;
            List<ACMStaffInformation1> acmstaffinfolist2 = await GetACMStaffInfo(sql, conn);

            foreach (var staff in acmstaffinfolist2)
            {
                bool staffinfoMatch = false;
                string userid = "";
                string emailid = "";
                string fullname = "";
                string designation = "";
                string del_ind = "";
                string staffgroupid = "";
                string staffdeptid = "";
                DateTime lastservicedate = default;

                foreach (var staff2 in staffinfolist1)
                {
                    if (staff.UserID != staff2.USER_ID)
                    {
                        staffinfoMatch = false;
                        userid = staff2.USER_ID;
                        emailid = staff2.EMAIL_ID;
                        fullname = staff2.FULL_NAME;
                        designation = staff2.DESIGNATION;
                        del_ind = staff2.DEL_IND;
                        staffgroupid = staff2.DIVISION_ID;
                        staffdeptid = staff2.SECTION_ID;
                        lastservicedate = staff2.LAST_SERVICE_DATE;
                        break;
                    }
                    else
                    {
                        staffinfoMatch = true;
                    }
                }

                if (staffinfoMatch == false)
                {
                        sql = ACMQueries.Queries.InsertStaffData;
                        await InsertStaffInfoData(sql, conn,userid,emailid,fullname,designation,del_ind, lastservicedate,staffgroupid, staffdeptid);
                }

                else // update existing staff table data if there is change
                {
                    if (del_ind != "A") 
                    {
                        sql = ACMQueries.Queries.UpdateStaffData;
                        await UpdateStaffData(sql, conn,del_ind, lastservicedate,userid);
                    }
                }

            }
        }
        private static async Task<List<UIAMInfo>> GetUIAMInfo(string sql, SqlConnection conn)
        {
            List<UIAMInfo> UIAMAlllist = new List<UIAMInfo>();
            try
            {

                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string UserID = "";
                    if (reader[0] != DBNull.Value)
                    {
                        UserID = reader.GetString(0);
                    }

                    string EmailID = "";
                    if (reader[1] != DBNull.Value)
                    {
                        EmailID = reader.GetString(1);
                    }
                    string FullName = "";
                    if (reader[2] != DBNull.Value)
                    {
                        FullName = reader.GetString(2);
                    }

                    string DESIGNATION = "";
                    if (reader[3] != DBNull.Value)
                    {
                        DESIGNATION = reader.GetString(3);
                    }
                    string DEL_IND = "";
                    if (reader[4] != DBNull.Value)
                    {
                        DEL_IND = reader.GetString(4);
                    }

                    DateTime LAST_SERVICE_DATE = default;
                    if (reader[5] != DBNull.Value)
                    {
                        LAST_SERVICE_DATE = reader.GetDateTime(5);
                    }

                    string DIVISION_ID = "";
                    if (reader[6] != DBNull.Value)
                    {
                        DIVISION_ID = reader.GetString(6);
                    }

                    string DIVISION_DESCRIPTION = "";
                    if (reader[7] != DBNull.Value)
                    {
                        DIVISION_DESCRIPTION = reader.GetString(7);
                    }

                    string SECTION_ID = "";
                    if (reader[8] != DBNull.Value)
                    {
                        SECTION_ID = reader.GetString(7);
                    }

                    string SECTION_DESCRIPTION = "";
                    if (reader[9] != DBNull.Value)
                    {
                        SECTION_DESCRIPTION = reader.GetString(7);
                    }
                    //Adds to list
                    UIAMAlllist.Add(new UIAMInfo(UserID, EmailID, FullName, DESIGNATION, DEL_IND, LAST_SERVICE_DATE, DIVISION_ID, DIVISION_DESCRIPTION, SECTION_ID, SECTION_DESCRIPTION));
                }
            }

            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
            return UIAMAlllist;

        }


        private static async Task<List<UIAMGroupInfo>> GetUIAMGroupInfo(string sql, SqlConnection conn)
        {
            List<UIAMGroupInfo> UIAMGrouplist = new List<UIAMGroupInfo>();
            try
            {

                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {

                    string GroupID = "";
                    if (reader[0] != DBNull.Value)
                    {
                        GroupID = reader.GetString(0);
                    }
                    string GroupName = "";
                    if (reader[1] != DBNull.Value)
                    {
                        GroupName = reader.GetString(1);
                    }

                    //Adds to list
                    UIAMGrouplist.Add(new UIAMGroupInfo(GroupID, GroupName));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
            return UIAMGrouplist;

        }

        private static async Task<List<ACMGroupInfo>> GetACMGroupInfo(string sql, SqlConnection conn)
        {
            List<ACMGroupInfo> ACMGrouplist = new List<ACMGroupInfo>();
            try
            {

                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string ACMGroupName = "";
                    if (reader[0] != DBNull.Value)
                    {
                        ACMGroupName = reader.GetString(0);
                    }

                    //Adds to list
                    ACMGrouplist.Add(new ACMGroupInfo(ACMGroupName));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
            return ACMGrouplist;

        }

        private static async Task InsertGroupData(string sql, SqlConnection conn,string groupid,string groupname)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                // wat is the groupid and groupname
                cmd.Parameters.AddWithValue("@groupid", groupid);
                cmd.Parameters.AddWithValue("@groupname", groupname);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
        }

        private static async Task<List<UIAMDeptInfo>> GetUIAMDeptInfo(string sql, SqlConnection conn)
        {
            List<UIAMDeptInfo> UIAMDeptlist = new List<UIAMDeptInfo>();
            try
            {
                string groupid = "";
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string DeptID = "";
                    if (reader[0] != DBNull.Value)
                    {
                        DeptID = reader.GetString(0);
                    }
                    string DeptName = "";
                    if (reader[1] != DBNull.Value)
                    {
                        DeptName = reader.GetString(1);
                    }

                    //Adds to list
                    UIAMDeptlist.Add(new UIAMDeptInfo(DeptID, DeptName,groupid));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
            return UIAMDeptlist;
        }

        private static async Task<List<ACMDeptInfo>> GetACMDeptInfo(string sql, SqlConnection conn)
        {
            List<ACMDeptInfo> ACMDeptlist = new List<ACMDeptInfo>();
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string ACMDeptName = "";
                    if (reader[0] != DBNull.Value)
                    {
                        ACMDeptName = reader.GetString(0);
                    }

                    //Adds to list
                    ACMDeptlist.Add(new ACMDeptInfo(ACMDeptName));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
            return ACMDeptlist;
        }
        private static async Task InsertDeptData(string sql, SqlConnection conn,string deptid,string deptname, string groupid)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@deptid", deptid);
                cmd.Parameters.AddWithValue("@deptname", deptname);
                cmd.Parameters.AddWithValue("@groupid", groupid);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
        }

        private static async Task<List<UIAMStaffInfo>> GetUIAMStaffInfo(string sql, SqlConnection conn)
        {
            List<UIAMStaffInfo> UIAMStafflist = new List<UIAMStaffInfo>();
            try
            {

                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string UserID = "";
                    if (reader[0] != DBNull.Value)
                    {
                        UserID = reader.GetString(0);
                    }

                    string EmailID = "";
                    if (reader[1] != DBNull.Value)
                    {
                        EmailID = reader.GetString(1);
                    }
                    string FullName = "";
                    if (reader[2] != DBNull.Value)
                    {
                        FullName = reader.GetString(2);
                    }

                    string DESIGNATION = "";
                    if (reader[3] != DBNull.Value)
                    {
                        DESIGNATION = reader.GetString(3);
                    }
                    string DEL_IND = "";
                    if (reader[4] != DBNull.Value)
                    {
                        DEL_IND = reader.GetString(4);
                    }

                    DateTime LAST_SERVICE_DATE = default;
                    if (reader[5] != DBNull.Value)
                    {
                        LAST_SERVICE_DATE = reader.GetDateTime(5);
                    }

                    string DIVISION_ID = "";
                    if (reader[6] != DBNull.Value)
                    {
                        DIVISION_ID = reader.GetString(6);
                    }
                    string SECTION_ID = "";
                    if (reader[7] != DBNull.Value)
                    {
                        SECTION_ID = reader.GetString(7);
                    }


                    //Adds to list
                    UIAMStafflist.Add(new UIAMStaffInfo(UserID, EmailID, FullName, DESIGNATION, DEL_IND, LAST_SERVICE_DATE, DIVISION_ID, SECTION_ID));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
            return UIAMStafflist;
        }

        private static async Task<List<ACMStaffInformation1>> GetACMStaffInfo(string sql, SqlConnection conn)
        {
            List<ACMStaffInformation1> ACMStafflist = new List<ACMStaffInformation1>();
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string UserId = "";
                    if (reader[0] != DBNull.Value)
                    {
                        UserId = reader.GetString(0);
                    }

                    //Adds to list
                    ACMStafflist.Add(new ACMStaffInformation1(UserId));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);

            }
            return ACMStafflist;
        }

        private static async Task InsertStaffInfoData(string sql, SqlConnection conn,string userid,string email,string name,string designation,string DEL_IND,DateTime lastservicedate,string groupid,string deptid)
        {
            try

            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@USER_ID", userid);
                cmd.Parameters.AddWithValue("@EMAIL_ID", email);
                cmd.Parameters.AddWithValue("@@FULL_NAME",name);
                cmd.Parameters.AddWithValue("@DESIGNATION", designation);
                cmd.Parameters.AddWithValue("@DEL_IND", DEL_IND);
                cmd.Parameters.AddWithValue("@LAST_SERVICE_DATE", lastservicedate);
                cmd.Parameters.AddWithValue("@DIVISION_ID", groupid);
                cmd.Parameters.AddWithValue("@SECTION_ID", deptid);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
        }
        private static async Task UpdateStaffData(string sql, SqlConnection conn,string del_ind,DateTime lastservicedate,string userid)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@del_ind", del_ind);
                cmd.Parameters.AddWithValue("@last_service_date", lastservicedate);
                cmd.Parameters.AddWithValue("@user_id", userid);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
        }

        private static async Task<string> GetUIAMGroupID(string sql, SqlConnection conn)
        {
            string UIAMGroupID = "";
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    UIAMGroupID = reader.GetString(0);
                    return UIAMGroupID;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }

            return UIAMGroupID;
        }

        private static async Task<string> GetStaffIdByEmail(string sql, SqlConnection conn,string staffemail)
        {
            string staffid = "";
            try
            {
                
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@email", staffemail);
                using SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    staffid = reader.GetString(0);
                    return staffid;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
          
            return staffid;
        }
    }
}
