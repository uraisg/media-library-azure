using System.Collections.Generic;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Graph;

namespace MediaLibrary.Intranet.Web.Common
{
    public class ACMQueries
    {
        /// <summary>
        /// Holds all sql queries for ACM usage
        /// </summary>
        
        public static class Queries
        {
            //scheduleservice for acm to send emails 
            public const string GetStaffInfo = "SELECT si.userid, staffEmail, status, firstReminderSent, secondReminderSent, thirdReminderSent, lastLogin,si.createddate FROM mlizmgr.acmStaffInfo si left join mlizmgr.acmstafflogin sp ON si.userid = sp.userid left join mlizmgr.acmSession ss ON si.userid = ss.userid";
            public const string UpdateReminderSent1 = "UPDATE mlizmgr.acmstafflogin SET FirstReminderSent = 'Yes' FROM mlizmgr.acmstafflogin sp left join mlizmgr.acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string UpdateReminderSent2 = "UPDATE mlizmgr.acmstafflogin SET SecondReminderSent = 'Yes' FROM mlizmgr.acmstafflogin sp left join mlizmgr.acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string UpdateReminderSent3 = "UPDATE mlizmgr.acmstafflogin SET ThirdReminderSent = 'Yes' FROM mlizmgr.acmstafflogin sp left join mlizmgr.acmStaffInfo si ON sp.Userid = si.UserID WHERE staffEmail = @staffEmail";
            public const string InsertJobHistory = "insert into mlizmgr.ACMJobHistory values(@jobname,@jobstatus,@jobstart,@jobend,@createdby,@createddate)";
            public const string GetAdminEmails = "select staffemail from mlizmgr.ACMStaffInfo si left join mlizmgr.acmroleuser ru on si.userid = ru.userid where ru.RoleMstrID =1 ";
            public const string UpdateServiceSuspendedDate = "UPDATE mlizmgr.acmstafflogin SET suspendeddate = @suspendedDate,LastUpdatedBy = @lastupdated WHERE userid = @userid";
            public const string updateServiceStatus = "UPDATE mlizmgr.ACMStaffInfo SET status = 'Suspended' WHERE staffEmail = @staffEmail";
            public const string GetSessionInfo = "select userid, MAX(lastlogin) as max_lastlogin from mlizmgr.ACMSession group by userid";
            public const string SeedLoginProfile = "INSERT INTO mlizmgr.acmStaffLogin (UserID, FirstReminderSent, SecondReminderSent, ThirdReminderSent, SuspendedDate, LastUpdatedBy, CreatedBy, CreatedDate) VALUES (@userid, @firstremindersent, @secondremindersent, @thirdremindersent, @suspendeddate, @lastupdatedby, @createdby, @createddate);";

            //query for user list page -activate and suspend user
            public const string GetAllUsers = "select si.userid, staffname, staffemail, deptname, groupname, status, lastlogin, suspendeddate from mlizmgr.ACMStaffInfo si inner join mlizmgr.ACMStaffLogin sl on si.UserID = sl.UserID inner join mlizmgr.ACMSession ses on si.UserID = ses.UserID inner join mlizmgr.ACMGroupMaster gm on si.GroupID = gm.GroupID inner join mlizmgr.ACMDeptMaster dm on si.DeptID = dm.DeptID and gm.GroupID = dm.GroupID";
            public const string UpdateSuspendedDate = "UPDATE mlizmgr.acmstafflogin SET suspendeddate = @suspendedDate,LastUpdatedBy = @lastupdated WHERE UserID = @userid";
            public const string UpdateStatus = "UPDATE mlizmgr.ACMStaffInfo SET status = @status WHERE UserID = @userid";
            public const string UpdateAuditLog = "Insert into mlizmgr.ACMAuditlog values (@userid,@userlastaction, @createdby , @createddate)";

