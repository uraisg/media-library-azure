using MediaLibrary.Internet.Web;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MediaLibrary.Internet.Tests
{
    [TestClass]
    public class TestAppSettings
    {
        [TestMethod]
        public void TestAppSettingsObj()
        {
            AppSettings obj = new AppSettings();
            obj.MediaStorageConnectionString = "blob_storage_connection_string";
            obj.MediaStorageContainer = "media-upload";
            obj.MediaStorageConnectionStringImage = "image_retrieval_connection_string";
            obj.TableConnectionString = "table_storage_connection_string";
            obj.TableName = "mediametadata";
            obj.ComputerVisionEndpoint = "https://{instancename}.cognitiveservices.azure.com";
            obj.ComputerVisionApiKey = "7e11...";
            obj.ThumbHeight = "240";
            obj.ThumbWidth = "320";
            obj.UploadTimeZone = "Singapore Standard Time";

            Assert.IsNotNull(obj);
            Assert.AreEqual("blob_storage_connection_string", obj.MediaStorageConnectionString);
            Assert.AreEqual("media-upload", obj.MediaStorageContainer);
            Assert.AreEqual("image_retrieval_connection_string", obj.MediaStorageConnectionStringImage);
            Assert.AreEqual("table_storage_connection_string", obj.TableConnectionString);
            Assert.AreEqual("mediametadata", obj.TableName);
            Assert.AreEqual("https://{instancename}.cognitiveservices.azure.com", obj.ComputerVisionEndpoint);
            Assert.AreEqual("7e11...", obj.ComputerVisionApiKey);
            Assert.AreEqual("240", obj.ThumbHeight);
            Assert.AreEqual("320", obj.ThumbWidth);
            Assert.AreEqual("Singapore Standard Time", obj.UploadTimeZone);
        }
    }
}
