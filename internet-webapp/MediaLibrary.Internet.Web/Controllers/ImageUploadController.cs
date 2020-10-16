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
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision.Models;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Azure.Cosmos.Table;
using System.Net.Http;
using System.Net.Http.Headers;
using ImageMagick;

namespace MediaLibrary.Internet.Web.Controllers
{
    [Authorize]
    public class ImageUploadController : Controller
    {
        private readonly AppSettings _appSettings;

        public ImageUploadController(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("FileUpload")]
        public async Task<IActionResult> Index(UploadFormModel model)
        {
            List<IFormFile> files = model.File;

            if(files.Count > 0)
            {
                foreach (IFormFile file in files)
                {
                    if (file.Length > 0)
                    {
                        Console.WriteLine($"Uploaded file size: {file.Length}");
                        MemoryStream ms = new MemoryStream();
                        file.CopyTo(ms);

                        byte[] data = ms.ToArray();

                        MemoryStream uploadImage = new MemoryStream(data);
                        Stream extractMetadataImage = new MemoryStream(data);
                        Stream imageStream = new MemoryStream(data);
                        Stream thumbnailStream = new MemoryStream(data);

                        //upload to a separate container to retrieve image URL
                        string imageURL = await ImageUploadToBlob(file.FileName, uploadImage, _appSettings);

                        //extract image metadata
                        IReadOnlyList<MetadataExtractor.Directory> directory = ImageMetadataReader.ReadMetadata(extractMetadataImage);

                        //Get tagging from cognitive services
                        //Cognitive services can only take in file size less than 4MB
                        //Do a check on filesize to get tags and generate thumbnail
                        List<string> tag = new List<string>();
                        string thumbnailURL = string.Empty;
                        int quality = 75;

                        if (data.Length > 4000000)
                        {
                            using (var memStream = new MemoryStream())
                            {
                                while (data.Length > 4000000)
                                {
                                    using (var image = new MagickImage(data))
                                    {
                                        image.Quality = quality;
                                        image.Write(memStream);
                                        data = memStream.ToArray();
                                        Console.WriteLine($"Compressing: {data.Length}");
                                        //prevent memory leak
                                        memStream.SetLength(0);
                                    }
                                }

                                Console.WriteLine($"Final: {data.Length}");
                                Stream thumbStream = new MemoryStream(data);
                                thumbnailURL = await GenerateThumbnailAsync(file.FileName, thumbStream, _appSettings);

                                Stream tagStream = new MemoryStream(data);
                                tag = await GetCSComputerVisionTagAsync(tagStream, _appSettings);
                            }
                        }
                        else
                        {
                            thumbnailURL = await GenerateThumbnailAsync(file.FileName, thumbnailStream, _appSettings);
                            tag = await GetCSComputerVisionTagAsync(imageStream, _appSettings);
                        }
                        
                        //create json for indexing
                        ImageEntity json = new ImageEntity();
                        json.Name = file.FileName;
                        json.DateTaken = GetTimestamp(directory);
                        json.Location = JsonConvert.SerializeObject(GetCoordinate(directory));
                        json.Tag = string.Join(",", tag);
                        json.UploadDate = DateTime.UtcNow.AddHours(8).Date;
                        json.FileURL = imageURL;
                        json.ThumbnailURL = thumbnailURL;
                        json.Project = model.Project;
                        json.Event = model.Event;
                        json.LocationName = model.LocationText;
                        json.Copyright = model.Copyright;
                        string serialized = JsonConvert.SerializeObject(json);
                        await IndexUploadToTable(json, _appSettings);
                    }
                    else
                    {
                        return NoContent();
                    }
                }
                ModelState.Clear();
                TempData["Alert.Type"] = "success";
                TempData["Alert.Message"] = "Items have been uploaded sucessfully";
                return View("~/Views/Home/Index.cshtml");
            }
            else
            {
                return NoContent();
            }
        }

        private static async Task<string> ImageUploadToBlob(string fileName, MemoryStream imageStream, AppSettings appSettings)
        {
            var containerName = appSettings.MediaStorageContainer;
            var storageConnectionString = appSettings.MediaStorageConnectionString;

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

            if (gps != null && gps.TagCount > 0)
            {
                var location = gps.GetGeoLocation();
                
                if(location != null)
                {
                    try
                    {
                        coordinate.Add(location.Longitude);
                        coordinate.Add(location.Latitude);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        //add default coordinate for images if metadata cant be extracted
                        coordinate.Add(103.819836);
                        coordinate.Add(1.352083);
                    }
                }
                else
                {
                    //add default coordinate for images if metadata cant be extracted
                    coordinate.Add(103.819836);
                    coordinate.Add(1.352083);
                }

            }
            else
            {
                //add default coordinate for images without coordinate metadata
                coordinate.Add(103.819836);
                coordinate.Add(1.352083);
            }
            results.coordinates = coordinate;
            return results;
        }

        private static async Task<string> GenerateThumbnailAsync(string filename, Stream image, AppSettings appSettings)
        {
            string subscriptionKey = appSettings.ComputerVisionApiKey;
            string endpoint = appSettings.ComputerVisionEndpoint;
            string width = appSettings.ThumbWidth;
            string height = appSettings.ThumbHeight;
            
            string uriBase = endpoint + "vision/v3.0/generateThumbnail";

                HttpClient client = new HttpClient();
                client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", subscriptionKey);
                string requestParameters = "width=" + width + "&height=" + height + "&smartCropping=true";
                string uri = uriBase + "?" + requestParameters;

                HttpResponseMessage response;
                byte[] byteData;
                using (var streamReader = new MemoryStream())
                {
                    image.CopyTo(streamReader);
                    byteData = streamReader.ToArray();
                }

                using (ByteArrayContent content = new ByteArrayContent(byteData))
                {
                    content.Headers.ContentType =
                        new MediaTypeHeaderValue("application/octet-stream");
                    response = await client.PostAsync(uri, content);
                }

            byte[] thumbnailImageData =
                    await response.Content.ReadAsByteArrayAsync();
            var result = new MemoryStream(thumbnailImageData);
            string bloburl = await ImageUploadToBlob("thumb_" + filename, result, appSettings);
            return bloburl;
        }

        private static async Task<List<string>> GetCSComputerVisionTagAsync(Stream image, AppSettings appSettings)
        {
            //replace with computer vision key
            string subscriptionKey = appSettings.ComputerVisionApiKey;
            string endpoint = appSettings.ComputerVisionEndpoint;

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
                if(tag.Confidence > 0.7)
                {
                    tagList.Add(tag.Name);
                } 
            }
            return tagList;
        }

        private static async Task IndexUploadToTable(ImageEntity json, AppSettings appSettings)
        {
            string tableName = appSettings.MediaStorageTable;
            string storageConnectionString = appSettings.MediaStorageConnectionString;

            //initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(storageConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            TableOperation insertOperation = TableOperation.Insert(json);
            TableResult result = await table.ExecuteAsync(insertOperation);
        }
    }
}
