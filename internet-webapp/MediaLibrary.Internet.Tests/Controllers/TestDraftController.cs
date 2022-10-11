using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediaLibrary.Internet.Web;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Controllers;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Newtonsoft.Json;
using static MediaLibrary.Internet.Web.Controllers.DraftController;

namespace MediaLibrary.Internet.Tests.Controllers
{
    [TestClass]
    public class TestDraftController
    {
        private readonly IOptions<AppSettings> _appSettings;
        private readonly Mock<ILogger<DraftController>> _logger;
        private readonly CancellationToken _cancellationToken;
        private readonly DraftController _controller;

        // Change the values according to the draft you want to test on
        public string rowKey = "754401fd-1e14-463e-b467-f21e55e98fda";
        public string imageKey = "QiaHh7eRgDDC3yfq";
        public string mediaFile = "Fvhgw5HPRzFgHZLc_1.jpg";

        public string sampleEmail = "rin@gmail.com";
        // Should be changed depending on sample image location
        public string sampleImgPath = "C:\\Users\\nianc\\Documents\\VS\\media-library-azure\\internet-webapp\\MediaLibrary.Internet.Tests\\Models\\images\\1.jpg";
        // Should be changed depending on appsetting.json location
        public string sampleAppSettings = "C:\\Users\\nianc\\Documents\\VS\\media-library-azure\\internet-webapp\\MediaLibrary.Internet.Web\\appsettings.json";

        public TestDraftController()
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
            _logger = new Mock<ILogger<DraftController>>();

            _controller = new DraftController(_appSettings, _logger.Object);

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

        // Generates a new empty Draft with random RowKey
        [TestMethod]
        public void Get_CreateDraft()
        {
            var actionResult = _controller.CreateDraft();

            Assert.IsNotNull(actionResult);
            Assert.IsNotNull(actionResult.Result);
            Assert.IsNotNull(actionResult.Result.Value);
            Assert.IsNotNull(JsonConvert.DeserializeObject<dynamic>(JsonConvert.SerializeObject(actionResult.Result.Value))["rowKey"].ToString()); // Not empty rowKey
        }

        // Add an image to an existing draft (An existing draft rowkey needs to be inputted)
        [TestMethod]
        public async Task Post_AddImage()
        {
            var filepath1 = sampleImgPath;

            var stream = File.OpenRead(filepath1);
            IFormFile image = new FormFile(stream, 0, stream.Length, null, Path.GetFileName(stream.Name))
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };
            
            AddImageModel imageModel = new AddImageModel();
            imageModel.name = "Weekend at Marina Bay";
            imageModel.location = "Marina Bay Sands";
            imageModel.copyright = "URA";
            imageModel.file = image;

            await _controller.AddImage(imageModel, rowKey, _cancellationToken);
        }

        // Change the information of an image inside the draft
        [TestMethod]
        public async Task Put_UpdateImage()
        {
            DateTime curTime = DateTime.UtcNow;

            string field1 = "{\"Id\": \"db996580ef08c\",\"Key\": \"1\",\"Value\": \"2\"}";
            object field1Obj = JsonConvert.DeserializeObject<object>(field1);

            string field2 = "{\"Id\": \"d89f718dcb3b9\",\"Key\": \"2\",\"Value\": \"3\"}";
            object field2Obj = JsonConvert.DeserializeObject<object>(field2);

            ImageEntity imageEntity = new ImageEntity();
            imageEntity.PartitionKey = "draft";
            imageEntity.RowKey = imageKey;
            imageEntity.Timestamp = curTime;
            imageEntity.Id = imageKey;
            imageEntity.Name = "Weekend at Marina Bay";
            imageEntity.DateTaken = curTime;
            imageEntity.Location = "null";
            imageEntity.Tag = "some,tags,here";
            imageEntity.Caption = "Water at sea";
            imageEntity.Author = sampleEmail;
            imageEntity.UploadDate = curTime;
            imageEntity.FileURL = "https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage.jpg";
            imageEntity.ThumbnailURL = "https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage_thumb.jpg";
            imageEntity.Project = "Marina Bay on a weekend";
            imageEntity.Event = null;
            imageEntity.LocationName = "Marina Bay Sands";
            imageEntity.Copyright = "URA";
            imageEntity.AdditionalField = new List<object> { field1Obj, field2Obj };

            await _controller.UpdateImage(imageEntity, rowKey, imageKey);
        }

        // Delete an image from the draft
        [TestMethod]
        public async Task Delete_DeleteImage()
        {
            await _controller.DeleteImage(rowKey, imageKey);
        }

        // Delete a draft and all images associated with it
        [TestMethod]
        public async Task Delete_DeleteDraft()
        {
            await _controller.DeleteDraft(rowKey);
        }

        // Get a draft and its values
        [TestMethod]
        public async Task Get_GetDraft()
        {
            var result = await _controller.GetDraft(rowKey);
            var DraftResult = (Draft)result;

            Assert.IsNotNull(DraftResult);
            Assert.AreEqual(rowKey, DraftResult.RowKey);
            Assert.AreEqual("draft", DraftResult.PartitionKey);
            Assert.AreEqual(sampleEmail, DraftResult.Author);
        }

        [TestMethod]
        public void Post_GetMediaURL()
        {
            apiAsset imageURL = new apiAsset();
            imageURL.Name = "https://location.blob.core.windows.net/datatable/hw2EeMiCy7p5J2mh_someImage.jpg";

            var result = _controller.GetMediaURL(imageURL);

            Assert.IsNotNull(result);
            Assert.AreEqual("/api/assets/hw2EeMiCy7p5J2mh_someImage.jpg", result.ToString());
        }

        [TestMethod]
        public void Get_GetMediaFile_Success()
        {
            var result = _controller.GetMediaFile(mediaFile);

            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(FileStreamResult));
        }

        [TestMethod]
        public void Get_GetMediaFile_Fail()
        {
            var result = _controller.GetMediaFile("a_random_String");

            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }
    }
}
