namespace MediaLibrary.Internet.Web
{
    public class AppSettings
    {
        public string MediaStorageConnectionString { get; set; }
        public string MediaStorageContainer { get; set; }
        public string TableConnectionString { get; set; }
        public string TableName { get; set; }
        public string ComputerVisionEndpoint { get; set; }
        public string ComputerVisionApiKey { get; set; }
        public string ThumbHeight { get; set; }
        public string ThumbWidth { get; set; }
        public string UploadTimeZone { get; set; }
        public string mlezbatchconn { get; set; }
        public string mlezappconn { get; set; }
    }
}
