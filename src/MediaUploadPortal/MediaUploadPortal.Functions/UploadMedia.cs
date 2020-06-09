using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace MediaUploadPortal.Functions
{
    public static class UploadMedia
    {
        [FunctionName(nameof(UploadMedia))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "media")] HttpRequestMessage req,
            ILogger logger,
            [Blob("%StorageFilePath%", FileAccess.Write, Connection = "StorageConnectionString")] CloudBlobContainer cloudBlobContainer)
        {
            logger.LogInformation($"{nameof(UploadMedia)} trigger function processed a request.");

            var multipartMemoryStreamProvider = new MultipartMemoryStreamProvider();
            await req.Content.ReadAsMultipartAsync(multipartMemoryStreamProvider);

            var xff = req.Headers.FirstOrDefault(x => x.Key == "X-Forwarded-For").Value.FirstOrDefault();
            var cloudBlockBlob = GenerateBlockBlobReference(cloudBlobContainer, multipartMemoryStreamProvider, xff, out HttpContent file, logger);

            logger.LogInformation(JsonConvert.SerializeObject(req.Headers, Formatting.Indented));
            logger.LogInformation(JsonConvert.SerializeObject(file.Headers, Formatting.Indented));

            await using (var fileStream = await file.ReadAsStreamAsync())
            {
                await cloudBlockBlob.UploadFromStreamAsync(fileStream);
            }

            return new OkObjectResult(new { name = cloudBlockBlob.Name });
        }

        public static CloudBlockBlob GenerateBlockBlobReference(CloudBlobContainer cloudBlobContainer,
            MultipartMemoryStreamProvider multipartMemoryStreamProvider, string xForwardedFor, out HttpContent file, ILogger logger = null)
        {
            file = multipartMemoryStreamProvider.Contents[0];

            var fileInfo = file.Headers.ContentDisposition;

            var origName = fileInfo.FileName.Replace("\"", string.Empty);
            var blobName = $"{Guid.NewGuid()}{Path.GetExtension(origName)}";
            blobName = blobName.Replace("\"", "");

            var cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(blobName);

            cloudBlockBlob.Properties.ContentType = file.Headers.ContentType.MediaType;
            cloudBlockBlob.Metadata.Add("origName", origName);
            if (!string.IsNullOrWhiteSpace(xForwardedFor))
                cloudBlockBlob.Metadata.Add("sourceIp", xForwardedFor);

            return cloudBlockBlob;
        }
    }
}