            //User role page
            public const string GetAllUserRole = "select si.userid, staffname, staffemail, deptname, groupname,rolename, lastlogin from mlizmgr.ACMStaffInfo si inner join mlizmgr.ACMStaffLogin sl on si.UserID = sl.UserID inner join mlizmgr.ACMSession ses on si.UserID = ses.UserID inner join mlizmgr.ACMGroupMaster gm on si.GroupID = gm.GroupID inner join mlizmgr.ACMDeptMaster dm on si.DeptID = dm.DeptID and gm.GroupID = dm.GroupID inner join mlizmgr.ACMRoleUser ru on si.userid = ru.UserID inner join mlizmgr.ACMRoleMaster rm on ru.RoleMstrID =rm.RoleMstrID";
            public const string GetTotalCountUserRole = "SELECT COUNT(*) AS total_count from mlizmgr.ACMStaffInfo si inner join mlizmgr.ACMStaffLogin sl on si.UserID = sl.UserID inner join mlizmgr.ACMSession ses on si.UserID = ses.UserID inner join mlizmgr.ACMGroupMaster gm on si.GroupID = gm.GroupID inner join mlizmgr.ACMDeptMaster dm on si.DeptID = dm.DeptID and gm.GroupID = dm.GroupID inner join mlizmgr.ACMRoleUser ru on si.userid = ru.UserID inner join mlizmgr.ACMRoleMaster rm on ru.RoleMstrID =rm.RoleMstrID";
            public const string CheckuserRole = "select rolename from mlizmgr.ACMStaffInfo si inner join mlizmgr.ACMStaffLogin sl on si.UserID = sl.UserID inner join mlizmgr.ACMRoleUser ru on si.userid = ru.UserID inner join mlizmgr.ACMRoleMaster rm on ru.RoleMstrID =rm.RoleMstrID where si.userid = @userid";
            public const string AddRoleUser = "Insert into mlizmgr.ACMRoleUser values (@userid,@rolemstrid, @createdby , @createddate)";

            public const string GetRoleBasedOfUser = "select rolename from mlizmgr.ACMStaffInfo si inner join mlizmgr.ACMStaffLogin sl on si.UserID = sl.UserID inner join mlizmgr.ACMRoleUser ru on si.userid = ru.UserID inner join mlizmgr.ACMRoleMaster rm on ru.RoleMstrID =rm.RoleMstrID where si.userid = (select userid from mlizmgr.ACMStaffInfo where StaffEmail = @email)";

            //UIAM - group table
            public const string GetUIAMGroupInfo = "select distinct DIVISION_ID, DIVISION_DESCRIPTION from UIAMIZDB.UIAM2.UIAM2_ALL_STAFF";
            public const string GetACMGroupInfo = "select distinct groupID, groupName from mlizmgr.ACMGroupMaster";
            public const string InsertGroupData = "insert into mlizmgr.acmGroupMaster values(@groupname, @createdby, @createddate)";

            //UIAM - dept table
            public const string GetUIAMDeptInfo = "select distinct SECTION_ID, SECTION_DESCRIPTION from UIAMIZDB.UIAM2.UIAM2_ALL_STAFF";
            public const string GetACMDeptInfo = "select distinct deptID, deptName from mlizmgr.ACMDeptMaster";
            public const string InsertDeptData = "insert into mlizmgr.acmDeptMaster values(@deptid, @deptname, @groupid, @createdby, @createddate)";
            public const string GetACMGroupID = "select groupid from mlizmgr.acmgroupmaster where groupname = @groupname";
            public const string GetUIAMGroupName = "select distinct division_description from UIAMIZDB.UIAM2.UIAM2_ALL_STAFF where section_description = @deptname";

            //UIAM - staffinfo table
            public const string GetUIAMStaffInfo = "select USER_ID, EMAIL_ID, FULL_NAME, DESIGNATION, DEL_IND, DIVISION_DESCRIPTION, SECTION_DESCRIPTION from UIAMIZDB.UIAM2.UIAM2_ALL_STAFF where user_id not like '%@%' and DIVISION_ID is not null";
            public const string GetACMStaffInfo = "select userid from mlizmgr.acmstaffinfo";
            public const string InsertStaffData = "insert into mlizmgr.acmstaffinfo values(@USER_ID, @EMAIL_ID, @FULL_NAME, @DESIGNATION, @DEL_IND, @LAST_SERVICE_DATE, @DIVISION_ID, @SECTION_ID, @createdby, @createddate)";
            public const string UpdateStaffData = "update mlizmgr.acmstaffinfo set status = @del_ind, lastservicedate = @last_service_date where userid = @user_id";

            public const string InsertLoginSession = "INSERT INTO mlizmgr.acmSession (UserID, SessionID, IPAddress, LastLogin, LastLogout, CreatedBy, CreatedDate) VALUES (@userid, @sessionid, @ipaddress, @lastlogin, @lastlogout, @createdby, @createddate)";
            public const string GetAdminRole = "select rolename from mlizmgr.acmrolemaster rm left join mlizmgr.acmroleuser ru on rm.rolemstrid = ru.rolemstrid left join mlizmgr.ACMStaffInfo si on si.UserID = ru.UserID where si.userid = @userid and status = @status";
            public const string GetUserID = "SELECT UserID FROM mlizmgr.acmStaffInfo where staffEmail=@staffEmail";

            public const string GetLastServiceDate = "select last_service_date from UIAMIZDB.UIAM2.UIAM2_RESIGNED_STAFF where user_id = @userid";

            //check if user exist in the acmstaffinfo table
            public const string CheckUserExist = "select * from mlizmgr.ACMStaffInfo where staffemail = @email";

