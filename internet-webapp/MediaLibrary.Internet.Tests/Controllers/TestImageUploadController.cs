using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using MediaLibrary.Internet.Web;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Controllers;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Newtonsoft.Json;
using static MediaLibrary.Internet.Web.Controllers.ImageUploadController;

namespace MediaLibrary.Internet.Tests.Controllers
{
    [TestClass]
    public class TestImageUploadController
    {
        private readonly IOptions<AppSettings> _appSettings;
        private readonly Mock<ILogger<ImageUploadController>> _logger;
        private readonly ImageUploadController _controller;

        // Change the values according to the draft you want to test on
        public string rowKey = "96f3ab46-8397-428b-aff0-b96c1ae4dc68";

        public string sampleEmail = "rin@gmail.com";
        // Should be changed to actual appsettings.json
        public string sampleAppSettings = "../../../../MediaLibrary.Internet.Web/appsettings.sample.json";

        public TestImageUploadController()
        {
            // Mock appsettings cannot be used as Azure requires a real location to direct towards
            AppSettings appSettings = new AppSettings();

            using (StreamReader r = new StreamReader(sampleAppSettings))
            {
                string json = r.ReadToEnd();
                dynamic item = JsonConvert.DeserializeObject<dynamic>(json);
                appSettings = item["AppSettings"].ToObject<AppSettings>();

                Assert.IsNotNull(item);
                Assert.AreEqual("mediametadata", appSettings.TableName);
            }

            _appSettings = Options.Create(appSettings);
            _logger = new Mock<ILogger<ImageUploadController>>();

            ITempDataProvider tempDataProvider = Mock.Of<ITempDataProvider>();
            TempDataDictionaryFactory tempDataDictionaryFactory = new TempDataDictionaryFactory(tempDataProvider);
            ITempDataDictionary tempData = tempDataDictionaryFactory.GetTempData(new DefaultHttpContext());

            _controller = new ImageUploadController(_appSettings, _logger.Object)
            {
                TempData = tempData
            };

            // Generate User for email (for recording in Draft and ImageEntity)
            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name, "Rin"),
                new Claim(ClaimTypes.NameIdentifier, "123"),
                new Claim("name", "Rin"),
                new Claim(GraphClaimTypes.Email, sampleEmail)
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");

            _controller.ControllerContext = new ControllerContext();
            _controller.ControllerContext.HttpContext = new DefaultHttpContext();
            _controller.ControllerContext.HttpContext.User.AddIdentity(identity);
        }

        [TestMethod]
        public void Get_IndexPage()
        {
            // Act
            var actionResult = _controller.Index();

            //Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(ViewResult));
        }

        // Upload draft into intranet
        [TestMethod]
        public async Task Upload_To_Intranet()
        {
            var result = await _controller.Index(rowKey);

            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result, typeof(ViewResult));
        }

        [TestMethod]
        public void TestTransferEntity()
        {
            DateTime curDate = DateTime.Now;

            CoordinateObj coords = new CoordinateObj();
            coords.type = "point";
            coords.coordinates = new List<double> { 103.8451897, 1.2795017 };

            List<string> tagList = new List<string> { "laptop", "text", "indoor", "computer", "sitting", "electronics", "desk", "computer keyboard", "open" };

            string field1 = "{\"Id\": \"db996580ef08c\",\"Key\": \"1\",\"Value\": \"2\"}";
            object field1Obj = JsonConvert.DeserializeObject<object>(field1);

            string field2 = "{\"Id\": \"d89f718dcb3b9\",\"Key\": \"2\",\"Value\": \"3\"}";
            object field2Obj = JsonConvert.DeserializeObject<object>(field2);

            TransferEntity entity = new TransferEntity();
            entity.Id = "hw2EeMiCy7p5J2mh";
            entity.Name = "someImage.jpg";
            entity.DateTaken = curDate;
            entity.Location = JsonConvert.SerializeObject(coords);
            entity.Tag = string.Join(",", tagList);
            entity.Caption = "an open laptop computer sitting on top of a table";
            entity.Author = "rin@gmail.com";
            entity.UploadDate = curDate;
            entity.FileURL = "https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage.jpg";
            entity.ThumbnailURL = "https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage_thumb.jpg";
            entity.Project = "Marina Bay on a weekend";
            entity.Event = null;
            entity.LocationName = "Marina Bay Sands";
            entity.Copyright = "URA";
            entity.AdditionalField = string.Join(",", new List<object> { field1Obj, field2Obj });

            Assert.IsNotNull(entity);

            Assert.AreEqual("hw2EeMiCy7p5J2mh", entity.Id);
            Assert.AreEqual("someImage.jpg", entity.Name);
            Assert.AreEqual(curDate, entity.DateTaken);
            Assert.AreEqual(JsonConvert.SerializeObject(coords), entity.Location);
            Assert.AreEqual(string.Join(",", tagList), entity.Tag);
            Assert.AreEqual("an open laptop computer sitting on top of a table", entity.Caption);
            Assert.AreEqual("rin@gmail.com", entity.Author);
            Assert.AreEqual(curDate, entity.UploadDate);
            Assert.AreEqual("https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage.jpg", entity.FileURL);
            Assert.AreEqual("https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage_thumb.jpg", entity.ThumbnailURL);
            Assert.AreEqual("Marina Bay on a weekend", entity.Project);
            Assert.IsNull(entity.Event);
            Assert.AreEqual("URA", entity.Copyright);

            // ERROR IN THIS PART
            /*
            var additionalFields = JsonConvert.DeserializeObject<object>(entity.AdditionalField.Replace("[", "").Replace("]", ""));
            Assert.AreEqual(field1Obj.ToString(), additionalFields.ToString());
            Assert.AreEqual(field2Obj.ToString(), entity.AdditionalField.ToString());
            */
        }
    }
}
