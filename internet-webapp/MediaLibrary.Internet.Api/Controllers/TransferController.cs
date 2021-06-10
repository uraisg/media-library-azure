using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;

namespace MediaLibrary.Internet.Api.Controllers
{
    [Route("/api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class TransferController : ControllerBase
    {
        private static readonly string[] Tags = new[]
        {
            "mountain", "sky", "water", "lake", "outdoor", "valley", "nature", "ship", "landscape",
            "outdoor", "building", "person", "human face", "clothing", "smile", "woman", "lighthouse", "building"
        };

        private static readonly string[] LocationNames = new[]
{
            "Admiralty", "Botanic Gardens", "Bugis", "Chinatown", "Clarke Quay", "East Cost Park", "Fort Canning Park",
            "Gardens by the Bay", "Jurong Town Hall", "Kampung Admiralty", "Marina Bay Sands", "Merlion Park",
            "Northpoint City", "Orchard Road", "Pioneer", "Raffles City", "Raffles Hotel", "Sembawang", "Senoko",
            "Sentosa Island", "Singapore Zoo", "Yishun"
        };

        private readonly AppSettings _appSettings;
        private readonly ILogger<TransferController> _logger;

        public TransferController(IOptions<AppSettings> appSettings, ILogger<TransferController> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        [HttpGet("mediaItems")]
        [SwaggerOperation(
            Summary = "Return list of media items that are pending transfer",
            OperationId = "GetMediaItems"
        )]
        [Produces("application/json")]
        [SwaggerResponse(StatusCodes.Status200OK, "Successful operation", typeof(IEnumerable<ImageEntity>))]
        public async Task<IActionResult> GetAllAsync()
        {
            _logger.LogInformation("Listing all transfer items");

            var rng = new Random();
            return Ok(Enumerable.Range(1, 20).Select(index => new ImageEntity
            {
                Id = GenerateId(),
                Name = $"image{index}.jpg",
                DateTaken = DateTime.Now.AddDays(rng.Next(-5000, -50)),
                Location = @"{""type"":""Point"",""coordinates"":[103.82281141666667,1.30259975]}",
                Tag = string.Join(",", Tags.OrderBy(x => rng.Next()).Take(rng.Next(Tags.Length))),
                Caption = "Media caption",
                Author = "userid@ura.gov.sg",
                UploadDate = DateTime.Now.AddDays(rng.Next(-50, 0)),
                FileURL = $"https://abc.blob.core.windows.net/media-upload/image{index}.jpg",
                ThumbnailURL = $"https://abc.blob.core.windows.net/media-upload/image{index}_thumb.jpg",
                Project = null,
                Event = null,
                LocationName = LocationNames[rng.Next(LocationNames.Length)],
                Copyright = "Copyright URA"
            })
            .ToArray());
        }

        [HttpDelete("mediaItems/{id}")]
        [SwaggerOperation(
            Summary = "Removes a media transfer item by its ID",
            OperationId = "DeleteMediaItem"
        )]
        [Produces("application/json")]
        [SwaggerResponse(StatusCodes.Status204NoContent, "The media transfer item was removed")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Media item not found")]
        public async Task<IActionResult> DeleteItemAsync(string id)
        //public async Task<IActionResult> DeleteItemAsync([FromBody, SwaggerRequestBody(Required = true)] DeleteParams parms)
        {
            _logger.LogInformation("Delete content for id {id}", id);

            var rng = new Random();

            if (rng.Next(100) < 50)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("fileContents")]
        [SwaggerOperation(
            Summary = "Retrieves file contents by path",
            OperationId = "GetFileContents"
        )]
        [Consumes("application/json")]
        [Produces("application/json", "image/jpeg", "image/png", "image/gif", "image/bmp")]
        [SwaggerResponse(StatusCodes.Status200OK, "Successful operation", typeof(FileStreamResult))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Path not found")]
        public async Task<IActionResult> GetFileContentAsync(
            [FromBody, SwaggerRequestBody("Path to the file", Required = true)] FileContentParams parms)
        {
            _logger.LogInformation("Getting content for file path: {path}", parms.Path);

            FileStream fs = System.IO.File.OpenRead("test_image.jpg");
            return File(fs, "image/jpeg");
        }

        private static string GenerateId()
        {
            var base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            return Nanoid.Nanoid.Generate(base58Alphabet, 16);
        }

        public class FileContentParams
        {
            public string Path { get; set; }
        }
    }
}
