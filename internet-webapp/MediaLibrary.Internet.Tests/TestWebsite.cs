using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using MediaLibrary.Internet.Web;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Xunit;

namespace MediaLibrary.Internet.Tests
{
    public class TestWebsite
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;

        public TestWebsite()
        {
            _server = new TestServer(new WebHostBuilder().UseStartup<Startup>());
            _client = _server.CreateClient();
        }


        // Configuration/HostingExtensions.cs
        // System.NullReferenceException : Object reference not set to an instance of an object.
        [Fact]
        public async Task ReturnHelloWorld()
        {
            Debug.WriteLine("RUN");
            // Act
            var response = await _client.GetAsync("/");
            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync();

            Debug.WriteLine(responseString);
            // Assert
            Assert.Equal("Hello World!", responseString);
        }
    }
}
