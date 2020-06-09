using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using MediaUploadPortal.Web.Shared;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Extensions.Configuration;
using MimeMapping;
using Xunit;

namespace MediaUploadPortal.Functions.Tests
{
    public class UploadMediaTests
    {
        private readonly string _uploadfilepath = Path.Combine(Environment.CurrentDirectory, @"data\uploadimage.jpg");
        private readonly IConfiguration _config;

        public UploadMediaTests()
        {
            _config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.local.json")
                .Build();
        }


        [Fact]
        public async void UploadMedia_FunctionUrl_HttpPost()
        {
            var byteData = File.ReadAllBytes(_uploadfilepath);

            var content = new ByteArrayContent(byteData, 0, byteData.Length);
            content.Headers.ContentType = MediaTypeHeaderValue.Parse(MimeUtility.GetMimeMapping(_uploadfilepath));
            content.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                FileName = "uploadimage.jpg"
            };

            var form = new MultipartFormDataContent { content };

            var client = new HttpClient();
            var response = await client.PostAsync(_config[Constants.Settings.MediaUploadPostUrl], form);
            Assert.True(response.StatusCode == HttpStatusCode.OK);

            var json = await response.Content.ReadAsStringAsync();
            Assert.Contains("name", json);
        }

        [Fact]
        public async void UploadMedia_GenerateBlockBlobReference()
        {
            var byteData = File.ReadAllBytes(_uploadfilepath);
            
            var content = new ByteArrayContent(byteData, 0, byteData.Length);
            content.Headers.ContentType = MediaTypeHeaderValue.Parse(MimeUtility.GetMimeMapping(_uploadfilepath));
            content.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                FileName = "uploadimage.jpg"
            };

            var form = new MultipartFormDataContent { content };

            var multipartMemoryStreamProvider = new MultipartMemoryStreamProvider();
            await form.ReadAsMultipartAsync(multipartMemoryStreamProvider);

            var account = CloudStorageAccount.Parse(_config[Constants.Settings.MediaUploadStorageConnString]);
            var client = new CloudBlobClient(account.BlobStorageUri, account.Credentials);
            var cloudBlobContainer = client.GetContainerReference("photos");
            
            var cloudBlockBlob = UploadMedia.GenerateBlockBlobReference(cloudBlobContainer, multipartMemoryStreamProvider, "myIp", out HttpContent file);
            Assert.EndsWith(".jpg", cloudBlockBlob.Name);
            Assert.Equal(2, cloudBlockBlob.Metadata.Count);
            Assert.Equal("uploadimage.jpg", cloudBlockBlob.Metadata.First(x => x.Key == "origName").Value);
            Assert.Equal("myIp", cloudBlockBlob.Metadata.First(x => x.Key == "sourceIp").Value);
        }
    }
}
