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
            List<string> request_id = new List<string>();

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
                        u.DisplayName
                    });
                //Each step returns an id that is stored in request_id
                if (count <= max_request)
                {
                    request_id.Add(container.AddBatchRequestStep(request));
                }
                else
                {
                    request_id.Add(container2.AddBatchRequestStep(request));
                }
                count++;
            }

            //Retrieving response
            var returnedResponse = await _client.Batch.Request().PostAsync(container);
            BatchResponseContent returnedResponse2 = null;
            if (emailList.Count > max_request)
            {
                returnedResponse2 = await _client.Batch.Request().PostAsync(container2);
            }

            List<UserInfo> allUserInfo = new List<UserInfo>();

            //Retrieving each request by each id 
            count = 1;
            foreach (var itemId in request_id)
            {
                HttpResponseMessage listResponse = null;
                if (count <= max_request)
                {
                    listResponse = await returnedResponse.GetResponseByIdAsync(itemId);
                }
                else
                {
                    listResponse = await returnedResponse2.GetResponseByIdAsync(itemId);
                }
                if (listResponse.IsSuccessStatusCode)
                {
                    var listsJson = await listResponse.Content.ReadAsStringAsync();
                    var lists = JsonConvert.DeserializeAnonymousType(listsJson,
                        new { value = new[] { new { Mail = "", DisplayName = "" } } });

                    foreach (var l in lists.value)
                    {
                        UserInfo userInfo = new UserInfo();
                        userInfo.DisplayName = l.DisplayName;
                        userInfo.Mail = l.Mail;
                        allUserInfo.Add(userInfo);
                    }
                }
                count++;
            }
            return allUserInfo;
        }
    }
}
