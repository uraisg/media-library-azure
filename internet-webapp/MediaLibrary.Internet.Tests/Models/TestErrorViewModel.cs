using System;
using System.Collections.Generic;
using System.Text;
using MediaLibrary.Internet.Web.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MediaLibrary.Internet.Tests.Models
{
    [TestClass]
    public class TestErrorViewModel
    {
        [TestMethod]
        public void TestErrorViewModel_Without_Request()
        {
            ErrorViewModel obj = new ErrorViewModel();

            Assert.IsNotNull(obj);
            Assert.IsNull(obj.RequestId);
            Assert.IsFalse(obj.ShowRequestId);
        }

        [TestMethod]
        public void TestErrorViewModel_With_Request()
        {
            ErrorViewModel obj = new ErrorViewModel();
            obj.RequestId = "someId";

            Assert.IsNotNull(obj);
            Assert.AreEqual("someId", obj.RequestId);
            Assert.IsTrue(obj.ShowRequestId);
        }
    }
}
