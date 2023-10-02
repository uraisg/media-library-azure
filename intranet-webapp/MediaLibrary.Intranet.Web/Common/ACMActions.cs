namespace MediaLibrary.Intranet.Web.Common
{
    public class ACMActions
    {
        /// <summary>
        /// Any actions for the ACMAuditLog table will be referenced here.
        /// </summary>
        public static class Actions
        {
            public const string UserAttemptsLogin = "Login attempt in Search portal";
        }

        public string UserAttemptsLogin()
        {
            return Actions.UserAttemptsLogin;
        }
    }
}
