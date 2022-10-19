using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Azure.Storage.Sas;
using MediaLibrary.Internet.Web.Common;
using MediaLibrary.Internet.Web.Models;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using ImageMagick;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision.Models;
using Newtonsoft.Json.Linq;
using Azure;

namespace MediaLibrary.Internet.Web.Controllers
{
    public class DraftController : Controller
    {
        private static readonly string DraftPartitionKey = "draft";
        private static readonly int ComputerVisionMaxFileSize = 4 * 1024 * 1024; // 4MB
        private static readonly int DefaultJpegQuality = 80;

        private readonly ILogger<DraftController> _logger;
        private readonly AppSettings _appSettings;

        private static BlobContainerClient _blobContainerClient = null;
        public DraftController(IOptions<AppSettings> appSettings, ILogger<DraftController> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        // Create a new draft (without images)
        [HttpPost("draft/create")]
        public async Task<JsonResult> CreateDraft()
        {
            string email = User.GetUserGraphEmail();

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogError("Could not get associated email address for user {UserName}", User.Identity.Name);

                return Json(new
                {
                    success = false,
                    errorMessage = "Could not find your email address."
                });
            }

            try {
                Draft newDraft = new Draft()
                {
                    UploadDate = DateTime.UtcNow.AddHours(8),
                    Author = email,
                    ImageEntities = ""
                };

                string tableName = _appSettings.TableName;
                string tableConnectionString = _appSettings.TableConnectionString;

                //initialize table client
                CloudStorageAccount storageAccount;
                storageAccount = CloudStorageAccount.Parse(tableConnectionString);
                CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
                CloudTable table = tableClient.GetTableReference(tableName);

                TableOperation insertOperation = TableOperation.Insert(newDraft);
                await table.ExecuteAsync(insertOperation);

                return Json(new
                {
                    success = true,
                    rowKey = insertOperation.Entity.RowKey.ToString()
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "New draft cannot be created. Please try again."
                });
            }
        }

