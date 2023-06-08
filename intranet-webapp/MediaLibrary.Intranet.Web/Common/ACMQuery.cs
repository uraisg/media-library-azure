

using System.Collections.Generic;
using MediaLibrary.Intranet.Web.Models;

namespace MediaLibrary.Intranet.Web.Common
{
    public class ACMQueries
    {
        public static class Queries
        { /* public const string GetStatus = "SELECT status FROM acmstafflogin sp left join acmstaffinfo si ON sp.userid = si.userid WHERE staffemail ='test'";
           public const string GetLastLogin = "SELECT lastlogin FROM acmsession s left join acmstaffinfo si ON s.userid = si.userid WHERE staffemail = 'max_wong@ura.gov.sg'";
            public const string GetRemindersSent = "SELECT firstremindersent, secondremindersent, thirdremindersent FROM acmstafflogin sp left join acmstaffinfo si ON sp.userid = si.userid where staffemail = 'max_wong@ura.gov.sg'";*/
            public const string GetStaffInfo = "SELECT staffEmail, status, firstReminderSent, secondReminderSent, thirdReminderSent, lastLogin FROM acmStaffInfo si left join acmstafflogin sp ON si.userid = sp.userid left join acmSession ss ON si.userid = ss.userid";
            public const string UpdateReminderSent1 = "UPDATE acmstafflogin SET FirstReminderSent = 'Yes' FROM acmstafflogin sp left join acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string UpdateReminderSent2 = "UPDATE acmstafflogin SET SecondReminderSent = 'Yes' FROM acmstafflogin sp left join acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string UpdateReminderSent3 = "UPDATE acmstafflogin SET ThirdReminderSent = 'Yes' FROM acmstafflogin sp left join acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string DisableUser = "UPDATE acmstafflogin SET Status = 'Disabled', DisabledDate = @todayDate, LastUpdatedBy = 'system' FROM acmstafflogin sp left join acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string GetAllUsers = "select si.userid, staffname, staffemail, deptname, groupname, status, lastlogin, disableddate from acmstaffinfo si left join acmstafflogin sp on si.userid = sp.userid left join acmsession ss on si.userid = ss.userid left join acmgroupmaster gm on gm.groupid = si.groupid left join acmdeptmaster dm on gm.groupid = dm.groupid";
            public const string UpdateStatus = "UPDATE acmstafflogin SET   DisabledDate = @disableDate,LastUpdatedBy = @lastupdated  WHERE UserID = @userid";
            public const string UpdateStatus2 = "UPDATE ACMStaffInfo SET status =@status  WHERE UserID = @userid";
            public const string UpdateAuditLog = "Insert into ACMAuditlog values (@userid,@userlastaction, @createdby , @createddate)";
}

        /*        public string GetStatus()
                {
                    return Queries.GetStatus;
                }

                public string GetLastLogin()
                {
                    return Queries.GetLastLogin;
                }

                public string getRemindersSent()
                {
                    return Queries.GetRemindersSent;
                }*/

        public string GetStaffInfo()
        {
            return Queries.GetStaffInfo;
        }

        public string UpdateReminderSent1()
        {
            return Queries.UpdateReminderSent1;
        }
        public string UpdateReminderSent2()
        {
            return Queries.UpdateReminderSent2;
        }
        public string UpdateReminderSent3()
        {
            return Queries.UpdateReminderSent3;
        }
        public string DisableUser()
        {
            return Queries.DisableUser;
        }

        public string UpdateStatus()
        {
            return Queries.UpdateStatus;
        }

        public string UpdateStatus2()
        {
            return Queries.UpdateStatus2;
        }
        public string UpdateAuditLog()
        {
            return Queries.UpdateAuditLog;
        }
    }
}
