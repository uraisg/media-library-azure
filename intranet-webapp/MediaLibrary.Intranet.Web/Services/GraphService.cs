using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using MediaLibrary.Intranet.Web.Models;
using Microsoft.Graph;
using Newtonsoft.Json;

namespace MediaLibrary.Intranet.Web.Services
{
    public class ReturnResponse
    {
        public BatchResponseContent response { get; set; }
        public BatchResponseContent response2 { get; set; }
    }
    public class GraphService
    {
        private readonly GraphServiceClient _client;
        public GraphService(GraphServiceClient graphServiceClient)
        {
            _client = graphServiceClient;
        }

        public async Task<List<UserInfo>> GetUserInfo(string email)
        {
            //Maximum number of request for current batch size (stated on https://docs.microsoft.com/en-us/graph/known-issues#json-batching)
            int max_request = 20;

            List<string> emailList = email.Split(',').ToList();

            BatchRequestContent container = new BatchRequestContent();
            //Second container for request more than current batch size
            BatchRequestContent container2 = new BatchRequestContent();
            List<string> requestId = new List<string>();

            //Retrieving individual request
            int count = 1;
            foreach (var userEmail in emailList)
            {
                string filter = $"mail eq '{userEmail}'";
                var request = _client.Users.Request()
                    .Filter(filter)
                    .Select(u => new
                    {
                        u.Mail,
                        u.DisplayName,
                        u.Department
                    });
                //Each step returns an id that is stored in request_id
                if (count <= max_request)
                {
                    requestId.Add(container.AddBatchRequestStep(request));
                }
                else
                {
                    requestId.Add(container2.AddBatchRequestStep(request));
                }
                count++;
            }

            //Retrieving response
            ReturnResponse returnResponse = new ReturnResponse();
            returnResponse.response = await _client.Batch.Request().PostAsync(container);
            if (emailList.Count > max_request)
            {
                returnResponse.response2 = await _client.Batch.Request().PostAsync(container2);
            }

            List<UserInfo> allUserInfo = new List<UserInfo>();

            //Retrieving each request by each id
            //TODO: Remove department (UIAM Implementations)
            count = 1;
            foreach (var itemId in requestId)
            {
                HttpResponseMessage listResponse = null;
                if (count <= max_request)
                {
                    listResponse = await returnResponse.response.GetResponseByIdAsync(itemId);
                }
                else
                {
                    listResponse = await returnResponse.response2.GetResponseByIdAsync(itemId);
                }
                if (listResponse.IsSuccessStatusCode)
                {
                    var listsJson = await listResponse.Content.ReadAsStringAsync();
                    var lists = JsonConvert.DeserializeAnonymousType(listsJson,
                        new { value = new[] { new { Mail = "", DisplayName = "", Department = "" } } });

                    foreach (var l in lists.value)
                    {
                        UserInfo userInfo = new UserInfo();
                        userInfo.DisplayName = l.DisplayName;
                        userInfo.Mail = l.Mail;
                        userInfo.Department = l.Department;
                        allUserInfo.Add(userInfo);
                    }
                }
                count++;
            }
            return allUserInfo;
        }
    }
}