        // Adding images to a draft
        [HttpPost("draft/{rowkey}/addImage")]
        public async Task<JsonResult> AddImage([FromForm]AddImageModel req, string rowKey, CancellationToken cancellationToken)
        {
            if (await CheckIfDraftIsEmpty_N_UserMatchDraft(rowKey, true) == false)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "The draft does not exist or the user logged in does not match the draft's author."
                });
            }

            _logger.LogInformation("{UserName} called file upload action", User.Identity.Name);

            var traceId = Activity.Current?.Id ?? HttpContext?.TraceIdentifier;
            using var scope = _logger.BeginScope("{UserName} {TraceID}", User.Identity.Name, traceId);

            string email = User.GetUserGraphEmail();

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogError("Could not get associated email address for user {UserName}", User.Identity.Name);

                return Json(new
                {
                    success = false,
                    errorMessage = "Could not find your email address."
                });
            }

            var file = req.file;

            cancellationToken.ThrowIfCancellationRequested();

            string untrustedFileName = Path.GetFileName(file.FileName);
            string encodedFileName = HttpUtility.HtmlEncode(untrustedFileName);

            _logger.LogInformation("Upload file name: {FileName}, size: {FileSize}", untrustedFileName, file.Length);

            // Check the file length
            if (file.Length == 0)
            {
                _logger.LogWarning("File {FileName} is empty.", untrustedFileName);

                ModelState.AddModelError(file.Name, $"File {encodedFileName} is empty.");

                return Json(new
                {
                    success = false,
                    errorMessage = "Failed to upload files as the file name is empty. Please correct the errors and try again."
                });
            }

            // Check the content type and file extension
            if (!IsValidImage(file))
            {
                _logger.LogWarning("File {FileName} has unsupported file extension.", untrustedFileName);

                ModelState.AddModelError(file.Name,
                    $"File {encodedFileName} has unsupported file extension. " +
                    "Support file extensions are .jpg, .jpeg, .png, .gif, .bmp, .heic");

                return Json(new
                {
                    success = false,
                    errorMessage = "Failed to upload files as the file extension is not supported. Please correct the errors and try again."
                });
            }

            try
            {
                byte[] data;
                using (var ms = new MemoryStream())
                {
                    await file.CopyToAsync(ms);
                    data = ms.ToArray();
                }

                // Convert HEIC files to JPEG since browsers are unable to display them
                var isHeic = false;
                if (Path.GetExtension(untrustedFileName).ToLowerInvariant() == ".heic")
                {
                    isHeic = true;
                    _logger.LogInformation("Converting {FileName} to JPEG", untrustedFileName);
                    data = ConvertToJpeg(data);
                    untrustedFileName = Path.GetFileNameWithoutExtension(untrustedFileName) + ".jpg";
                }

                //upload to a separate container to retrieve image URL
                //use unique id together with file name to avoid duplication
                string id = GenerateId();
                string blobFileName = id + "_" + untrustedFileName;
                string contentType = isHeic ? "image/jpeg" : file.ContentType;
                string imageURL;
                using (var uploadImage = new MemoryStream(data, false))
                {
                    imageURL = await ImageUploadToBlob(blobFileName, uploadImage, contentType, _appSettings);
                }

                //extract image metadata
                IReadOnlyList<MetadataExtractor.Directory> directories;
                using (var extractMetadataImage = new MemoryStream(data, false))
                {
                    directories = ImageMetadataReader.ReadMetadata(extractMetadataImage);
                }

                // Check image size as Cognitive Services can only accept images less than 4MB in size

                _logger.LogInformation("Starting FitImageForAnalysis");
                var watch = Stopwatch.StartNew();
                byte[] fitted = FitImageForAnalysis(data);
                watch.Stop();
                _logger.LogInformation("Finished FitImageForAnalysis after {Elapsed} ms", watch.ElapsedMilliseconds);

                ImageAnalysis computerVisionResult;
                string thumbnailFileName = Path.GetFileNameWithoutExtension(blobFileName) + "_thumb.jpg";
                string thumbnailURL;
                if (fitted != null)
                {
                    // Get tags and content-aware thumbnail from Cognitive Services
                    using var thumbnailStream = new MemoryStream(fitted, false);
                    using var imageStream = new MemoryStream(fitted, false);

                    thumbnailURL = await GenerateThumbnailAsync(thumbnailFileName, thumbnailStream, _appSettings);
                    computerVisionResult = await CallCSComputerVisionAsync(imageStream, _appSettings);
                }
                else
                {
                    // Unable to fit within size limit
                    // Skip calling Cognitive Services and return empty analysis results
                    using var thumbnailStream = new MemoryStream(data, false);
                    using var imageStream = new MemoryStream(data, false);

                    thumbnailURL = await GenerateThumbnailMagickAsync(thumbnailFileName, thumbnailStream, _appSettings);
                    computerVisionResult = new ImageAnalysis()
                    {
                        Tags = Array.Empty<ImageTag>(),
                        Description = new ImageDescriptionDetails(null, Array.Empty<ImageCaption>())
                    };
                }

                //create json for indexing
                ImageEntity json = new ImageEntity();
                json.PartitionKey = DraftPartitionKey;
                json.RowKey = id;
                json.Timestamp = DateTime.UtcNow.AddHours(8);
                json.Id = id;
                json.Name = untrustedFileName;
                json.DateTaken = GetTimestamp(directories, _appSettings.UploadTimeZone);
                json.Location = JsonConvert.SerializeObject(GetCoordinate(directories));
                json.Tag = GenerateTags(computerVisionResult);
                json.Caption = GenerateCaption(computerVisionResult);
                json.Author = email;
                json.UploadDate = TruncateMilliseconds(DateTime.UtcNow);
                json.FileURL = imageURL;
                json.ThumbnailURL = thumbnailURL;
                json.Project = req.name;
                json.LocationName = req.location;
                json.Copyright = req.copyright;
                json.AdditionalField = new List<object>();

                await ImageUploadToDraft(json, rowKey, _appSettings);

                return Json(new
                {
                    success = true
                });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "File {FileName} failed to upload.", untrustedFileName);

                ModelState.AddModelError(file.Name, $"File {encodedFileName} could not be uploaded.");

                return Json(new
                {
                    success = false,
                    errorMessage = "Failed to upload files. Please try again."
                });
            }
        }

        // Edit images in a draft
        [HttpPut("draft/{rowkey}/{image}")]
        public async Task<JsonResult> UpdateImage([FromBody] ImageEntity updateImageEntity, string rowkey, string image)
        {
            if (await CheckIfDraftIsEmpty_N_UserMatchDraft(rowkey, true) == false)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "The draft does not exist or the user logged in does not match the draft's author."
                });
            }

            try
            {
                string tableConnectionString = _appSettings.TableConnectionString;
                string tableName = _appSettings.TableName;

                //initialize table client
                CloudStorageAccount storageAccount;
                storageAccount = CloudStorageAccount.Parse(tableConnectionString);
                CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
                CloudTable table = tableClient.GetTableReference(tableName);

                TableOperation retrieveOperation = TableOperation.Retrieve<Draft>(
                    partitionKey: DraftPartitionKey,
                    rowkey: rowkey
                );

                var result = await table.ExecuteAsync(retrieveOperation);

                string resultJSON = JsonConvert.SerializeObject(result.Result);
                JObject json = JObject.Parse(resultJSON);
                JArray jsonArray = JArray.Parse(json["ImageEntities"].ToString());

                // Update value of image
                for (int i = 0; i < jsonArray.Count; i++)
                {
                    if (jsonArray[i]["Id"].ToString() == image)
                    {
                        JArray additionalField = new JArray();
                        foreach (var item in updateImageEntity.AdditionalField)
                        {
                            string jsonString = System.Text.Json.JsonSerializer.Serialize(item);
                            additionalField.Add(JToken.Parse(jsonString));
                        }
                        updateImageEntity.AdditionalField = additionalField.ToObject<List<object>>();

                        try
                        {
                            if (updateImageEntity.Tag.Substring(0, 1) == ",")
                            {
                                updateImageEntity.Tag = updateImageEntity.Tag.Substring(1);
                            }
                        }
                        catch (Exception e) { };

                        jsonArray.RemoveAt(i);
                        jsonArray.Add(JToken.FromObject(updateImageEntity));

                        break;
                    }
                }

                Draft updateDraft = new Draft()
                {
                    PartitionKey = DraftPartitionKey,
                    RowKey = rowkey,
                    UploadDate = DateTime.Parse(json["UploadDate"].ToString()),
                    Author = json["Author"].ToString(),
                    ImageEntities = jsonArray.ToString()
                };

                TableOperation updateOperation = TableOperation.InsertOrReplace(updateDraft);
                await table.ExecuteAsync(updateOperation);

                return Json(new
                {
                    success = true
                });
            }
            catch (Exception e)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "Failed to update files. Please try again."
                });
            }
        }

        // Remove images from a draft
        [HttpDelete("draft/{rowkey}/{image}")]
        public async Task<JsonResult> DeleteImage(string rowkey, string image)
        {
            if (await CheckIfDraftIsEmpty_N_UserMatchDraft(rowkey, true) == false)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "The draft does not exist or the user logged in does not match the draft's author."
                });
            }

            try
            {
                string tableConnectionString = _appSettings.TableConnectionString;
                string tableName = _appSettings.TableName;
                string containerName = _appSettings.MediaStorageContainer;
                string storageConnectionString = _appSettings.MediaStorageConnectionString;

                //initialize table client
                CloudStorageAccount storageAccount;
                storageAccount = CloudStorageAccount.Parse(tableConnectionString);
                CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
                CloudTable table = tableClient.GetTableReference(tableName);

                //create a blob container client
                BlobContainerClient blobContainerClient = new BlobContainerClient(storageConnectionString, containerName);

                TableOperation retrieveOperation = TableOperation.Retrieve<Draft>(
                    partitionKey: DraftPartitionKey,
                    rowkey: rowkey
                );

                var result = await table.ExecuteAsync(retrieveOperation);

                string resultJSON = JsonConvert.SerializeObject(result.Result);
                JObject json = JObject.Parse(resultJSON);
                JArray jsonArray = JArray.Parse(json["ImageEntities"].ToString());

                // Update value of image
                for (int i = 0; i < jsonArray.Count; i++)
                {
                    if (jsonArray[i]["Id"].ToString() == image)
                    {
                        var fileName = jsonArray[i]["Id"] + "_" + jsonArray[i]["Name"];

                        var thumbArray = jsonArray[i]["Name"].ToString().Split(".");
                        var thumbName = jsonArray[i]["Id"] + "_" + thumbArray[0];
                        var middleThumbArray = thumbArray.Skip(1).Take(thumbArray.Length - 2);
                        foreach (var thumb in middleThumbArray)
                        {
                            thumbName += "." + thumb;
                        }
                        thumbName += "_thumb.jpg";

                        var fileBlob = blobContainerClient.GetBlobClient(fileName);
                        var thumbBlob = blobContainerClient.GetBlobClient(thumbName);
                        await fileBlob.DeleteIfExistsAsync();
                        await thumbBlob.DeleteIfExistsAsync();
                        jsonArray.RemoveAt(i);
                    }
                }

                Draft updateDraft = new Draft()
                {
                    PartitionKey = DraftPartitionKey,
                    RowKey = rowkey,
                    UploadDate = DateTime.Parse(json["UploadDate"].ToString()),
                    Author = json["Author"].ToString(),
                    ImageEntities = jsonArray.ToString()
                };

                TableOperation updateOperation = TableOperation.InsertOrReplace(updateDraft);
                await table.ExecuteAsync(updateOperation);

                return Json(new
                {
                    success = true
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "Failed to delete files. Please try again."
                });
            }
        }

        // Delete a draft
        [HttpDelete("draft/{rowkey}")]
        public async Task<JsonResult> DeleteDraft(string rowkey)
        {
            if (await CheckIfDraftIsEmpty_N_UserMatchDraft(rowkey, true) == false)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "The draft does not exist or the user logged in does not match the draft's author."
                });
            }

            try
            {
                string tableConnectionString = _appSettings.TableConnectionString;
                string tableName = _appSettings.TableName;

                //initialize table client
                CloudStorageAccount storageAccount;
                storageAccount = CloudStorageAccount.Parse(tableConnectionString);
                CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
                CloudTable table = tableClient.GetTableReference(tableName);

                var tableEntity = new Draft
                {
                    PartitionKey = DraftPartitionKey,
                    RowKey = rowkey,
                    ETag = "*"
                };

                TableOperation deleteOperation = TableOperation.Delete(tableEntity);
                await table.ExecuteAsync(deleteOperation);

                return Json(new
                {
                    success = true
                });
            }
            catch (Exception e)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "Failed to delete draft. Please refresh the webpage."
                });
            }
        }

        // Get data inside a draft
        [HttpGet("draft/{rowkey}")]
        public async Task<JsonResult> GetDraft(string rowkey)
        {
            if (await CheckIfDraftIsEmpty_N_UserMatchDraft(rowkey, true) == false)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "The draft does not exist or the user logged in does not match the draft's author."
                });
            }

            try
            {
                string tableConnectionString = _appSettings.TableConnectionString;
                string tableName = _appSettings.TableName;

                //initialize table client
                CloudStorageAccount storageAccount;
                storageAccount = CloudStorageAccount.Parse(tableConnectionString);
                CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
                CloudTable table = tableClient.GetTableReference(tableName);

                TableOperation retrieveOperation = TableOperation.Retrieve<Draft>(
                    partitionKey: DraftPartitionKey,
                    rowkey: rowkey
                );

                TableResult result = await table.ExecuteAsync(retrieveOperation);

                return Json(new
                {
                    success = true,
                    result = result.Result
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    errorMessage = "Failed to get draft. Please try again."
                });
            }
        }

        [HttpPost("/api/convert")]
        public String GetMediaURL([FromBody] apiAsset name)
        {
            string encodedFileName = Path.GetFileName(name.Name);
            encodedFileName = Uri.UnescapeDataString(encodedFileName);
            encodedFileName = "/api/assets/" + encodedFileName;
            return encodedFileName;
        }

        [HttpGet("/api/assets/{name}", Name = nameof(GetMediaFile))]
        public async Task<IActionResult> GetMediaFile(string name)
        {
            if (_blobContainerClient == null)
            {
                if (!string.IsNullOrEmpty(_appSettings.MediaStorageConnectionString))
                {
                    _blobContainerClient = new BlobContainerClient(_appSettings.MediaStorageConnectionString, _appSettings.MediaStorageContainer);
                }
                else
                {
                    return NotFound();
                }
            }

            _logger.LogInformation("Getting blob with name {name}", name);

            BlobClient blobClient = _blobContainerClient.GetBlobClient(name);

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

        /// <summary>
        /// Check whether an image upload has image MIME type and contains an allowed file extension.
        /// </summary>
        /// <param name="file">The IFormFile to check.</param>
        /// <returns><c>true</c> if the IFormFile is valid; otherwise <c>false</c>.</returns>
        private static bool IsValidImage(IFormFile file)
        {
            // Validate extension
            var allowedExtensions = new string[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".heic" };
            string match = allowedExtensions.FirstOrDefault(ext => Path.GetExtension(file.FileName).ToLowerInvariant() == ext);
            bool fileExtensionValid = match != null;

            // Validate MIME type
            bool contentTypeValid = file.ContentType.StartsWith("image/");
            // HEIC files sometimes get uploaded as arbitrary media type
            if (match == ".heic" && file.ContentType == "application/octet-stream")
            {
                contentTypeValid = true;
            }

            return fileExtensionValid && contentTypeValid;
        }

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
        /// Convert the image to JPEG
        /// </summary>
        /// <returns>The convered image</returns>
        private byte[] ConvertToJpeg(byte[] data)
        {
            using var image = new MagickImage(data);
            image.Format = MagickFormat.Jpeg;
            image.Quality = DefaultJpegQuality;
            return image.ToByteArray();
        }

        /// <summary>
        /// Try to generate a smaller (in bytes) version of an image that is within the maximum size limit of Cognitive Services APIs.
        /// </summary>
        /// <param name="data">The byte array to read the image from.</param>
        /// <returns>The smaller image. Returns <c>null</c> if image cannot be fitted within size limit.</returns>
        private byte[] FitImageForAnalysis(byte[] data)
        {
            // Check if image should be reoriented
            using (var image = new MagickImage(data))
            {
                if (image.Orientation != OrientationType.Undefined && image.Orientation != OrientationType.TopLeft)
                {
                    _logger.LogInformation("Adjusting image orientation");
                    image.AutoOrient();
                    data = image.ToByteArray();
                }
            }

            // Check if file is oversized
            if (data.Length <= ComputerVisionMaxFileSize)
            {
                return data;
            }

            _logger.LogInformation("Image is oversized, resizing");

            byte[] data1;
            using (var image = new MagickImage(data))
            using (var ms = new MemoryStream())
            {
                long pixelCount = image.Width * image.Height;
                if (pixelCount > 20_000_000)
                {
                    var targetPercentage = new Percentage(Math.Round(Math.Sqrt(20_000_000d / pixelCount) * 100));
                    image.Scale(targetPercentage);
                    image.Strip();
                    image.Quality = DefaultJpegQuality;
                    image.Write(ms, MagickFormat.Jpeg);
                    data1 = ms.ToArray();
                    _logger.LogInformation("Scaling to ~20MP: {Width}x{Height}, {Size} bytes", image.Width, image.Height, data1.Length);
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
            byte[] data2 = null;
            for (var i = 1; i <= 10; i++)
            {
                var targetPercentage = new Percentage(Math.Round(Math.Pow(0.95, i) * 100));
                using (var image = new MagickImage(data1))
                using (var ms = new MemoryStream())
                {

                    image.Resize(targetPercentage);
                    image.Strip();
                    image.Quality = DefaultJpegQuality;
                    image.Write(ms, MagickFormat.Jpeg);
                    data2 = ms.ToArray();
                    _logger.LogInformation("Resizing: {Width}x{Height}, {Size} bytes", image.Width, image.Height, data2.Length);
                }

                if (data2.Length <= ComputerVisionMaxFileSize)
                {
                    return data2;
                }
            }

            // Fit quality to file size
            byte[] data3;
            for (var targetQuality = DefaultJpegQuality; targetQuality >= 50; targetQuality -= 5)
            {
                using (var image = new MagickImage(data2))
                using (var ms = new MemoryStream())
                {
                    image.Strip();
                    image.Quality = targetQuality;
                    image.Write(ms, MagickFormat.Jpeg);
                    data3 = ms.ToArray();
                    _logger.LogInformation("Reducing quality: q={Quality}, {Size} bytes", targetQuality, data3.Length);
                }

                if (data3.Length <= ComputerVisionMaxFileSize)
                {
                    return data3;
                }
            }

            // Give up
            _logger.LogInformation("Failed to fit image within size limit");
            return null;
        }

        private static DateTime GetTimestamp(IReadOnlyList<MetadataExtractor.Directory> directories, string uploadTimeZone)
        {
            var subIfdDirectory = directories.OfType<ExifSubIfdDirectory>().FirstOrDefault();
            if (subIfdDirectory != null && subIfdDirectory.TryGetDateTime(ExifDirectoryBase.TagDateTimeOriginal, out var dateTimeOriginal))
            {
                dateTimeOriginal = TruncateMilliseconds(dateTimeOriginal);
                try
                {
                    var tzi = TimeZoneInfo.FindSystemTimeZoneById(uploadTimeZone);
                    return TimeZoneInfo.ConvertTimeToUtc(dateTimeOriginal, tzi);
                }
                catch (Exception e) when (e is ArgumentNullException || e is TimeZoneNotFoundException)
                {
                    // Assume photo time zone is same as server local time zone
                    return TimeZoneInfo.ConvertTimeToUtc(dateTimeOriginal);
                }
            }

            //error handling for timestamp not available, use current time
            return TruncateMilliseconds(DateTime.UtcNow);
        }

        public static DateTime TruncateMilliseconds(DateTime dateTime)
        {
            return dateTime.AddTicks(-(dateTime.Ticks % TimeSpan.TicksPerSecond));
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
                image.Thumbnail(new MagickGeometry(width, height)
                {
                    IgnoreAspectRatio = true
                });
                image.Write(ms, MagickFormat.Jpeg);
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

        private static async Task ImageUploadToDraft(ImageEntity json, string draftKey, AppSettings appSettings)
        {
            string tableName = appSettings.TableName;
            string tableConnectionString = appSettings.TableConnectionString;

            //initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(tableConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            TableOperation retrieveOperation = TableOperation.Retrieve<Draft>(
                partitionKey: DraftPartitionKey,
                rowkey: draftKey
            );

            var result = await table.ExecuteAsync(retrieveOperation);

            string resultJSON = JsonConvert.SerializeObject(result.Result);

            JArray jsonArray = new JArray();

            try
            {
                JObject resultObject = JObject.Parse(resultJSON);
                if (resultObject["ImageEntities"].ToString() != "")
                {
                    jsonArray = JArray.Parse(resultObject["ImageEntities"].ToString());
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine("Issue with draft while trying to upload image to draft: " + e);
            }

            JObject imageJObject = JObject.FromObject(json);

            jsonArray.Add(imageJObject);

            Draft updateDraft = new Draft()
            {
                PartitionKey = DraftPartitionKey,
                RowKey = draftKey,
                UploadDate = DateTime.Parse(json.UploadDate.ToString()),
                Author = json.Author.ToString(),
                ImageEntities = jsonArray.ToString()
            };

            TableOperation updateOperation = TableOperation.InsertOrReplace(updateDraft);
            await table.ExecuteAsync(updateOperation);
        }

        private async Task<bool> CheckIfDraftIsEmpty_N_UserMatchDraft(string rowKey, bool checkUser)
        {
            string tableConnectionString = _appSettings.TableConnectionString;
            string tableName = _appSettings.TableName;

            //initialize table client
            CloudStorageAccount storageAccount;
            storageAccount = CloudStorageAccount.Parse(tableConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient(new TableClientConfiguration());
            CloudTable table = tableClient.GetTableReference(tableName);

            TableOperation retrieveOperation = TableOperation.Retrieve<Draft>(
                partitionKey: DraftPartitionKey,
                rowkey: rowKey
            );

            TableResult result = await table.ExecuteAsync(retrieveOperation);

            if (result.Result == null)
            {
                return false;
            }

            var obj = JsonConvert.DeserializeObject<Draft>(JsonConvert.SerializeObject(result.Result));

            if (checkUser)
            {

                if (string.IsNullOrEmpty(User.Identity.Name))
                {
                    return false;
                }

                if (User.Identity.Name != obj.Author)
                {
                    return false;
                }
            }

            return true;
        }

        public class apiAsset
        {
            public string Name { get; set; }
        }
    }
}
