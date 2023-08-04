using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;


namespace MediaLibrary.Intranet.Web.Models
{
    public class ACMCustomStaffTable
    {
        public string StaffEmail { get; set; }
        public string Status { get; set; }
        public string FirstReminderSent { get; set; }
        public string SecondReminderSent { get; set; }
        public string ThirdReminderSent { get; set; }
        public DateTime LastLogin { get; set; }
        public DateTime CreatedDate { get; set; }

        public ACMCustomStaffTable(string StaffEmail, string Status,string FirstReminderSent, string SecondReminderSent, string ThirdReminderSent, DateTime LastLogin,DateTime CreatedDate)
        {
            this.StaffEmail = StaffEmail;
            this.Status = Status;
            this.FirstReminderSent = FirstReminderSent;
            this.SecondReminderSent = SecondReminderSent;
            this.ThirdReminderSent = ThirdReminderSent;
            this.LastLogin = LastLogin;
            this.CreatedDate = CreatedDate;
        }

    }
    public class UIAMInfo
    {
        public string USER_ID { get; set; }
        public string EMAIL_ID { get; set; }
        public string FULL_NAME { get; set; }
        public string DESIGNATION { get; set; }
        public string DEL_IND { get; set; }
        public DateTime LAST_SERVICE_DATE { get; set; }
        public string DIVISION_ID { get; set; }
        public string DIVISION_DESCRIPTION { get; set; }
        public string SECTION_ID { get; set; }

        public string SECTION_DESCRIPTION { get; set; }

        public UIAMInfo(string USER_ID, string EMAIL_ID, string FULL_NAME, string DESIGNATION, string DEL_IND, DateTime LAST_SERVICE_DATE, string DIVISION_ID,string DIVISION_DESCRIPTION, string SECTION_ID,string SECTION_DESCRIPTION)
        {
            this.USER_ID = USER_ID;
            this.EMAIL_ID = EMAIL_ID;
            this.FULL_NAME = FULL_NAME;
            this.DESIGNATION = DESIGNATION;
            this.DEL_IND = DEL_IND;
            this.LAST_SERVICE_DATE = LAST_SERVICE_DATE;
            this.DIVISION_ID = DIVISION_ID;
            this.DIVISION_DESCRIPTION = DIVISION_DESCRIPTION;
            this.SECTION_ID = SECTION_ID;
            this.SECTION_DESCRIPTION = SECTION_DESCRIPTION;
        }
    }

    public class UIAMGroupInfo
    {
        public string GroupID { get; set; }
        public string GroupName { get; set; }

        public UIAMGroupInfo(string GroupID, string GroupName)
        {
            this.GroupID = GroupID;
            this.GroupName = GroupName;
        }
    }

    public class ACMGroupInfo
    {
        public string GroupName { get; set; }

        public ACMGroupInfo(string GroupName)
        {
            this.GroupName = GroupName;
        }
    }
    public class UIAMDeptInfo
    {
        public string DeptID { get; set; }
        public string DeptName { get; set; }

        public string groupid { get; set; }

        public UIAMDeptInfo(string DeptID, string DeptName, string groupid)
        {
            this.DeptID = DeptID;
            this.DeptName = DeptName;
            this.groupid = groupid;
        }
    }

    public class ACMDeptInfo
    {
        public string DeptName { get; set; }

        public ACMDeptInfo(string DeptName)
        {
            this.DeptName = DeptName;
        }
    }

    public class UIAMStaffInfo
    {
        public string USER_ID { get; set; }
        public string EMAIL_ID { get; set; }
        public string FULL_NAME { get; set; }
        public string DESIGNATION { get; set; }
        public string DEL_IND { get; set; }
        public DateTime LAST_SERVICE_DATE { get; set; }
        public string DIVISION_ID { get; set; }
        public string SECTION_ID { get; set; }

