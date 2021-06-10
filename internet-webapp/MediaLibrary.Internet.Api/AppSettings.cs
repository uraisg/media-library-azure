namespace MediaLibrary.Internet.Api
{
    public class AppSettings
    {
        public string MediaStorageConnectionString { get; set; }
        public string MediaStorageContainer { get; set; }
        public string TableConnectionString { get; set; }
        public string TableName { get; set; }
        public string ApiKey { get; set; }
    }
}
