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
using System.Net.Mail;
using System.Net;
using Microsoft.Graph;
using static Org.BouncyCastle.Math.EC.ECCurve;
using Microsoft.Extensions.Configuration;

namespace MediaLibrary.Intranet.Web.Background
{
    /// <summary>
    /// A recurring background job for ACM 
    /// </summary>
    public class ACMScheduledService : BackgroundService
    {
        private CrontabSchedule _schedule;
        private DateTime _nextRun;

        // Run at 7:00 pm every day
        private static readonly string Schedule = "0 19 * * *";

        //for testing, every 3mins
        //private static readonly string Schedule = "*/3 * * * *";

        private readonly AppSettings _appSettings;
        private readonly ILogger<ACMScheduledService> _logger;
        private readonly IConfiguration Config;

        public ACMScheduledService(IOptions<AppSettings> appSettings, ILogger<ACMScheduledService> logger, IConfiguration config)
        {
            _schedule = CrontabSchedule.Parse(Schedule);
            _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
            _appSettings = appSettings.Value;
            _logger = logger;
            Config = config;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Yield();
            _logger.LogInformation("ACM scheduled service has started running.. (10pm every day)");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    if (now > _nextRun)
                    {
                        await ProcessACM();
                        _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
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

            //1. Queries UIAM view and seeds data into ACMStaffInfo
            _logger.LogInformation("Initializing querying UIAM view and seeding staff data into ACMStaffInfo");
            try
            {
                //string uiamConnectionString = _appSettings.intranetmlizconndb;
                string uiamConnectionString = Config.GetConnectionString("intranetmlizconndb");
                using SqlConnection conn = new SqlConnection(uiamConnectionString);
                conn.Open();
                await syncUIAMData(conn);
                conn.Close();
            _logger.LogInformation("Successfully queried UIAM view and seeded staff data into ACMStaffInfo");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while retrieving Staff list from UIAM View");
            }

            //2. Will seed in stafflogin per every entry in acmstaffinfo
            _logger.LogInformation("Initializing seeding missing stafflogin per every entry in acmstaffinfo");
            try
            {
                string sql = "";
                string userid = "";
                List<string> allStaffInfo = new List<string>(); //will hold list of all active staff userid's

                //string acmConnectionString = _appSettings.intranetmlizconndb;
                string acmConnectionString = Config.GetConnectionString("intranetmlizconndb");
                using SqlConnection conn = new SqlConnection(acmConnectionString);

                conn.Open();

                //Gets list of acmstaffinfo for processing
                sql = ACMQueries.Queries.GetAllStaffInfo;
                allStaffInfo = await GetAllStaffInfo(sql, conn);

                foreach (var i in allStaffInfo)
                {
                    userid = i;

                    //Queries acmsession if this staff entry is already present
                    sql = ACMQueries.Queries.QueryStaffSessionRecords;
                    bool doesSSRecordExist = await queryStaffSessionRecords(sql, conn, userid);
                    _logger.LogInformation("Value of doesSSrecordexist for " + userid + ": " + doesSSRecordExist);

                    //Queries acmstafflogin if this staff entry is already present
                    sql = ACMQueries.Queries.QueryStaffSLRecords;
                    bool doesSLRecordExist = await queryStaffSLRecords(sql, conn, userid);
                    _logger.LogInformation("Value of doesSLrecordexist for " + userid + ": " + doesSLRecordExist);

                    //Queries acmroleuser if this staff entry is already present
                    sql = ACMQueries.Queries.QueryStaffRoleRecords;
                    bool doesRoleRecordExist = await queryStaffRoleRecords(sql, conn, userid);
                    _logger.LogInformation("Value of doesRoleRecordExist for " + userid + ": " + doesRoleRecordExist);

                    //Seeds in staff session for this staff if entry is not present
                    if (doesSSRecordExist == false)
                    {
                        try
                        {
                            _logger.LogInformation("Staff entry (session) does not exist for: " + userid + ". Seeding staff in..");
                            sql = ACMQueries.Queries.SeedLoginInfoSession;
                            await seedLoginInfoSession(sql, conn, userid);
                            _logger.LogInformation("Seeded "+ userid +" in session.");
                        }
                        catch(Exception ex)
                        {
                            _logger.LogError(ex.ToString());
                        }
                    }

                    //Seeds in staff session for this staff if entry is not present
                    if (doesSLRecordExist == false)
                    {
                        try
                        {
                            _logger.LogInformation("Staff entry (login) does not exist for: " + userid + ". Seeding staff in..");
                            sql = ACMQueries.Queries.SeedLoginProfile;
                            await SeedLoginProfile(sql, conn, userid);
                            _logger.LogInformation("Seeded " + userid + " in login.");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex.ToString());
                        }
                    }

                    //Seeds in user role for this staff if entry is not present
                    if (doesRoleRecordExist == false)
                    {
                        try
                        {
                            _logger.LogInformation("User role does not exist for: " + userid + ". Seeding user role in..");
                            sql = ACMQueries.Queries.SeedUserRole;
                            await SeedUserRole(sql, conn, userid);
                            _logger.LogInformation("Seeded " + userid + " a [User] role.");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex.ToString());
                        }
                    }
                }
                conn.Close();
                _logger.LogInformation("Successfully seeded missing stafflogin per every entry in acmstaffinfo");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            //3. Checks staff for inactivity
            _logger.LogInformation("Initializing checking staff for inactivity");
            try
            {
                //string acmConnectionString = _appSettings.intranetmlizconndb;
                string acmConnectionString = Config.GetConnectionString("intranetmlizconndb");
                using SqlConnection conn = new SqlConnection(acmConnectionString);
                bool jobstatus = true;
                conn.Open();

                List<ACMCustomStaffTable> staffList = new List<ACMCustomStaffTable>();
                List <ACMSessionTable> sessionList = new List<ACMSessionTable>();
                // #1.LJ acmstaffinfo, acmsession, acmstafflogin data
                _logger.LogInformation("(1/2) Retrieving stafflist for inactivity checking");
                try
                {
                    string sql = ACMQueries.Queries.GetStaffInfo;
                    staffList = await GetStaffInfo(sql, conn);
                    _logger.LogInformation("(1/2) Successfully retrieved stafflist for inactivity checking");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception while retrieving Stafflist for inactivity checking");
                    jobstatus = false;
                    return;
                }

                // #1.LJ acmstaffinfo, acmsession, acmstafflogin data
                _logger.LogInformation("(2/2) Retrieving sessionlist for inactivity checking");
                try
                {
                    string sql = ACMQueries.Queries.GetSessionInfo;
                    sessionList = await GetSessionInfo(sql, conn);
                    _logger.LogInformation("(2/2) Successfully retrieved sessionlist for inactivity checking");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception while retrieving sessionlist for inactivity checking");
                    jobstatus = false;
                    return;
                }

                // #2: With data (stafflist, sessionlist), check all staff
                try
                {
                    foreach (var x in sessionList)
                    {
                        string staffEmail = "";
                        string status = "";
                        string firstReminderSent = "";
                        string secondReminderSent = "";
                        string thirdReminderSent = "";

                        //Get staff userid
                        string userid = x.UserID;

                        //Get lastlogin
                        DateTime lastlogin = x.LastLogin;

                        //Checks if lastlogin session is beyond 86 days (Day87/88/89 reminders, Day90 disable)
                        var todayDate = DateTime.Now;
                        if (todayDate.Subtract(lastlogin).Days > 86)
                        {
                            //Gets various information for that staff, from stafflist
                            foreach (var y in staffList)
                            {
                                if (y.UserID == x.UserID)
                                {
                                    //Get staff email
                                    staffEmail = y.StaffEmail;

                                    //Get status
                                    status = y.Status;

                                    //Get remindersent1
                                    firstReminderSent = y.FirstReminderSent;

                                    //Get remindersent2
                                    secondReminderSent = y.SecondReminderSent;

                                    //Get remindersent3
                                    thirdReminderSent = y.ThirdReminderSent;
                                     
                                    break;
                                }
                            }

                            bool isReminder = true;
                            if (status == "A")
                            {
                                string sql = "";
                                // Checks remindersent - if null, send smtp and update table. if all not null, update a 'suspended'
                                if (firstReminderSent == "") //Process 1st reminder
                                {
                                    _logger.LogInformation("Will send 1st reminder for: " + staffEmail);

                                    //send smtp to notify
                                    await SendEmail(staffEmail, isReminder);

                                    //updatetable
                                    sql = ACMQueries.Queries.UpdateReminderSent1;
                                    await UpdateReminderSent(sql, conn, staffEmail);

                                    _logger.LogInformation("1st reminder sent for: " + staffEmail);
                                }
                                else //Process 2nd reminder
                                {
                                    if (secondReminderSent == "")
                                    {
                                        _logger.LogInformation("Will send 2nd reminder for: " + staffEmail);

                                        //send smtp to notify
                                        await SendEmail(staffEmail, isReminder);

                                        //updatetable
                                        sql = ACMQueries.Queries.UpdateReminderSent2;
                                        await UpdateReminderSent(sql, conn, staffEmail);

                                        _logger.LogInformation("2nd reminder sent for: " + staffEmail);
                                    }
                                    else //Process 3rd reminder (final)
                                    {
                                        if (thirdReminderSent == "")
                                        {
                                            _logger.LogInformation("Will send 3rd reminder for: " + staffEmail);

                                            //send smtp to notify
                                            await SendEmail(staffEmail, isReminder);

                                            //updatetable
                                            sql = ACMQueries.Queries.UpdateReminderSent3;
                                            await UpdateReminderSent(sql, conn, staffEmail);

                                            _logger.LogInformation("3rd reminder sent for: " + staffEmail);
                                        }
                                        else //Disable the fella
                                        {
                                            _logger.LogInformation("Account will be suspended for: " + staffEmail);

                                            //Changes body of mail
                                            isReminder = false;

                                            //Send smtp to notify
                                            await SendEmail(staffEmail, isReminder);

                                            //Suspend user
                                            //sql = ACMQueries.Queries.GettUserID;
                                            //userid = await GetStaffIdByEmail(sql, conn, staffEmail);

                                            sql = ACMQueries.Queries.UpdateServiceSuspendedDate;
                                            await UpdateSuspendedDate(sql, conn, todayDate, userid);

                                            sql = ACMQueries.Queries.updateServiceStatus;
                                            await updateServiceStatus(sql, conn, staffEmail);

                                            _logger.LogInformation("Staff account suspended for: " + staffEmail);
                                        }

                                    }
                                }

                            }
                        }
                        
                    }
                    _logger.LogInformation("Successfully checked staff for inactivity");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception while checking staff for inactivity");
                    jobstatus = false;
                }

                //insert into job history
                _logger.LogInformation("Initializing job history insertion");
                try
                {
                    string sql = ACMQueries.Queries.InsertJobHistory;
                    await InsertJobHistory(sql, conn,jobstatus);
                    _logger.LogInformation("Successfully completed job history insertion");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception while inserting job history");
                    return;
                }

                //Send admin notifications
                _logger.LogInformation("Initializing sending admin-role users notification on scheduled job completion");
                try
                {
                    //get the list of users (emails) who are admin-role level
                    string sql = ACMQueries.Queries.GetAdminEmails;
                    string emails = await GetAdminEmails(sql, conn);
                    //send email to admin for info that job has finish running
                    _logger.LogInformation("Will be sending emails to the following admins for notification of job completion: " + emails);
                    await sendAdminNotification(jobstatus, emails);
                    _logger.LogInformation("Successfully sent admin-role users notification on scheduled job completion");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception while sending emails to admin-role users notification on scheduled job completion");
                }

                conn.Close();
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.ToString());
            }

        }

