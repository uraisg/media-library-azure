using System.IO;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using Xunit;

namespace MediaLibrary.Internet.Tests.Common
{
    public class JsonHelperTests
    {
        [Fact]
        public void ShoudRoundtrip()
        {
            var mediaItem = new MediaItem()
            {
                Id = "id1",
                Name = "name1",
                FileURL = "/file1.jpg",
                ThumbnailURL = "/file1_thumb.jpg",
                Project = "Project1",
                Event = "Event1",
                LocationName = "Location1",
                Copyright = "Copyright1"
            };

            string json;
            using (var memoryStream = new MemoryStream())
            {
                JsonHelper.WriteJsonToStream(mediaItem, memoryStream);
                // Convert to string
                using (var sr = new StreamReader(memoryStream))
                {
                    json = sr.ReadToEnd();
                }
            }

            Assert.Contains("\"Id\": \"id1\"", json);
            Assert.Contains("\"FileURL\": \"/file1.jpg\"", json);
            Assert.Contains("\"ThumbnailURL\": \"/file1_thumb.jpg\"", json);
            Assert.Contains("\"Project\": \"Project1\"", json);
            Assert.Contains("\"Event\": \"Event1\"", json);
            Assert.Contains("\"LocationName\": \"Location1\"", json);
            Assert.Contains("\"Copyright\": \"Copyright1\"", json);

            MediaItem deserializedItem;
            using (var memoryStream = new MemoryStream())
            {
                using (var sw = new StreamWriter(memoryStream, leaveOpen: true))
                {
                    sw.Write(json);
                    sw.Flush();
                    memoryStream.Position = 0;
                }
                deserializedItem = JsonHelper.ReadJsonFromStream<MediaItem>(memoryStream);
            }

            Assert.Equal(mediaItem.Id, deserializedItem.Id);
            Assert.Equal(mediaItem.Name, deserializedItem.Name);
            Assert.Equal(mediaItem.Caption, deserializedItem.Caption);
            Assert.Equal(mediaItem.DateTaken, deserializedItem.DateTaken);
        }
    }
}
