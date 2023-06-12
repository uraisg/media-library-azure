using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.IO;
using MediaLibrary.Intranet.Web.Common;
using MediaLibrary.Intranet.Web.Models;
using MediaLibrary.Intranet.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;


namespace MediaLibrary.Intranet.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcmApiController : ControllerBase
    {
        private readonly ILogger<AcmApiController> _logger;
        private readonly UserService _userService;
        private readonly ACMUserRoleService _userRoleService;

        public AcmApiController(

          ILogger<AcmApiController> logger,
              UserService userService,
            ACMUserRoleService userRoleService
          )
        {
            _logger = logger;
            _userService = userService;
            _userRoleService = userRoleService;

        }

        [HttpGet("/api/acm/users", Name = nameof(GetUsers))]
        public IActionResult GetUsers([FromQuery] UserQuery userQuery)
        {
            _logger.LogInformation("Getting Users");
            var StaffInfoResults = _userService.GetAllUsersByPage(userQuery);

            return Ok(StaffInfoResults);
        }

        [HttpPost("/api/acm/users", Name = nameof(UpdateUserStatus))]
        public IActionResult UpdateUserStatus([FromBody] ActiveAndSuspendUsers userStatus)
        {
            _logger.LogInformation("Updating Users Status");

            try
            {
                foreach (var userid in userStatus.UserIds)
                {
                    _userService.updateStatusById(userStatus.UserStatus, DateTime.Now, User.GetUserGraphEmail(), userid, User.GetUserGraphEmail());
                    _logger.LogInformation("Updating for {0} status to {1}", userid, userStatus.UserStatus);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,"There is error retrieving users");
            }
            return Ok();
        }


        [HttpGet("/api/acm/generateUserReport", Name = nameof(DownloadUsers))]
        public IActionResult DownloadUsers([FromQuery] UserQuery userQuery)
        {
            List<DownloadUserReport> data;
            data = _userService.GetAllUsers(userQuery);

            // Generate the Excel file using NPOI
            IWorkbook workbook = new XSSFWorkbook();
            ISheet sheet = workbook.CreateSheet("ML user Report");

            //Title
            IRow titleRow = sheet.CreateRow(0);
            ICellStyle titleStyle = workbook.CreateCellStyle();
            IFont titleFont = workbook.CreateFont();
            titleFont.IsBold = true;
            titleFont.FontHeightInPoints = 20;
            titleStyle.SetFont(titleFont);

            ICell cell2 = titleRow.CreateCell(0);
            cell2.SetCellValue("Media Library User Report");
            cell2.CellStyle = titleStyle;

            //Date time
            var dateTimeRow = sheet.CreateRow(1);
            DateTime today = DateTime.Now;
            dateTimeRow.CreateCell(0).SetCellValue("Created On: " + today.Date.ToString("dd/MM/yyyy") + " " + today.ToString("h:mm tt"));

            //Downloaded User
            var userRow = sheet.CreateRow(2);
            userRow.CreateCell(0).SetCellValue("Created By: " + User.GetUserGraphDisplayName());

            ICellStyle headerStyle = workbook.CreateCellStyle();
            IFont headerFont = workbook.CreateFont();
            headerFont.IsBold = true;
            headerStyle.SetFont(headerFont);

            // Create header row
            IRow headerRow = sheet.CreateRow(4);
            headerRow.CreateCell(0).SetCellValue("UserName");
            headerRow.CreateCell(1).SetCellValue("Email");
            headerRow.CreateCell(2).SetCellValue("Department");
            headerRow.CreateCell(3).SetCellValue("Group");
            headerRow.CreateCell(4).SetCellValue("Status");
            headerRow.CreateCell(5).SetCellValue("LastLoginDate");
            headerRow.CreateCell(6).SetCellValue("SuspendedDate");
            int index = 4;
            StyleHeaderRow(headerRow);

            // Populate data rows
            foreach (DownloadUserReport item in data)
            {
                IRow dataRow = sheet.CreateRow(index + 1);
                dataRow.CreateCell(0).SetCellValue(item.UserName);
                dataRow.CreateCell(1).SetCellValue(item.Email);
                dataRow.CreateCell(2).SetCellValue(item.Department);
                dataRow.CreateCell(3).SetCellValue(item.Group);
                dataRow.CreateCell(4).SetCellValue(item.Status);
                if (item.LastLoginDate.HasValue)
                {
                    dataRow.CreateCell(5).SetCellValue((DateTime)item.LastLoginDate);
                    ApplyDateTimeStyle(dataRow.GetCell(5));
                }

                if (item.DisabledDate.HasValue)
                {
                    dataRow.CreateCell(6).SetCellValue((DateTime)item.DisabledDate);
                    ApplyDateTimeStyle(dataRow.GetCell(6));
                }
                index++;
            }

            // Convert workbook to a byte array
            using (MemoryStream stream = new MemoryStream())
            {
                string saveAsFileName = string.Format("ML_UserReport-{0:d}.xlsx", DateTime.Now).Replace("/", "-");
                workbook.Write(stream, true);
                byte[] excelBytes = stream.ToArray();

                // Return the Excel file as a downloadable file
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", saveAsFileName);
            }
        }

        public void ApplyDateTimeStyle(ICell cell)
        {
            IWorkbook workbook = cell.Sheet.Workbook;
            IDataFormat dataFormat = workbook.CreateDataFormat();
            ICellStyle cellStyle = workbook.CreateCellStyle();
            cellStyle.DataFormat = dataFormat.GetFormat("dd-mm-yyyy");
            cell.CellStyle = cellStyle;
        }

        private static void StyleHeaderRow(IRow headerRow)
        {
            IWorkbook workbook = headerRow.Sheet.Workbook;
            ICellStyle headerStyle = workbook.CreateCellStyle();
            IFont headerFont = workbook.CreateFont();
            headerFont.IsBold = true;
            headerStyle.SetFont(headerFont);

            for (int i = 0; i < headerRow.LastCellNum; i++)
            {
                ICell headerCell = headerRow.GetCell(i) ?? headerRow.CreateCell(i);
                headerCell.CellStyle = headerStyle;
            }
        }

        [HttpGet("/api/acm/dropdownoptions", Name = nameof(GetDropdownOptions))]
        public IActionResult GetDropdownOptions()
        {
            _logger.LogInformation("Getting Dropdown options for groups and departments");

            var Dropdownoptions = _userService.ACMDropdownOptions();
            
            return Ok(Dropdownoptions);
        }

        
        //api for userole page
        [HttpGet("/api/acm/usersRole", Name = nameof(GetUsersRole))]
        public IActionResult GetUsersRole([FromQuery] UserRoleQuery userQuery)
        {
            _logger.LogInformation("Getting Users Roles");
            var StaffRoleResults = _userRoleService.GetAllUsersRoleByPage(userQuery);
            return Ok(StaffRoleResults);
        }

        [HttpGet("/api/acmRole/dropdownoptions", Name = nameof(GetDropdown))]
        public IActionResult GetDropdown()
        {
            _logger.LogInformation("Getting Dropdown options for groups,departments and roles");

            var Dropdownoptions = _userRoleService.ACMDropdownOptions();

            return Ok(Dropdownoptions);
        }

        [HttpGet("/api/acm/generateUserRoleReport", Name = nameof(DownloadUsersRole))]
        public IActionResult DownloadUsersRole([FromQuery] UserRoleQuery userQuery)
        {
            List<DownloadUserRoleReport> data;
            data = _userRoleService.GetUsersRoleReport(userQuery);

            IWorkbook workbook = new XSSFWorkbook();
            ISheet sheet = workbook.CreateSheet("ML user Report");

            IRow titleRow = sheet.CreateRow(0);
            ICellStyle titleStyle = workbook.CreateCellStyle();
            IFont titleFont = workbook.CreateFont();
            titleFont.IsBold = true;
            titleFont.FontHeightInPoints = 20;
            titleStyle.SetFont(titleFont);

            ICell cell2 = titleRow.CreateCell(0);
            cell2.SetCellValue("Media Library User Roles Report");
            cell2.CellStyle = titleStyle;

            //Date time
            var dateTimeRow = sheet.CreateRow(1);
            DateTime today = DateTime.Now;
            dateTimeRow.CreateCell(0).SetCellValue("Created On: " + today.Date.ToString("dd/MM/yyyy") + " " + today.ToString("h:mm tt"));

            //Downloaded User
            var userRow = sheet.CreateRow(2);
            userRow.CreateCell(0).SetCellValue("Created By: " + User.GetUserGraphDisplayName());

            ICellStyle headerStyle = workbook.CreateCellStyle();
            IFont headerFont = workbook.CreateFont();
            headerFont.IsBold = true;
            headerStyle.SetFont(headerFont);

            // Create header row
            IRow headerRow = sheet.CreateRow(4);
            headerRow.CreateCell(0).SetCellValue("User Id");
            headerRow.CreateCell(1).SetCellValue("UserName");
            headerRow.CreateCell(2).SetCellValue("Email");
            headerRow.CreateCell(3).SetCellValue("Department");
            headerRow.CreateCell(4).SetCellValue("Group");
            headerRow.CreateCell(5).SetCellValue("Role");
            headerRow.CreateCell(6).SetCellValue("LastLoginDate");
       
            int index = 4;
            StyleHeaderRow(headerRow);

            // Populate data rows
            foreach (DownloadUserRoleReport item in data)
            {
                IRow dataRow = sheet.CreateRow(index + 1);
                dataRow.CreateCell(0).SetCellValue(item.id);
                dataRow.CreateCell(1).SetCellValue(item.UserName);
                dataRow.CreateCell(2).SetCellValue(item.Email);
                dataRow.CreateCell(3).SetCellValue(item.Department);
                dataRow.CreateCell(4).SetCellValue(item.Group);
                dataRow.CreateCell(5).SetCellValue(item.Role);
                if (item.LastLoginDate.HasValue)
                {
                    dataRow.CreateCell(6).SetCellValue((DateTime)item.LastLoginDate);
                    ApplyDateTimeStyle(dataRow.GetCell(6));
                
                }
                index++;
            }

            // Convert workbook to a byte array
            using (MemoryStream stream = new MemoryStream())
            {
                string saveAsFileName = string.Format("ML_UserReport-{0:d}.xlsx", DateTime.Now).Replace("/", "-");
                workbook.Write(stream, true);
                byte[] excelBytes = stream.ToArray();

                // Return the Excel file as a downloadable file
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", saveAsFileName);
            }
        }
     
        [HttpPost("/api/acm/usersRole", Name = nameof(UpdateUserRole))]
        public IActionResult UpdateUserRole([FromBody] AssignedAndRevokeUsers userRoles)
        {
            _logger.LogInformation("Updating Users Role");
            var userRole = "";
            string RoleChange = userRoles.roleChange;
            try
            {
                foreach (var userid in userRoles.UserIds)
                {
                    foreach(var userrole in userRoles.roles)
                    {
                         userRole = userrole;
                    }
                    _userRoleService.DeleteRoleById( User.GetUserGraphEmail(), userid, userRole);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "There is error retrieving users roles");
            }
            return Ok();
        }
        
        [HttpPost("/api/acm/AssignedUsersRole", Name = nameof(AssignedUserRole))]
        public IActionResult AssignedUserRole([FromBody] AssignedAndRevokeUsers userRoles)
        {
            _logger.LogInformation("Updating Users Role");
            var userRole = "";
            string RoleChange = userRoles.roleChange;
            try
            {
                foreach (var userid in userRoles.UserIds)
                {
                    foreach (var userrole in userRoles.roles)
                    {
                        userRole = userrole;
                    }
                    _userRoleService.assignedRoleById(User.GetUserGraphEmail(), userid, userRole,RoleChange);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "There is error retrieving users roles");
            }
            return Ok();
        }

      [HttpGet("/api/acmRole/RoleOptions", Name = nameof(GetRoleSelectOptions))]
        public IActionResult GetRoleSelectOptions()
        {
            _logger.LogInformation("Getting options for roles to assigned");

            var Dropdownoptions = _userRoleService.RoleOptions();

            return Ok(Dropdownoptions);
        }
    }
}
