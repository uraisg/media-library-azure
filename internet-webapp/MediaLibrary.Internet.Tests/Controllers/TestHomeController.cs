using MediaLibrary.Internet.Web.Controllers;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace MediaLibrary.Internet.Tests.Controllers
{
    [TestClass]
    public class TestHomeController
    {
        private readonly HomeController _controller;

        public TestHomeController()
        {
            _controller = new HomeController();
        }

        [TestMethod]
        public void GetIndexPage()
        {
            // Act
            var actionResult = _controller.Index();

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult, typeof(ViewResult));
        }

        [TestMethod]
        public void GetErrorPage()
        {
            // Assert
            Assert.IsNull(_controller.ViewData.Model);
        }
    }
}
