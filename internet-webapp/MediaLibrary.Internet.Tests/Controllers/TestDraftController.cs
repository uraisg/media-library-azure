using MediaLibrary.Internet.Web;
using MediaLibrary.Internet.Web.Controllers;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace MediaLibrary.Internet.Tests.Controllers
{
    [TestClass]
    public class TestDraftController
    {
        private readonly Mock<IOptions<AppSettings>> _appSettings;
        private readonly Mock<ILogger<DraftController>> _logger;
        private readonly DraftController _controller;

        public TestDraftController()
        {
            _appSettings = new Mock<IOptions<AppSettings>>();
            _logger = new Mock<ILogger<DraftController>>();
            _controller = new DraftController(_appSettings.Object, _logger.Object);
        }

        [TestMethod]
        public void GetIndexPage()
        {
            // Act
            var actionResult = _controller.Index();

            //Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(ViewResult));
        }
    }
}
