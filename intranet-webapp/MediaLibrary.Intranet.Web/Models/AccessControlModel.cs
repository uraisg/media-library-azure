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

        public ACMCustomStaffTable(string StaffEmail, string Status,string FirstReminderSent, string SecondReminderSent, string ThirdReminderSent, DateTime LastLogin)
        {
            this.StaffEmail = StaffEmail;
            this.Status = Status;
            this.FirstReminderSent = FirstReminderSent;
            this.SecondReminderSent = SecondReminderSent;
            this.ThirdReminderSent = ThirdReminderSent;
            this.LastLogin = LastLogin;
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
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public string Group { get; set; }
        public string Role { get; set; }
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
