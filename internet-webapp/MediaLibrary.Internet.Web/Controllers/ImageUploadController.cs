using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using MediaLibrary.Internet.Web.Models;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision.Models;
using Newtonsoft.Json;

namespace MediaLibrary.Internet.Web.Controllers
{
    public class ImageUploadController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("FileUpload")]
        public async Task<IActionResult> Index(IFormFile file)
        {
            if (file.Length > 0)
            {
                MemoryStream ms = new MemoryStream();
                file.CopyTo(ms);

                byte[] data = ms.ToArray();

                MemoryStream uploadImage = new MemoryStream(data);
                Stream extractMetadataImage = new MemoryStream(data);
                Stream CVImage = new MemoryStream(data);

                //upload to a separate container to retrieve image URL
                string imageURL = await ImageUploadToBlob(file.FileName, uploadImage);

                //extract image metadata
                IReadOnlyList<MetadataExtractor.Directory> directory = ImageMetadataReader.ReadMetadata(extractMetadataImage);
                //Get tagging from cognitive services
                List<string> tag = await GetCSComputerVisionTagAsync(CVImage);

                //create json for indexing
                ImageObj json = new ImageObj();
                json.Name = file.FileName;
                json.DateTaken = GetTimestamp(directory);
                json.Location = GetCoordinate(directory);
                json.Tag = tag;
                json.UploadDate = DateTime.UtcNow.AddHours(8).Date;
                json.FileURL = imageURL;
                string serialized = JsonConvert.SerializeObject(json);
                await IndexUploadToBlob(JsonConvert.SerializeObject(json));

                return Ok(json);
            }

            else
            {
                return NoContent();
            }
        }

        private static async Task<string> ImageUploadToBlob(string fileName, MemoryStream imageStream)
        {
            string containerName = "{image-container-name}";
            string storageConnectionString = "{storage-connection-string}";

            //create a blob container client
            BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString,containerName);

            //create a blob
            //use guid together with file name to avoid duplication
            string blobFileName = Guid.NewGuid().ToString() + "_" + fileName;
            BlobClient blobClient = blobContainerClient.GetBlobClient(blobFileName);

            await blobClient.UploadAsync(imageStream, true);

            //get url
            string url = blobClient.Uri.AbsoluteUri.ToString();
            return url;
        }

        private static DateTime GetTimestamp(IReadOnlyList<MetadataExtractor.Directory> directory)
        {
            var time = directory.OfType<ExifIfd0Directory>().FirstOrDefault();

            if (time != null)
            {
                if (time.TryGetDateTime(ExifDirectoryBase.TagDateTime, out var dateTime))
                {
                    return dateTime.Date;
                }
                else
                {
                    //error handling for timestamp not found, use current time
                    return DateTime.UtcNow.AddHours(8).Date;
                }
            }
            else
            {
                //error handling for timestamp not available, use current time
                return DateTime.UtcNow.AddHours(8).Date;
            }
        }

        private static CoordinateObj GetCoordinate(IReadOnlyList<MetadataExtractor.Directory> directory)
        {
            List<double> coordinate = new List<double>();
            CoordinateObj results = new CoordinateObj();
            results.type = "Point";
            var gps = directory.OfType<GpsDirectory>().FirstOrDefault();

            if (gps != null)
            {
                var location = gps.GetGeoLocation();

                coordinate.Add(location.Longitude);
                coordinate.Add(location.Latitude);
            }
            else
            {
                //add default coordinate for images without coordinate metadata
                coordinate.Add(1);
                coordinate.Add(1);
            }
            results.coordinates = coordinate;
            return results;
        }

        private static async Task<List<string>> GetCSComputerVisionTagAsync(Stream image)
        {
            //replace with computer vision key
            string subscriptionKey = "{computer-vision-key}";
            string endpoint = "{computer-vision-endpoint}";

            List<string> tagList = new List<string>();

            ComputerVisionClient client = new ComputerVisionClient(new ApiKeyServiceClientCredentials(subscriptionKey))
            {
                Endpoint = endpoint
            };

            List<VisualFeatureTypes> features = new List<VisualFeatureTypes>()
            { VisualFeatureTypes.Tags};

            ImageAnalysis results = await client.AnalyzeImageInStreamAsync(image, features);

            foreach (var tag in results.Tags)
            {
                tagList.Add(tag.Name);
            }
            return tagList;
        }

        private static async Task IndexUploadToBlob(string json)
        {
            string containerName = "{image-container-name}";
            string storageConnectionString = "{storage-connection-string}";

            //create a blob container client
            BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString, containerName);

            //create a blob
            string fileName = Guid.NewGuid().ToString() + ".json";
            BlobClient blobClient = blobContainerClient.GetBlobClient(fileName);

            //convert string to stream
            MemoryStream content = new MemoryStream();
            StreamWriter writer = new StreamWriter(content);
            writer.Write(json);
            writer.Flush();
            content.Position = 0;
            await blobClient.UploadAsync(content, true);
        }
    }
}