        public UIAMStaffInfo(string USER_ID, string EMAIL_ID, string FULL_NAME,string DESIGNATION,string DEL_IND,DateTime LAST_SERVICE_DATE,string DIVISION_ID,string SECTION_ID)
        {
            this.USER_ID = USER_ID;
            this.EMAIL_ID = EMAIL_ID;
            this.FULL_NAME = FULL_NAME;
            this.DESIGNATION = DESIGNATION;
            this.DEL_IND = DEL_IND;
            this.LAST_SERVICE_DATE = LAST_SERVICE_DATE;
            this.DIVISION_ID = DIVISION_ID;
            this.SECTION_ID = SECTION_ID;
        }
    }

    public class ACMStaffInformation1
    {
        public string UserID { get; set; }

        public ACMStaffInformation1(string UserID)
        {
            this.UserID = UserID;
        }
    }

    public class UserQuery
    {
        public int Page { get; set; }
        public int pagelimit { get; set; }
        public int currPageCount { get; set; }
        public string SearchQuery { get; set; }
        public string SortOption { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string SuspendStartDate { get; set; }
        public string SuspendEndDate { get; set; }
        public List<string> filterbydepartment { get; set; }
        public List<string> filterbystatus { get; set; }
        public List<string> filterbygroup { get; set; }

    }


    public enum AllSortOption
    {
        groupASC,
        groupDSC,
        dateASC,
        dateDSC,
        departmentASC,
        departmentDSC,
        SuspendedDateASC,
        SuspendedDateDSC,
        RoleASC,
        RoleDSC
    }

    public class UserRoleQuery
    {
        public int Page { get; set; }
        public int pagelimit { get; set; }
        public int currPageCount { get; set; }
        public string SearchQuery { get; set; }
        public string SortOption { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public List<string> filterbydepartment { get; set; }
        public List<string> filterbyrole { get; set; }
        public List<string> filterbygroup { get; set; }

    }

    public class dropdownoptions
    {
        public List<string> departmentoptions { get; set; }
        public List<string> groupoptions { get; set; }
        public List<string> roleoptions { get;set; }
    }

    public class DownloadUserReport{
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public string Group { get; set; }
        public string Status { get; set; }
        public DateTime ?LastLoginDate { get; set; }
        public DateTime ?DisabledDate { get; set; }
    }

    public class DownloadUserRoleReport
    {
        public string id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string department { get; set; }
        public string group { get; set; }
        public string role { get; set; }
        public DateTime? LastLoginDate { get; set; }
    }

    public class ACMAuditlog
    {
        [Key]
        public int AuditlogID { get; set; }
        public string UserID { get; set; }
        public string UserLastAction { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class acmstafflogin
    {
        [Key]
        public string UserID { get; set; }
       
        public string FirstReminderSent { get; set; }
        public string SecondReminderSent { get; set; }
        public string ThirdReminderSent { get; set; }
        public DateTime DisabledDate { get; set; }
        public string LastUpdatedBy { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class ACMStaffInfo
    {
        [Key]
        public string UserID { get; set;}
        public string Status { get; set; }
        public string StaffEmail { get; set; }

        public string StaffName { get; set; }
        public string StaffDesn { get; set; }
        public int GroupID { get; set; }
        public int DeptID { get; set; }

        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

    }

    public class ACMGroupMaster
    {
        [Key]
        public string GroupID { get; set; }
        public string GroupName { get; set; }
        public string CreatedBy { get;set; }
        public DateTime CreatedDate { get; set; }
    }
    public class ACMDeptMaster
    {
        [Key]
        public int DeptID { get; set; }

        public string DeptName { get; set; }
        public int GroupID { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

    }

    public class ACMJobHistory
    {
        [Key]
        public int JobID { get; set; }
        public string JobName { get; set;}

        public string JobStatus { get; set;}

        public DateTime JobStart { get; set; }

        public DateTime JobEnd { get; set;}

        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

    }

    public class ACMSession
    {
        [Key]

        public string SessionID { get;}

        [Key]
        public string UserID { get; set; }

        public string IPAddress { get; set; }

        public int LoginAttempts { get; set; }
        public DateTime LastLogin { get; set; }
        public DateTime LastLogout { get; set; }

        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

    }


}