            //UIAM - All info table
            public const string GetUIAMInfo = "select USER_ID, EMAIL_ID, FULL_NAME, DESIGNATION, DEL_IND, DIVISION_ID,DIVISION_DESCRIPTION, SECTION_ID,SECTION_DESCRIPTION from UIAMIZDB.UIAM2.UIAM2_ALL_STAFF where user_id not like '%@%'";

            public const string GettUserID = "select userid from mlizmgr.acmstaffinfo where staffemail =@email";

            //Query that inserts login session for all staff, till 1 Oct 2023
            public const string SeedLoginInfoSession = "INSERT INTO mlizmgr.acmSession (UserID, SessionID, IPAddress, LastLogin, LastLogout, CreatedBy, CreatedDate) VALUES (@userid, @sessionid, @ipaddress, @lastlogin, @lastlogout, @createdby, @createddate)";
            public const string GetAllStaffInfo = "select * from mlizmgr.ACMStaffInfo";
            public const string QueryStaffSessionRecords = "select count(*) from mlizmgr.ACMSession where userid = @userid";

            //ACMAuditLog related
            public const string InsertAuditLog = "insert into mliz.acmauditlog (UserID, UserLastAction, CreatedBy, CreatedDate) VALUES (@userid, @userlastaction, @createdby, @createddate)";
        }

        public string GetUGettUserIDIAMInfo()
        {
            return Queries.GettUserID;
        }
        public string GetUIAMInfo()
        {
            return Queries.GetUIAMInfo;
        }
        public string CheckUserExist()
        {
            return Queries.CheckUserExist;
        }
        public string InsertLoginSession()
        {
            return Queries.InsertLoginSession;
        }
        public string GetAdminRole()
        {
            return Queries.GetAdminRole;
        }
        public string GetUserID()
        {
            return Queries.GetUserID;
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
        public string UpdateStatus()
        {
            return Queries.UpdateStatus;
        }
        public string UpdateAuditLog()
        {
            return Queries.UpdateAuditLog;
        }
        public string CheckuserRole()
        {
            return Queries.CheckuserRole;
        }
        public string GetTotalCountUserRole()
        {
            return Queries.GetTotalCountUserRole;
        }
        public string GetAllUserRole()
        {
            return Queries.GetAllUserRole;
        }
        public string AddRoleUser()
        {
            return Queries.AddRoleUser;
        }
        public string GetRoleBasedOfUser()
        {
            return Queries.GetRoleBasedOfUser;
        }
        public string UpdateServiceSuspendedDate()
        {
            return Queries.UpdateServiceSuspendedDate;
        }
        public string updateServiceStatus()
        {
            return Queries.updateServiceStatus;
        }
        public string InsertJobHistory()
        {
            return Queries.InsertJobHistory;
        }
        public string GetAdminEmails()
        {
            return Queries.GetAdminEmails;
        }
        public string GetUIAMGroupInfo()
        {
            return Queries.GetUIAMGroupInfo;
        }
        public string GetACMGroupInfo()
        {
            return Queries.GetACMGroupInfo;
        }
        public string InsertGroupData()
        {
            return Queries.InsertGroupData;
        }
        public string GetACMGroupID()
        {
            return Queries.GetACMGroupID;
        }
        public string GetUIAMDeptInfo()
        {
            return Queries.GetUIAMDeptInfo;
        }
        public string GetACMDeptInfo()
        {
            return Queries.GetACMDeptInfo;
        }
        public string InsertDeptData()
        {
            return Queries.InsertDeptData;
        }
        public string GetUIAMStaffInfo()
        {
            return Queries.GetUIAMStaffInfo;
        }
        public string GetACMStaffInfo()
        {
            return Queries.GetACMStaffInfo;
        }
        public string InsertStaffData()
        {
            return Queries.InsertStaffData;
        }
        public string UpdateStaffData()
        {
            return Queries.UpdateStaffData;
        }
        public string SeedLoginInfoSession()
        {
            return Queries.SeedLoginInfoSession;
        }
        public string SeedLoginProfile()
        {
            return Queries.SeedLoginProfile;
        }
        public string GetAllStaffInfo()
        {
            return Queries.GetAllStaffInfo;
        }
        public string QueryStaffSessionRecords()
        {
            return Queries.QueryStaffSessionRecords;
        }
        public string GetSessionInfo()
        {
            return Queries.GetSessionInfo;
        }
        public string InsertAuditLog()
        {
            return Queries.InsertAuditLog;
        }

        public string GetUIAMGroupName()
        {
            return Queries.GetUIAMGroupName;
        }

        public string GetLastServiceDate()
        {
            return Queries.GetLastServiceDate;
        }
    }
}
