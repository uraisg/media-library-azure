using System;
using System.Collections.Generic;
using System.Text;
using MediaLibrary.Internet.Web.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;

namespace MediaLibrary.Internet.Tests.Models
{
    [TestClass]
    public class TestComputerVisionModel
    {
        [TestMethod]
        public void TestCoordinateObj()
        {
            CoordinateObj obj = new CoordinateObj();
            obj.type = "point";
            obj.coordinates = new List<double> { 1.279586111111111, 103.8450861111111 };

            Assert.IsNotNull(obj);

            Assert.AreEqual("point", obj.type);
            Assert.AreEqual(2, obj.coordinates.Count);
            Assert.AreEqual(1.279586111111111, obj.coordinates[0]);
            Assert.AreEqual(103.8450861111111, obj.coordinates[1]);
        }

        [TestMethod]
        public void TestImageEntity()
        {
            DateTime curDate = new DateTime();

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
            obj.AdditionalField = new List<object>{ field1Obj, field2Obj };

            Assert.IsNotNull(obj);

            Assert.IsNotNull(obj.PartitionKey);
            Assert.IsNotNull(obj.RowKey);
            Assert.AreEqual("hw2EeMiCy7p5J2mh", obj.Id);
            Assert.AreEqual("someImage.jpg", obj.Name);
            Assert.AreEqual(curDate, obj.DateTaken);

            Assert.AreEqual("{\"type\":\"point\",\"coordinates\":[103.8451897,1.2795017]}", JsonConvert.SerializeObject(coords));
            Assert.AreEqual(JsonConvert.SerializeObject(coords), obj.Location);
            Assert.AreEqual("point", JsonConvert.DeserializeObject<CoordinateObj>(obj.Location).type);
            Assert.AreEqual(103.8451897, JsonConvert.DeserializeObject<CoordinateObj>(obj.Location).coordinates[0]);
            Assert.AreEqual(1.2795017, JsonConvert.DeserializeObject<CoordinateObj>(obj.Location).coordinates[1]);

            Assert.AreEqual("laptop,text,indoor,computer,sitting,electronics,desk,computer keyboard,open", obj.Tag);
            Assert.AreEqual(string.Join(",", tagList), obj.Tag);
            Assert.AreEqual(9, obj.Tag.Split(",").Length);

            Assert.AreEqual("an open laptop computer sitting on top of a table", obj.Caption);
            Assert.AreEqual("rin@gmail.com", obj.Author);
            Assert.AreEqual(curDate, obj.UploadDate);
            Assert.AreEqual("https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage.jpg", obj.FileURL);
            Assert.AreEqual("https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage_thumb.jpg", obj.ThumbnailURL);
            Assert.AreEqual("Marina Bay on a weekend", obj.Project);
            Assert.AreEqual(null, obj.Event);
            Assert.AreEqual("Marina Bay Sands", obj.LocationName);
            Assert.AreEqual("URA", obj.Copyright);

            Assert.AreEqual(2, obj.AdditionalField.Count);
            Assert.AreEqual(JsonConvert.DeserializeObject<object>(field1).ToString(), obj.AdditionalField[0].ToString());
            Assert.AreEqual(JsonConvert.DeserializeObject<object>(field2).ToString(), obj.AdditionalField[1].ToString());
            Assert.AreEqual("{\"Id\":\"db996580ef08c\",\"Key\":\"1\",\"Value\":\"2\"}", JsonConvert.SerializeObject(obj.AdditionalField[0]));
            Assert.AreEqual("{\"Id\":\"d89f718dcb3b9\",\"Key\":\"2\",\"Value\":\"3\"}", JsonConvert.SerializeObject(obj.AdditionalField[1]));
        }
    }
}
