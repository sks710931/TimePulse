namespace TimePulse.Application.Common.Models;

public class Result<T>
{
    public bool Succeeded { get; }
    public T? Data { get; }
    public string[] Errors { get; }

    protected Result(bool succeeded, T? data, string[] errors)
    {
        Succeeded = succeeded;
        Data = data;
        Errors = errors;
    }

    public static Result<T> Success(T data) => new(true, data, []);
    public static Result<T> Failure(string[] errors) => new(false, default, errors);
    public static Result<T> Failure(string error) => new(false, default, [error]);
}
