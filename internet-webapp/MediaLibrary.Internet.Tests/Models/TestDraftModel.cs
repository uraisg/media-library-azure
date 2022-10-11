using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;

namespace MediaLibrary.Internet.Tests.Models
{
    [TestClass]
    public class TestDraftModel
    {
        // Should be changed depending on sample image location
        public string sampleImgPath = "C:\\Users\\nianc\\Documents\\VS\\media-library-azure\\internet-webapp\\MediaLibrary.Internet.Tests\\Models\\images\\1.jpg";

        [TestMethod]
        public void TestDraft()
        {
            DateTime curDate = DateTime.Now;

            List<ImageEntity> entities = new List<ImageEntity>();

            CoordinateObj coords = new CoordinateObj();
            coords.type = "point";
            coords.coordinates = new List<double> { 103.8451897, 1.2795017 };

            List<string> tagList = new List<string> { "laptop", "text", "indoor", "computer", "sitting", "electronics", "desk", "computer keyboard", "open" };

            string field1 = "{\"Id\": \"db996580ef08c\",\"Key\": \"1\",\"Value\": \"2\"}";
            object field1Obj = JsonConvert.DeserializeObject<object>(field1);

            string field2 = "{\"Id\": \"d89f718dcb3b9\",\"Key\": \"2\",\"Value\": \"3\"}";
            object field2Obj = JsonConvert.DeserializeObject<object>(field2);

            ImageEntity obj = new ImageEntity();
            obj.Id = "hw2EeMiCy7p5J2mh";
            obj.Name = "someImage.jpg";
            obj.DateTaken = curDate;
            obj.Location = JsonConvert.SerializeObject(coords);
            obj.Tag = string.Join(",", tagList);
            obj.Caption = "an open laptop computer sitting on top of a table";
            obj.Author = "rin@gmail.com";
            obj.UploadDate = curDate;
            obj.FileURL = "https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage.jpg";
            obj.ThumbnailURL = "https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage_thumb.jpg";
            obj.Project = "Marina Bay on a weekend";
            obj.Event = null;
            obj.LocationName = "Marina Bay Sands";
            obj.Copyright = "URA";
            obj.AdditionalField = new List<object> { field1Obj, field2Obj };

            entities.Add(obj);

            Draft draft = new Draft();
            draft.UploadDate = curDate;
            draft.Author = "rin@gmail.com";
            draft.ImageEntities = JsonConvert.SerializeObject(entities);

            Assert.IsNotNull(draft);

            Assert.AreEqual("draft", draft.PartitionKey);
            Assert.IsNotNull(draft.RowKey);
            Assert.AreEqual(curDate, draft.UploadDate);
            Assert.AreEqual("rin@gmail.com", draft.Author);

            Assert.AreEqual(JsonConvert.SerializeObject(entities), draft.ImageEntities);
            Assert.AreEqual("hw2EeMiCy7p5J2mh", JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Id);
            Assert.AreEqual("someImage.jpg", JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Name);
            Assert.AreEqual(curDate, JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].DateTaken);
            Assert.AreEqual(JsonConvert.SerializeObject(coords), JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Location);
            Assert.AreEqual(string.Join(",", tagList), JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Tag);
            Assert.AreEqual("an open laptop computer sitting on top of a table", JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Caption);
            Assert.AreEqual("rin@gmail.com", JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Author);
            Assert.AreEqual(curDate, JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].UploadDate);
            Assert.AreEqual("https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage.jpg", JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].FileURL);
            Assert.AreEqual("https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage_thumb.jpg", JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].ThumbnailURL);
            Assert.AreEqual("Marina Bay on a weekend", JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Project);
            Assert.IsNull(JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Event);
            Assert.AreEqual("URA", JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].Copyright);

            Assert.AreEqual(field1Obj.ToString(), JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].AdditionalField[0].ToString());
            Assert.AreEqual(field2Obj.ToString(), JsonConvert.DeserializeObject<ImageEntity[]>(draft.ImageEntities)[0].AdditionalField[1].ToString());
        }

        [TestMethod]
        public void TestAddImageModel()
        {
            var filepath1 = sampleImgPath;

            var stream = File.OpenRead(filepath1);
            IFormFile model = new FormFile(stream, 0, stream.Length, null, Path.GetFileName(stream.Name));

            AddImageModel obj = new AddImageModel();
            obj.name = "Weekend at Marina Bay";
            obj.location = "Marina Bay Sands";
            obj.copyright = "URA";
            obj.file = model;

            Assert.IsNotNull(obj);

            Assert.AreEqual("Weekend at Marina Bay", obj.name);
            Assert.AreEqual("Marina Bay Sands", obj.location);
            Assert.AreEqual("URA", obj.copyright);
            Assert.AreEqual(model, obj.file);
        }
    }
}
