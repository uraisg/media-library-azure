using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MediaLibrary.Intranet.Web.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace MediaLibrary.Intranet.Web.Controllers
{
    [ApiController]
    public class WebApiController : ControllerBase
    {
        private readonly AppSettings _appSettings;
        private readonly LinkGenerator _linkGenerator;

        public WebApiController(IOptions<AppSettings> appSettings, LinkGenerator linkGenerator)
        {
            _appSettings = appSettings.Value;
            _linkGenerator = linkGenerator;
        }

        [HttpGet("/api/assets/{name}", Name = nameof(GetMediaFile))]
        public async Task<IActionResult> GetMediaFile(string name)
        {
            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string containerName = _appSettings.MediaStorageImageContainer;

            BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString, containerName);
            BlobClient blobClient = blobContainerClient.GetBlobClient(name);

            try
            {
                BlobDownloadInfo download = await blobClient.DownloadAsync();
                return File(download.Content, download.ContentType);
            }
            catch (RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.BlobNotFound)
            {
                return NotFound();
            }
        }

        [HttpGet("/api/media/{id}", Name = nameof(GetMediaItem))]
        public async Task<IActionResult> GetMediaItem(string id)
        {
            string storageConnectionString = _appSettings.MediaStorageConnectionString;
            string containerName = _appSettings.MediaStorageIndexContainer;
            string fileName = id + ".json";

            BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString, containerName);
            BlobClient blobClient = blobContainerClient.GetBlobClient(fileName);

            try
            {
                BlobDownloadInfo download = await blobClient.DownloadAsync();
                return Ok(ExpandMediaItem(download.Content, id));
            }
            catch (RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.BlobNotFound)
            {
                return NotFound();
            }
        }

        private dynamic ExpandMediaItem(Stream mediaItemStream, string id)
        {
            dynamic result = JsonHelper.ReadJsonFromStream<ExpandoObject>(mediaItemStream);

            // Generate URL to self
            result.links = new Dictionary<string, object>()
            {
                { "self", _linkGenerator.GetUriByRouteValues(HttpContext, nameof(GetMediaItem), new { id = id }) }
            };

            return result;
        }
    }
}
