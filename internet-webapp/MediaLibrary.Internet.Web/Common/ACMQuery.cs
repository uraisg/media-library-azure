namespace MediaLibrary.Internet.Web.Common
{
    public class ACMQueries
    {
        public static class Queries
        {
            //Check if user is in table
            public const string Checkstatus ="select * from mlizmgr.ACMStaffInfo where staffemail = @email and status = @status";
            public const string GetUserID = "SELECT UserID FROM mlizmgr.acmStaffInfo where staffEmail=@staffEmail";
            public const string InsertLoginSession = "INSERT INTO mlizmgr.acmSession (UserID, SessionID, IPAddress, LastLogin, LastLogout, CreatedBy, CreatedDate) VALUES (@userid, @sessionid, @ipaddress, @lastlogin, @lastlogout, @createdby, @createddate)";

            //ACMAuditLog related
            public const string InsertAuditLog = "insert into mliz.acmauditlog (UserID, UserLastAction, CreatedBy, CreatedDate) VALUES (@userid, @userlastaction, @createdby, @createddate)";
        }
        public string Checkstatus()
        {
            return Queries.Checkstatus;
        }
        public string GetUserID()
        {
            return Queries.GetUserID;
        }
        public string InsertAuditLog()
        {
            return Queries.InsertAuditLog;
        }
    }
}
