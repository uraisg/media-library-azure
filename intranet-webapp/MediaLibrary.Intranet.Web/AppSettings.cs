namespace MediaLibrary.Intranet.Web
{
    public class AppSettings
    {
        public string MediaStorageConnectionString { get; set; }
        public string MediaStorageAccountName { get; set; }
        public string MediaStorageImageContainer { get; set; }
        public string MediaStorageIndexContainer { get; set; }
        public string InternetTableAPI { get; set; }
        public string InternetImageAPI { get; set; }
        public string SearchServiceName { get; set; }
        public string SearchServiceQueryApiKey { get; set; }
        public string SearchServiceAdminApiKey { get; set; }
        public string SearchIndexName { get; set; }
        public string ApiDomain { get; set; }
        public string ApiKey { get; set; }
        public string AdminUsers { get; set; }
    }
}
