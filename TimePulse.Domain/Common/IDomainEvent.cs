namespace TimePulse.Domain.Common;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
