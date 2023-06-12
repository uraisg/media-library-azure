

using System.Collections.Generic;
using MediaLibrary.Intranet.Web.Models;

namespace MediaLibrary.Intranet.Web.Common
{
    public class ACMQueries
    {
        public static class Queries
        { 
            public const string GetStaffInfo = "SELECT staffEmail, status, firstReminderSent, secondReminderSent, thirdReminderSent, lastLogin FROM acmStaffInfo si left join acmstafflogin sp ON si.userid = sp.userid left join acmSession ss ON si.userid = ss.userid";
            public const string UpdateReminderSent1 = "UPDATE acmstafflogin SET FirstReminderSent = 'Yes' FROM acmstafflogin sp left join acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string UpdateReminderSent2 = "UPDATE acmstafflogin SET SecondReminderSent = 'Yes' FROM acmstafflogin sp left join acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string UpdateReminderSent3 = "UPDATE acmstafflogin SET ThirdReminderSent = 'Yes' FROM acmstafflogin sp left join acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string DisableUser = "UPDATE acmstafflogin SET Status = 'Suspended', suspendeddate = @todayDate, LastUpdatedBy = 'system' FROM acmstafflogin sp left join acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string GetAllUsers = "select si.userid, staffname, staffemail, deptname, groupname, status, lastlogin, suspendeddate from ACMStaffInfo si\r\ninner join ACMStaffLogin sl on si.UserID = sl.UserID\r\ninner join ACMSession ses on si.UserID = ses.UserID\r\ninner join ACMGroupMaster gm on si.GroupID = gm.GroupID\r\ninner join ACMDeptMaster dm on si.DeptID = dm.DeptID and gm.GroupID = dm.GroupID";
            public const string UpdateStatus = "UPDATE acmstafflogin SET suspendeddate = @disableDate,LastUpdatedBy = @lastupdated WHERE UserID = @userid";
            public const string UpdateStatus2 = "UPDATE ACMStaffInfo SET status = @status WHERE UserID = @userid";
            public const string UpdateAuditLog = "Insert into ACMAuditlog values (@userid,@userlastaction, @createdby , @createddate)";
            public const string GetUserRole = "select si.userid, staffname, staffemail, deptname, groupname,rolename, lastlogin from ACMStaffInfo si\r\ninner join ACMStaffLogin sl on si.UserID = sl.UserID\r\ninner join ACMSession ses on si.UserID = ses.UserID\r\ninner join ACMGroupMaster gm on si.GroupID = gm.GroupID\r\ninner join ACMDeptMaster dm on si.DeptID = dm.DeptID and gm.GroupID = dm.GroupID\r\ninner join ACMRoleUser ru on si.userid = ru.UserID inner join ACMRoleMaster rm on ru.RoleMstrID =rm.RoleMstrID";
            public const string UpdateUserRole= "UPDATE ACMRoleUser SET rolemstrid = @rolemstrid,createdby = @createdby ,createddate = @createddate WHERE UserID = @userid and rolemstrid = @userroleid ";
			public const string GetTotalCountUser = "SELECT COUNT(*) AS total_count from ACMStaffInfo si inner join ACMStaffLogin sl on si.UserID = sl.UserID inner join ACMSession ses on si.UserID = ses.UserID inner join ACMGroupMaster gm on si.GroupID = gm.GroupID\r\ninner join ACMDeptMaster dm on si.DeptID = dm.DeptID and gm.GroupID = dm.GroupID inner join ACMRoleUser ru on si.userid = ru.UserID inner join ACMRoleMaster rm on ru.RoleMstrID =rm.RoleMstrID";
			public const string GetRole = "select rolename from ACMStaffInfo si inner join ACMStaffLogin sl on si.UserID = sl.UserID inner join ACMSession ses on si.UserID = ses.UserID inner join ACMGroupMaster gm on si.GroupID = gm.GroupID inner join ACMDeptMaster dm on si.DeptID = dm.DeptID and gm.GroupID = dm.GroupID inner join ACMRoleUser ru on si.userid = ru.UserID inner join ACMRoleMaster rm on ru.RoleMstrID =rm.RoleMstrID where si.userid = @userid";

		}

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

        public string GetUserRole()
        {
            return Queries.GetUserRole;
        }

		public string UpdateUserRole()
		{
			return Queries.UpdateUserRole;
		}

		public string GetTotalCountUser()
		{
			return Queries.GetTotalCountUser;
		}

		public string GetRole()
		{
			return Queries.GetRole;
		}
	}
}
