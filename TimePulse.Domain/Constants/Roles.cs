namespace TimePulse.Domain.Constants;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Employee = "Employee";
    public const string User = "User";

    public static readonly IReadOnlyList<string> All = [Admin, Manager, Employee, User];

    public static bool IsValid(string role) =>
        All.Any(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));
}
