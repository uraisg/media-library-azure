using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace MediaLibrary.Intranet.Web.Common
{
    public static class JsonHelper
    {
        private static readonly JsonSerializer Serializer = new JsonSerializer()
        {
            ContractResolver = new DefaultContractResolver(),
            Formatting = Formatting.Indented
        };

        public static T ReadJsonFromFile<T>(string jsonPath)
        {
            using (FileStream fs = File.OpenRead(jsonPath))
            {
                return ReadJsonFromStream<T>(fs);
            }
        }

        public static T ReadJsonFromStream<T>(Stream jsonStream)
        {
            using (var sr = new StreamReader(jsonStream))
            using (var jr = new JsonTextReader(sr))
            {
                return Serializer.Deserialize<T>(jr);
            }
        }

        public static void WriteJsonToStream<T>(T obj, Stream stream)
        {
            using (var sw = new StreamWriter(stream, leaveOpen: true))
            using (var jw = new JsonTextWriter(sw))
            {
                Serializer.Serialize(jw, obj);
                sw.Flush();
                stream.Position = 0;
            }
        }
    }
}
