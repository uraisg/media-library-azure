

using System.Collections.Generic;
using MediaLibrary.Internet.Web.Models;
using Microsoft.Graph;

namespace MediaLibrary.Intranet.Web.Common
{
    public class ACMQueries
    {
        public static class Queries
        {
            //Check if user is in table
            public const string CheckUserInTable = "select * from mlezmgr.ACMStaffInfo where staffemail = @email";

            public const string Checkstatus ="select * from mlezmgr.ACMStaffInfo where staffemail = @email and status = @status";
        }

        public string CheckUserInTable()
        {
            return Queries.CheckUserInTable;
        }

        public string Checkstatus()
        {
            return Queries.Checkstatus;
        }
    }
}
