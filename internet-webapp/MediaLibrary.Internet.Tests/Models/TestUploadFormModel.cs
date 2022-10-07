using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using MediaLibrary.Internet.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MediaLibrary.Internet.Tests.Models
{
    [TestClass]
    public class TestUploadFormModel
    {
        [TestMethod]
        public void TestUploadFormModelObj()
        {
            List<IFormFile> files = new List<IFormFile>();
            var filepath1 = "C:\\Users\\nianc\\Documents\\VS\\media-library-azure\\internet-webapp\\MediaLibrary.Internet.Tests\\Models\\images\\1.jpg";
            var filepath2 = "C:\\Users\\nianc\\Documents\\VS\\media-library-azure\\internet-webapp\\MediaLibrary.Internet.Tests\\Models\\images\\2.jpg";
            var filepath3 = "C:\\Users\\nianc\\Documents\\VS\\media-library-azure\\internet-webapp\\MediaLibrary.Internet.Tests\\Models\\images\\3.jpg";

            using (var stream = File.OpenRead(filepath1))
            {
                var model = new FormFile(stream, 0, stream.Length, null, Path.GetFileName(stream.Name));
                files.Add(model);
            }

            using (var stream = File.OpenRead(filepath2))
            {
                var model = new FormFile(stream, 0, stream.Length, null, Path.GetFileName(stream.Name));
                files.Add(model);
            }

            using(var stream = File.OpenRead(filepath3))
            {
                var model = new FormFile(stream, 0, stream.Length, null, Path.GetFileName(stream.Name));
                files.Add(model);
            }

            UploadFormModel obj = new UploadFormModel();
            obj.File = files;
            obj.Project = "Weekend at Marina Bay";
            obj.LocationText = "Marina Bay Sands";
            obj.Copyright = "URA";

            Assert.IsNotNull(obj);

            Assert.AreEqual(3, obj.File.Count);
            Assert.AreEqual(files, obj.File);
            Assert.AreEqual(files[0], obj.File[0]);
            Assert.AreEqual(files[1], obj.File[1]);
            Assert.AreEqual(files[2], obj.File[2]);

            Assert.AreEqual("Weekend at Marina Bay", obj.Project);
            Assert.AreEqual("Marina Bay Sands", obj.LocationText);
            Assert.AreEqual("URA", obj.Copyright);
        }
    }
}
