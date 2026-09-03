using System.Text.Json.Serialization;

namespace TimePulse.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LeaveType
{
    FullDay = 1,
    FirstHalf = 2,
    SecondHalf = 3
}