        private async Task<string> GetStatus(string sql, SqlConnection conn)
        {
            string status = "";
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    status = reader.GetString(0);
                }
            }
            catch (Exception ex)
            {               
                status = "error";
                _logger.LogError(ex.ToString());
            }

            return status;
        }

        private async Task<DateTime> GetLastLogin(string sql, SqlConnection conn)
        {
            DateTime lastlogin = (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue;
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
                _logger.LogError(ex.ToString());
                
            }

            return (DateTime)lastlogin;
        }

        private async Task<List<ACMCustomStaffTable>> GetStaffInfo(string sql, SqlConnection conn)
        {
            List<ACMCustomStaffTable> staffList = new List<ACMCustomStaffTable>();

            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    //UserID
                    string userid = "";
                    if (reader[0] != DBNull.Value)
                    {
                        userid = reader.GetString(0);
                    }
                    //StaffEmail
                    string staffemail = "";
                    if (reader[1] != DBNull.Value)
                    {
                        staffemail = reader.GetString(1);
                    }
                    //Status
                    string status = "";
                    if (reader[2] != DBNull.Value)
                    {
                        status = reader.GetString(2);
                    }
                    //FirstReminderSent
                    string firstremindersent = "";
                    if (reader[3] != DBNull.Value)
                    {
                        firstremindersent = reader.GetString(3);
                    }
                    //SecondReminderSent
                    string secondremindersent = "";
                    if (reader[4] != DBNull.Value)
                    {
                        secondremindersent = reader.GetString(4);
                    }
                    //ThirdReminderSent
                    string thirdremindersent = "";
                    if (reader[5] != DBNull.Value)
                    {
                        thirdremindersent = reader.GetString(5);
                    }

                    //Adds to list
                    staffList.Add(new ACMCustomStaffTable(userid, staffemail, status, firstremindersent, secondremindersent, thirdremindersent));
                }
                reader.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            return staffList;
        }

        private async Task<List<ACMSessionTable>> GetSessionInfo(string sql, SqlConnection conn)
        {
            List<ACMSessionTable> sessionList = new List<ACMSessionTable>();

            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    //UserID
                    string userid = "";
                    if (reader[0] != DBNull.Value)
                    {
                        userid = reader.GetString(0);
                    }
                    //LastLogin (max)
                    DateTime lastlogin = (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue;
                    if (reader[1] != DBNull.Value)
                    {
                        lastlogin = reader.GetDateTime(1);
                    }

                    //Adds to list
                    sessionList.Add(new ACMSessionTable(userid,lastlogin));
                }
                reader.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            return sessionList;
        }
        
        private async Task<List<string>> GetAllStaffInfo(string sql, SqlConnection conn)
        {
            List<string> allStaffInfo = new List<string>();

            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();

                string userid = "";
                string status = "";

                while (reader.Read())
                {
                    //Get Status
                    if (reader[4] != DBNull.Value)
                    {
                        status = reader.GetString(4);
                    }

                    if (status == "A")
                    {
                        //Gets UserID
                        if (reader[0] != DBNull.Value)
                        {
                            userid = reader.GetString(0);

                        }
                    }

                    //Adds to list, only for Active accounts
                    allStaffInfo.Add(userid);
                }
                reader.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            return allStaffInfo;
        }

        private async Task UpdateReminderSent(string sql, SqlConnection conn, string staffEmail)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@staffEmail", staffEmail);

                using SqlDataReader reader = cmd.ExecuteReader();
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }

        private async Task UpdateSuspendedDate(string sql, SqlConnection conn, DateTime todayDate, string userid)
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
                _logger.LogError(ex.ToString());
            }
        }
        private async Task updateServiceStatus(string sql, SqlConnection conn, string staffEmail)
        {
            try
            {

                using SqlCommand cmd = new SqlCommand(sql, conn);
           
                cmd.Parameters.AddWithValue("@staffEmail", staffEmail);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }
        private async Task InsertJobHistory(string sql, SqlConnection conn,bool jobstatus)
        {
            string outcome = "-";
            try
            {
                if (jobstatus)
                {
                    outcome = "Success";
                }
                else
                {
                    outcome = "Fail";
                }

                using SqlCommand cmd = new SqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("@jobname", "90 days batch job");
                cmd.Parameters.AddWithValue("@jobstatus", outcome);
                cmd.Parameters.AddWithValue("@jobstart", DateTime.Now);
                cmd.Parameters.AddWithValue("@jobend", DateTime.Now);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
               

                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }
        private async Task<string> GetAdminEmails(string sql, SqlConnection conn)
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
                _logger.LogError(ex.ToString());
            }
            return emails;

        }

        private async Task SendEmail(string staffEmail, bool isReminder)
        {
            try
            {
                string To = staffEmail;
                string From = "MediaLibrary_DoNotReply@ura.gov.sg"; //_appSettings.SMTPSenderEmail; 
                string smtpHost = _appSettings.SMTPHost;
                int smtpPort = _appSettings.SMTPPort;

                //Setting
                var smtpClient = new SmtpClient()
                {
                    Host = smtpHost, //"smtp.gmail.com" 
                    Port = smtpPort, //587
                    EnableSsl = true,
                    //Credentials = new NetworkCredential(From, _appSettings.SMTPPW), // not needed in intranet
                    UseDefaultCredentials = true, // in intranet should set to true, in devt false
                };

                if (isReminder == true)
                {
                    //Compose reminder notification email
                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(From),
                        Subject = "Expiring Media Library Access",
                        Body = "<h2>Please note that you have an expiring Media Library access. Please login as soon as possible to avoid suspension of account on the 90th day mark. Thank you.</h2>",
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
                        Subject = "Suspended Media Library Access",
                        Body = "<h2>Please note that your Media Library access has been disabled due to 90 days of inactivity. For reactivation, please look for [CS] Eng Yong/Rajimah. Thank you.</h2>",
                        IsBodyHtml = true,
                        Priority = MailPriority.High
                    };

                    //Recipients
                    mailMessage.To.Add(To);
                    smtpClient.Send(mailMessage);
                }

            }
            catch(Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

        }
        private async Task sendAdminNotification(bool jobstatus,string staffemails)
        {
            try
            {
                string To = staffemails.Substring(0, staffemails.Length - 1);
                string From = "MediaLibrary_DoNotReply@ura.gov.sg"; //_appSettings.SMTPSenderEmail; 
                string smtpHost = _appSettings.SMTPHost;
                int smtpPort = _appSettings.SMTPPort;

                _logger.LogInformation("SMTP Host for email sending: " + smtpHost);
                _logger.LogInformation("SMTP Port for email sending: " + smtpPort);

                //Setting
                var smtpClient = new SmtpClient()
                {
                    Host = smtpHost, //"smtp.gmail.com"
                    Port = smtpPort, //587
                    EnableSsl = true,
                    //Credentials = new NetworkCredential(From, _appSettings.SMTPPW), // not needed in intranet
                    UseDefaultCredentials = true, // in intranet should set to true, in devt false
                };

                if (jobstatus == true)
                {
                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(From),
                        Subject = "[Success] Media Library 90 days batch job",
                        Body = "<h2>The job has run successfully. No further action is required.</h2>",
                        IsBodyHtml = true,
                    };

                    //Recipients
                    mailMessage.To.Add(To);
                    smtpClient.Send(mailMessage);
                }
                else
                {
                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(From),
                        Subject = "[Error] Media Library 90 days batch job",
                        Body = "<h2>The job has failed.</h2>",
                        IsBodyHtml = true,
                    };

                    //Recipients
                    mailMessage.To.Add(To);
                    smtpClient.Send(mailMessage);
                }

            }
            catch(Exception ex) {
                _logger.LogError(ex.ToString());
            }

        }

        private async Task syncUIAMData(SqlConnection conn)
        {
            string sql = "";
            try
            {
                //================================================
                //Append data to group table if not there
                //================================================
                sql = ACMQueries.Queries.GetUIAMGroupInfo;
                List<UIAMGroupInfo> ulist = await GetUIAMGroupInfo(sql, conn);

                sql = ACMQueries.Queries.GetACMGroupInfo;
                List<ACMGroupInfo> alist = await GetACMGroupInfo(sql, conn);

                //Iterate UIAM/ACM table to insert new group 
                foreach (var group1 in ulist)
                {
                    bool groupMatch = false;
                    string groupname = group1.GroupName;

                    //Check if there is already a record of groupname in acm table,
                    //if there is, skip adding
                    foreach (var group2 in alist)
                    {
                        if (groupname == group2.GroupName)
                        {
                            groupMatch = true;                           
                            break;
                        }
                    }
                    //No matches, will proceed to add
                    if (groupMatch == false)
                    {
                        sql = ACMQueries.Queries.InsertGroupData;
                        await InsertGroupData(sql, conn, groupname);
                    }
                }

                //=================================================
                //Append data to dept table if not there
                //================================================
                sql = ACMQueries.Queries.GetUIAMDeptInfo;
                List<UIAMDeptInfo> udlist = await GetUIAMDeptInfo(sql, conn);

                sql = ACMQueries.Queries.GetACMDeptInfo;
                List<ACMDeptInfo> adlist = await GetACMDeptInfo(sql, conn);

                //Iterate UIAM/ACM table to insert new dept
                foreach (var dept1 in udlist)
                {
                    bool isMatch = false;
                    string deptID = dept1.DeptID;
                    string deptName = dept1.DeptName;
                    int groupID = 0;
                    string groupname = "";

                    //Check if there is already a record of deptname in acm table,
                    //if there is, skip adding
                    foreach (var dept2 in adlist)
                    {
                        if (deptName == dept2.DeptName)
                        {
                            isMatch = true;
                            break;
                        }
                    }
                    //No matches, will proceed to add
                    if (isMatch == false)
                    {
                        //Gets Group name
                        sql = ACMQueries.Queries.GetUIAMGroupName;
                        groupname = await GetUIAMGroupName(sql,conn,deptName);

                        //Gets the Group ID (from ACMDB), based off group name
                        sql = ACMQueries.Queries.GetACMGroupID;
                        groupID = await GetACMGroupID(sql, conn, groupname);

                        //Adds dept into acmdepttable
                        sql = ACMQueries.Queries.InsertDeptData;
                        await InsertDeptData(sql, conn, deptName, groupID);
                    }
                }

                //=================================================
                //Append data to staff table if not there
                //================================================
                sql = ACMQueries.Queries.GetUIAMStaffInfo;
                List<UIAMStaffInfo> ustaffinfolist = await GetUIAMStaffInfo(sql, conn);

                sql = ACMQueries.Queries.GetACMStaffInfo;
                List<ACMStaffInformation1> astaffinfolist = await GetACMStaffInfo(sql, conn);

                //Gets an updated GroupID list from ACMGroupInfo table (for matching operations later)
                sql = ACMQueries.Queries.GetACMGroupInfo;
                alist = await GetACMGroupInfo(sql, conn);

                //Gets an updated DeptID list from ACMGroupInfo table (for matching operations later)
                sql = ACMQueries.Queries.GetACMDeptInfo;
                adlist = await GetACMDeptInfo(sql, conn);

                //Gets current resigned staff list
                sql = ACMQueries.Queries.GetResignedStaffInfo;
                List<UIAMResignedStaffInfo> rslist = await GetResignedStaffInfo(sql, conn); //holds userid

                //Inserts new staff
                foreach (var staff1 in ustaffinfolist)
                {
                    bool staffExists = false;
                    string userid = staff1.USER_ID;
                    string emailid = staff1.EMAIL_ID;
                    string fullname = staff1.FULL_NAME;
                    string designation = staff1.DESIGNATION;
                    string del_ind = staff1.DEL_IND;
                    DateTime lastservicedate = (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue;
                    string deptname = staff1.SECTION_NAME;
                    string groupname = staff1.DIVISION_NAME;

                    //Check if there is already a record of deptname in acm table,
                    //if there is, skip adding
                    foreach (var staff2 in astaffinfolist)
                    {
                        if (userid == staff2.UserID)
                        {
                            staffExists = true;
                            break;
                        }
                    }                    
                    if (staffExists == false)
                    {
                        int staffgroupid = 0;
                        int staffdeptid = 0;

                        //For Group
                        foreach (var groupRow in alist)
                        {
                            if (groupRow.GroupName == groupname)
                            {
                                //Gets matching GroupID from ACMGroupInfo table
                                staffgroupid = groupRow.GroupID;
                                break;
                            }
                        }

                        //For Dept
                        foreach (var deptRow in adlist)
                        {
                            if (deptRow.DeptName == deptname)
                            {
                                //Gets matching DeptID from ACMGroupInfo table
                                staffdeptid = deptRow.DeptID;
                                break;
                            }
                        }

                        sql = ACMQueries.Queries.InsertStaffData;
                        await InsertStaffInfoData(sql, conn, userid, emailid, fullname, designation, del_ind, staffgroupid, staffdeptid);
                    }
                }

                //Updates status, lastservicedate (if valid) for staff in acm staff table; based off uiam's resignedstaff table
                foreach (var resignedstaff in rslist)
                {
                    foreach (var acmstaff in astaffinfolist)
                    {
                        //checks for match
                        if (resignedstaff.userid == acmstaff.UserID)
                        {
                            //Update staff info
                            sql = ACMQueries.Queries.UpdateStaffData;
                            await UpdateStaffData(sql, conn, resignedstaff.del_ind, resignedstaff.lastservicedate, resignedstaff.userid);
                            break;
                        }
                    }
                }
            }
            catch(Exception ex) {
                _logger.LogError(ex.ToString());
            }
        }

        private async Task<List<UIAMInfo>> GetUIAMInfo(string sql, SqlConnection conn)
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

                    string DIVISION_ID = "";
                    if (reader[5] != DBNull.Value)
                    {
                        DIVISION_ID = reader.GetString(5);
                    }

                    string DIVISION_NAME = "";
                    if (reader[6] != DBNull.Value)
                    {
                        DIVISION_NAME = reader.GetString(6);
                    }

                    string SECTION_ID = "";
                    if (reader[7] != DBNull.Value)
                    {
                        SECTION_ID = reader.GetString(7);
                    }

                    string SECTION_NAME = "";
                    if (reader[8] != DBNull.Value)
                    {
                        SECTION_NAME = reader.GetString(8);
                    }
                    //Adds to list
                    UIAMAlllist.Add(new UIAMInfo(UserID, EmailID, FullName, DESIGNATION, DEL_IND, DIVISION_ID, DIVISION_NAME, SECTION_ID, SECTION_NAME));
                }
            }

            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return UIAMAlllist;

        }

        private async Task<List<UIAMGroupInfo>> GetUIAMGroupInfo(string sql, SqlConnection conn)
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
                _logger.LogError(ex.ToString());
            }
            return UIAMGrouplist;

        }

        private async Task<List<ACMGroupInfo>> GetACMGroupInfo(string sql, SqlConnection conn)
        {
            List<ACMGroupInfo> ACMGrouplist = new List<ACMGroupInfo>();
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    int ACMGroupID = 0;
                    string ACMGroupName = "";
                    if (reader[0] != DBNull.Value)
                    {
                        ACMGroupID = reader.GetInt32(0);
                    }
                    if (reader[1] != DBNull.Value)
                    {
                        ACMGroupName = reader.GetString(1);
                    }

                    //Adds to list
                    ACMGrouplist.Add(new ACMGroupInfo(ACMGroupID, ACMGroupName));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return ACMGrouplist;

        }

        private async Task InsertGroupData(string sql, SqlConnection conn,string groupname)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@groupname", groupname);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }

        private async Task<List<UIAMDeptInfo>> GetUIAMDeptInfo(string sql, SqlConnection conn)
        {
            List<UIAMDeptInfo> UIAMDeptlist = new List<UIAMDeptInfo>();
            try
            {
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
                    UIAMDeptlist.Add(new UIAMDeptInfo(DeptID, DeptName));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());

            }
            return UIAMDeptlist;
        }

        private async Task<List<ACMDeptInfo>> GetACMDeptInfo(string sql, SqlConnection conn)
        {
            List<ACMDeptInfo> ACMDeptlist = new List<ACMDeptInfo>();
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    int ACMDeptID = 0;
                    string ACMDeptName = "";
                    if (reader[0] != DBNull.Value)
                    {
                        ACMDeptID = reader.GetInt32(0);
                    }
                    if (reader[1] != DBNull.Value)
                    {
                        ACMDeptName = reader.GetString(1);
                    }
                    //Adds to list
                    ACMDeptlist.Add(new ACMDeptInfo(ACMDeptID, ACMDeptName));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());

            }
            return ACMDeptlist;
        }
        private async Task InsertDeptData(string sql, SqlConnection conn,string deptname, int groupid)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@deptname", deptname);
                cmd.Parameters.AddWithValue("@groupid", groupid);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }

        private async Task<List<UIAMStaffInfo>> GetUIAMStaffInfo(string sql, SqlConnection conn)
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
                    string DIVISION_NAME = "";
                    if (reader[5] != DBNull.Value)
                    {
                        DIVISION_NAME = reader.GetString(5);
                    }
                    string SECTION_NAME = "";
                    if (reader[6] != DBNull.Value)
                    {
                        SECTION_NAME = reader.GetString(6);
                    }

                    //Adds to list
                    UIAMStafflist.Add(new UIAMStaffInfo(UserID, EmailID, FullName, DESIGNATION, DEL_IND, DIVISION_NAME, SECTION_NAME));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return UIAMStafflist;
        }

        private async Task<List<ACMStaffInformation1>> GetACMStaffInfo(string sql, SqlConnection conn)
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
                _logger.LogError(ex.ToString());
            }
            return ACMStafflist;
        }
        
        private async Task<List<UIAMResignedStaffInfo>> GetResignedStaffInfo(string sql, SqlConnection conn)
        {
            //this will hold list of all resigned staff user ids, status and lastservicedate
            List<UIAMResignedStaffInfo> rslist = new List<UIAMResignedStaffInfo>();
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    string userid = "";
                    if (reader[0] != DBNull.Value)
                    {
                        userid = reader.GetString(0);
                    }
                    string del_ind = "";
                    if (reader[1] != DBNull.Value)
                    {
                        del_ind = reader.GetString(1);
                    }
                    DateTime lastservicedate = (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue;
                    if (reader[2] != DBNull.Value)
                    {
                        lastservicedate = reader.GetDateTime(2);
                    }

                    //Adds to list
                    rslist.Add(new UIAMResignedStaffInfo(userid, del_ind, lastservicedate));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return rslist;
        }

        private async Task InsertStaffInfoData(string sql, SqlConnection conn, string userid, string email, string name, string designation, string DEL_IND, int groupid, int deptid)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@USER_ID", userid);
                cmd.Parameters.AddWithValue("@EMAIL_ID", email);
                cmd.Parameters.AddWithValue("@FULL_NAME", name);
                cmd.Parameters.AddWithValue("@DESIGNATION", designation);
                cmd.Parameters.AddWithValue("@DEL_IND", DEL_IND);
                cmd.Parameters.AddWithValue("@DIVISION_ID", groupid);
                cmd.Parameters.AddWithValue("@SECTION_ID", deptid);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }

        private async Task <DateTime> GetLastServiceDate(string sql, SqlConnection conn,string userid)
        {
            DateTime lastservicedate = (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue;
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@USER_ID", userid);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (reader[0] != DBNull.Value)
                    {
                        lastservicedate = reader.GetDateTime(0);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            return lastservicedate;
        }
        private async Task UpdateStaffData(string sql, SqlConnection conn,string del_ind,DateTime lastservicedate,string userid)
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
                _logger.LogError(ex.ToString());
            }
        }
        
        private async Task<string> GetUIAMGroupName(string sql, SqlConnection conn, string deptname)
        {
            string uiamgroupname ="";
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@deptname", deptname);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    uiamgroupname = reader.GetString(0);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            return uiamgroupname;
        }

        private async Task<int> GetACMGroupID(string sql, SqlConnection conn, string groupname)
        {
            int acmgroupid = 0;
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@groupname", groupname);
                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    acmgroupid = reader.GetInt32(0);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            return acmgroupid;
        }

        private async Task<string> GetStaffIdByEmail(string sql, SqlConnection conn,string staffemail)
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
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
          
            return staffid;
        }

        private async Task seedLoginInfoSession(string sql, SqlConnection conn, string userid)
        {
            DateTime lastlogin = DateTime.Now;
            DateTime lastlogout = (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue;

            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@sessionid", "N/A");
                cmd.Parameters.AddWithValue("@ipaddress", "N/A");
                cmd.Parameters.AddWithValue("@lastlogin", lastlogin);
                cmd.Parameters.AddWithValue("@lastlogout", lastlogout);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();

                _logger.LogInformation("Seeded login session for staffid: " + userid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }

        private async Task SeedLoginProfile(string sql, SqlConnection conn, string userid)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@firstremindersent", "");
                cmd.Parameters.AddWithValue("@secondremindersent", "");
                cmd.Parameters.AddWithValue("@thirdremindersent", "");
                cmd.Parameters.AddWithValue("@suspendeddate", "");
                cmd.Parameters.AddWithValue("@lastupdatedby", "");
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }
        
        private async Task SeedUserRole(string sql, SqlConnection conn, string userid)
        {
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@rolemstrid", 2);
                cmd.Parameters.AddWithValue("@createdby", "SYSTEM");
                cmd.Parameters.AddWithValue("@createddate", DateTime.Now);
                using SqlDataReader reader = cmd.ExecuteReader();

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }

        private async Task <bool> queryStaffSessionRecords(string sql, SqlConnection conn, string userid)
        {
            bool result = true;
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                using SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    int countResult = reader.GetInt32(0);
                    if (countResult == 0)
                    {
                        result = false; // means entry not there 
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return result;
        }

        private async Task<bool> queryStaffSLRecords(string sql, SqlConnection conn, string userid)
        {
            bool result = true;
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                using SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    int countResult = reader.GetInt32(0);
                    if (countResult == 0)
                    {
                        result = false; // means entry not there 
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return result;
        }

        private async Task<bool> queryStaffRoleRecords(string sql, SqlConnection conn, string userid)
        {
            //query if the staff have a 'User' Role
            bool result = true;
            try
            {
                using SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@rolemstrid", 2);
                using SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    int countResult = reader.GetInt32(0);
                    if (countResult == 0)
                    {
                        result = false; // means entry not there 
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            return result;
        }  

    }
}
