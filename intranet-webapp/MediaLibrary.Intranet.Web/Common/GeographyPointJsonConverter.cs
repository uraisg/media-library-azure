using System;
using Microsoft.Azure.Search.Serialization;
using Microsoft.Spatial;
using Newtonsoft.Json;

/// <summary>
/// Converts a <c>GeographyPoint</c> object to and from GeoJSON point.
/// </summary>
public class GeographyPointJsonConverter : JsonConverter
{
    public override bool CanConvert(Type objectType) => objectType == typeof(GeographyPoint);

    public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer) => reader.ReadGeoJsonPoint();

    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) => writer.WriteGeoJsonPoint(value as GeographyPoint);
}
