using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ImageMagick;
using MediaLibrary.Internet.Web.Models;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision.Models;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace MediaLibrary.Internet.Web.Controllers
{
    [Authorize]
    public class ImageUploadController : Controller
    {
        private static readonly string TransferPartitionKey = "transfer";

        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;

        public ImageUploadController(IOptions<AppSettings> appSettings, ILogger<ImageUploadController> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("FileUpload")]
        public async Task<IActionResult> Index(UploadFormModel model)
        {
            if (!ModelState.IsValid)
            {
                TempData["Alert.Type"] = "danger";
                TempData["Alert.Message"] = "Failed to upload files. Please correct the errors and try again.";
                return View("~/Views/Home/Index.cshtml");
            }

            List<IFormFile> files = model.File;

            //get current user claims
            ClaimsPrincipal cp = this.User;
            var claims = cp.Claims;
            string email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            foreach (IFormFile file in files)
            {
                string untrustedFileName = Path.GetFileName(file.FileName);
                string encodedFileName = HttpUtility.HtmlEncode(untrustedFileName);

                _logger.LogInformation($"Upload file name: {untrustedFileName}, size: {file.Length}");

                // Check the file length
                if (file.Length == 0)
                {
                    _logger.LogWarning($"File {untrustedFileName} is empty.");

                    ModelState.AddModelError(file.Name, $"File {encodedFileName} is empty.");
                    TempData["Alert.Type"] = "danger";
                    TempData["Alert.Message"] = "Failed to upload files. Please correct the errors and try again.";
                    return View("~/Views/Home/Index.cshtml");
                }

                // Check the content type and file extension
                if (!IsValidImage(file))
                {
                    _logger.LogWarning($"File {untrustedFileName} does not have allowed file extension.");

                    ModelState.AddModelError(file.Name,
                        $"File {encodedFileName} does not have allowed file extension. " +
                        "Allowed file extensions are .jpg, .jpeg, .png, .gif, .bmp");
                    TempData["Alert.Type"] = "danger";
                    TempData["Alert.Message"] = "Failed to upload files. Please correct the errors and try again.";
                    return View("~/Views/Home/Index.cshtml");
                }

                try
                {

                    MemoryStream ms = new MemoryStream();
                    file.CopyTo(ms);

                    byte[] data = ms.ToArray();

                    MemoryStream uploadImage = new MemoryStream(data);
                    Stream extractMetadataImage = new MemoryStream(data);
                    Stream imageStream = new MemoryStream(data);
                    Stream thumbnailStream = new MemoryStream(data);

                    //upload to a separate container to retrieve image URL
                    //use unique id together with file name to avoid duplication
                    string id = GenerateId();
                    string blobFileName = id + "_" + untrustedFileName;
                    string imageURL = await ImageUploadToBlob(blobFileName, uploadImage, file.ContentType, _appSettings);

                    //extract image metadata
                    IReadOnlyList<MetadataExtractor.Directory> directories = ImageMetadataReader.ReadMetadata(extractMetadataImage);

                    //Get tagging from cognitive services
                    //Cognitive services can only take in file size less than 4MB
                    //Do a check on filesize to get tags and generate thumbnail
                    ImageAnalysis computerVisionResult;
                    string thumbnailFileName = Path.GetFileNameWithoutExtension(blobFileName) + "_thumb.jpg";
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
                                    _logger.LogInformation($"Compressing: {data.Length}");
                                    //prevent memory leak
                                    memStream.SetLength(0);
                                }
                            }

                            _logger.LogInformation($"Final: {data.Length}");
                            Stream thumbStream = new MemoryStream(data);
                            thumbnailURL = await GenerateThumbnailAsync(thumbnailFileName, thumbStream, _appSettings);

                            Stream tagStream = new MemoryStream(data);
                            computerVisionResult = await CallCSComputerVisionAsync(tagStream, _appSettings);
                        }
                    }
                    else
                    {
                        thumbnailURL = await GenerateThumbnailAsync(thumbnailFileName, thumbnailStream, _appSettings);
                        computerVisionResult = await CallCSComputerVisionAsync(imageStream, _appSettings);
                    }

                    //create json for indexing
                    ImageEntity json = new ImageEntity();
                    json.PartitionKey = TransferPartitionKey;
                    json.RowKey = id;
                    json.Id = id;
                    json.Name = file.FileName;
                    json.DateTaken = GetTimestamp(directories);
                    json.Location = JsonConvert.SerializeObject(GetCoordinate(directories));
                    json.Tag = GenerateTags(computerVisionResult);
                    json.Caption = GenerateCaption(computerVisionResult);
                    json.Author = email;
                    json.UploadDate = DateTime.UtcNow.AddHours(8).Date;
                    json.FileURL = imageURL;
                    json.ThumbnailURL = thumbnailURL;
                    json.Project = model.Project;
                    json.Event = model.Event;
                    json.LocationName = model.LocationText;
                    json.Copyright = model.Copyright;

                    await IndexUploadToTable(json, _appSettings);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, $"File {untrustedFileName} failed to upload.");

                    ModelState.AddModelError(file.Name, $"File {encodedFileName} could not be uploaded.");
                    TempData["Alert.Type"] = "danger";
                    TempData["Alert.Message"] = "Failed to upload files. Please correct the errors and try again.";
                    return View("~/Views/Home/Index.cshtml");
                }
            }
            ModelState.Clear();
            TempData["Alert.Type"] = "success";
            TempData["Alert.Message"] = "Items have been uploaded sucessfully";
            return View("~/Views/Home/Index.cshtml");
        }

        /// <summary>
        /// Check whether an image upload has image MIME type and contains an allowed file extension.
        /// </summary>
        /// <param name="file">The IFormFile to check.</param>
        /// <returns><c>true</c> if the IFormFile is valid; otherwise <c>false</c>.</returns>
        private static bool IsValidImage(IFormFile file)
        {
            if (!file.ContentType.Contains("image"))
            {
                return false;
            }

            string[] allowedExtensions = new string[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };

            return allowedExtensions.Any(item => file.FileName.EndsWith(item, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Generate a new ID (random 16 character string using Base58 alphabet).
        /// </summary>
        /// <returns>A new ID.</returns>
        private static string GenerateId()
        {
            var base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            return Nanoid.Nanoid.Generate(base58Alphabet, 16);
        }

        private static async Task<string> ImageUploadToBlob(string fileName, MemoryStream imageStream, string contentType, AppSettings appSettings)
        {
            var containerName = appSettings.MediaStorageContainer;
            var storageConnectionString = appSettings.MediaStorageConnectionString;

            //create a blob container client
            BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString, containerName);

            //create a blob
            BlobClient blobClient = blobContainerClient.GetBlobClient(fileName);
            var blobUploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                }
            };

            await blobClient.UploadAsync(imageStream, blobUploadOptions);

            //get url (without query string as it will contain SAS token if used in connection string)
            string url = blobClient.Uri.GetLeftPart(UriPartial.Path);
            return url;
        }

        private static DateTime GetTimestamp(IReadOnlyList<MetadataExtractor.Directory> directories)
        {
            var time = directories.OfType<ExifIfd0Directory>().FirstOrDefault();

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

        /// <summary>
        /// Get the geographical coordinates where the image was taken from metadata.
        /// </summary>
        /// <param name="directories">List of image metadata directories</param>
        /// <returns>The coordinates found in the metadata, if possible, otherwise null</returns>
        private static CoordinateObj GetCoordinate(IReadOnlyList<MetadataExtractor.Directory> directories)
        {
            var coordinate = new List<double>();
            var gps = directories.OfType<GpsDirectory>().FirstOrDefault();

            if (gps != null && gps.TagCount > 0)
            {
                var location = gps.GetGeoLocation();

                if (location != null && !location.IsZero)
                {
                    try
                    {
                        coordinate.Add(location.Longitude);
                        coordinate.Add(location.Latitude);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                }
            }

            // Make sure that we have valid coordinates, otherwise return null
            if (coordinate.Count != 2)
            {
                return null;
            }
            return new CoordinateObj
            {
                type = "Point",
                coordinates = coordinate
            };
        }

        private static async Task<string> GenerateThumbnailAsync(string filename, Stream image, AppSettings appSettings)
        {
            string subscriptionKey = appSettings.ComputerVisionApiKey;
            string endpoint = appSettings.ComputerVisionEndpoint;
            string width = appSettings.ThumbWidth;
            string height = appSettings.ThumbHeight;

            string uriBase = endpoint + "/vision/v3.0/generateThumbnail";

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
            string bloburl = await ImageUploadToBlob(filename, result, "image/jpeg", appSettings);
            return bloburl;
        }

        private static async Task<ImageAnalysis> CallCSComputerVisionAsync(Stream image, AppSettings appSettings)
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
            { VisualFeatureTypes.Tags, VisualFeatureTypes.Description};

            ImageAnalysis results = await client.AnalyzeImageInStreamAsync(image, features);

            return results;
        }

        private static string GenerateTags(ImageAnalysis results)
        {
            List<string> tagList = new List<string>();

            foreach (var tag in results.Tags)
            {
                if (tag.Confidence > 0.7)
                {
                    tagList.Add(tag.Name);
                }
            }

            return string.Join(",", tagList);
        }

        private static string GenerateCaption(ImageAnalysis results)
        {
            double bestScore = 0;
            string bestCaption = "";
            foreach (var caption in results.Description.Captions)
            {
                if (caption.Confidence > bestScore)
                {
                    bestScore = caption.Confidence;
                    bestCaption = caption.Text;
                }
            }

            return bestCaption;
        }

        private static async Task IndexUploadToTable(ImageEntity json, AppSettings appSettings)
        {
            string tableName = appSettings.TableName;
            string tableConnectionString = appSettings.TableConnectionString;

            //initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(tableConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            TableOperation insertOperation = TableOperation.Insert(json);
            TableResult result = await table.ExecuteAsync(insertOperation);
        }
    }
}
