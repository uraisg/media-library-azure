using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ImageMagick;
using MediaLibrary.Internet.Web.Common;
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
        private static readonly int ComputerVisionMaxFileSize = 4 * 1024 * 1024; // 4MB
        private static readonly int DefaultJpegQuality = 80;

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

            string email = User.GetUserGraphEmail();

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogError($"Could not get associated email address for user {User.Identity.Name}");

                TempData["Alert.Type"] = "danger";
                TempData["Alert.Message"] = "Could not find your email address.";
                return View("~/Views/Home/Index.cshtml");
            }

            // Uploaded files
            List<IFormFile> files = model.File;

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
                    byte[] data;
                    using (var ms = new MemoryStream())
                    {
                        await file.CopyToAsync(ms);
                        data = ms.ToArray();
                    }

                    //upload to a separate container to retrieve image URL
                    //use unique id together with file name to avoid duplication
                    string id = GenerateId();
                    string blobFileName = id + "_" + untrustedFileName;
                    string imageURL;
                    using (var uploadImage = new MemoryStream(data, false))
                    {
                        imageURL = await ImageUploadToBlob(blobFileName, uploadImage, file.ContentType, _appSettings);
                    }

                    //extract image metadata
                    IReadOnlyList<MetadataExtractor.Directory> directories;
                    using (var extractMetadataImage = new MemoryStream(data, false))
                    {
                        directories = ImageMetadataReader.ReadMetadata(extractMetadataImage);
                    }

                    // Check image size as Cognitive Services can only accept images less than 4MB in size
                    byte[] fitted = FitImageForAnalysis(data);

                    ImageAnalysis computerVisionResult;
                    string thumbnailFileName = Path.GetFileNameWithoutExtension(blobFileName) + "_thumb.jpg";
                    string thumbnailURL;
                    if (fitted != null)
                    {
                        // Get tags and content-aware thumbnail from Cognitive Services
                        using (var thumbnailStream = new MemoryStream(fitted, false))
                        using (var imageStream = new MemoryStream(fitted, false))
                        {
                            thumbnailURL = await GenerateThumbnailAsync(thumbnailFileName, thumbnailStream, _appSettings);
                            computerVisionResult = await CallCSComputerVisionAsync(imageStream, _appSettings);
                        }
                    }
                    else
                    {
                        // Unable to fit within size limit
                        // Skip calling Cognitive Services and return empty analysis results
                        using (var thumbnailStream = new MemoryStream(data, false))
                        using (var imageStream = new MemoryStream(data, false))
                        {
                            thumbnailURL = await GenerateThumbnailMagickAsync(thumbnailFileName, thumbnailStream, _appSettings);
                            computerVisionResult = new ImageAnalysis()
                            {
                                Tags = Array.Empty<ImageTag>(),
                                Description = new ImageDescriptionDetails(null, Array.Empty<ImageCaption>())
                            };
                        }
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
            TempData["Alert.Message"] = "Your items have been uploaded successfully, and will be copied to intranet in 10 minutes.";
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

        /// <summary>
        /// Try to generate a smaller (in bytes) version of an image that is within the maximum size limit of Cognitive Services APIs.
        /// </summary>
        /// <param name="data">The byte array to read the image from.</param>
        /// <returns>The smaller image. Returns <c>null</c> if image cannot be fitted within size limit.</returns>
        private byte[] FitImageForAnalysis(byte[] data)
        {
            // Check if file is oversized
            if (data.Length <= ComputerVisionMaxFileSize)
            {
                return data;
            }

            _logger.LogInformation($"Image is oversized, resizing");


            byte[] data1;
            using (var image = new MagickImage(data))
            using (var ms = new MemoryStream())
            {
                long pixelCount = image.Width * image.Height;
                if (pixelCount > 25_000_000)
                {
                    var targetPercentage = new Percentage(Math.Round(Math.Sqrt(25_000_000d / pixelCount) * 100));
                    image.Resize(targetPercentage);
                    image.Strip();
                    image.Quality = DefaultJpegQuality;
                    image.Write(ms);
                    data1 = ms.ToArray();
                    _logger.LogInformation($"Scaling to ~25MP: {image.Width}x{image.Height}, {data1.Length} bytes");
                }
                else
                {
                    data1 = data;
                }
            }

            if (data1.Length <= ComputerVisionMaxFileSize)
            {
                return data1;
            }

            // Fit dimensions to file size
            byte[] data2 = data1;
            for (var i = 1; i <= 10; i++)
            {
                var targetPercentage = new Percentage(Math.Round(Math.Pow(0.95, i) * 100));
                using (var image = new MagickImage(data1))
                using (var ms = new MemoryStream())
                {

                    image.Resize(targetPercentage);
                    image.Strip();
                    image.Quality = DefaultJpegQuality;
                    image.Write(ms);
                    data2 = ms.ToArray();
                    _logger.LogInformation($"Resizing: {image.Width}x{image.Height}, {data2.Length} bytes");
                }

                if (data2.Length <= ComputerVisionMaxFileSize)
                {
                    return data2;
                }
            }

            // Fit quality to file size
            byte[] data3 = data2;
            for (var targetQuality = DefaultJpegQuality; targetQuality >= 50; targetQuality -= 5)
            {
                using (var image = new MagickImage(data1))
                using (var ms = new MemoryStream())
                {
                    image.Strip();
                    image.Quality = targetQuality;
                    image.Write(ms);
                    data3 = ms.ToArray();
                    _logger.LogInformation($"Reducing quality: q={targetQuality}, {data3.Length} bytes");
                }

                if (data3.Length <= ComputerVisionMaxFileSize)
                {
                    return data3;
                }
            }

            // Give up
            _logger.LogInformation($"Failed to fit image within size limit");
            return null;
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

        /// <summary>
        /// Generate a thumbnail image using IM and upload to blob storage.
        /// </summary>
        /// <returns>The URL for the thumbnail image.</returns>
        private static async Task<string> GenerateThumbnailMagickAsync(string filename, Stream imageStream, AppSettings appSettings)
        {
            int width = int.Parse(appSettings.ThumbWidth);
            int height = int.Parse(appSettings.ThumbHeight);

            byte[] thumbnailImageData;
            using (var image = new MagickImage(imageStream))
            using (var ms = new MemoryStream())
            {
                image.Strip();
                image.Resize(new MagickGeometry(width, height)
                {
                    IgnoreAspectRatio = true
                });
                image.Write(ms);
                thumbnailImageData = ms.ToArray();
            }

            var result = new MemoryStream(thumbnailImageData);
            string bloburl = await ImageUploadToBlob(filename, result, "image/jpeg", appSettings);
            return bloburl;
        }

        /// <summary>
        /// Generate a thumbnail image using Cognitive Services and upload to blob storage.
        /// </summary>
        /// <returns>The URL for the thumbnail image.</returns>
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
