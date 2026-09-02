using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data.Configurations;

public class TimeEntryConfiguration : IEntityTypeConfiguration<TimeEntry>
{
    public void Configure(EntityTypeBuilder<TimeEntry> builder)
    {
        builder.ToTable("TimeEntries");

        builder.HasKey(te => te.Id);
        builder.Property(te => te.Id)
            .ValueGeneratedNever();

        builder.Property(te => te.UserId)
            .IsRequired();

        builder.Property(te => te.ProjectId);

        builder.Property(te => te.Description)
            .HasMaxLength(500)
            .IsRequired()
            .HasDefaultValue(string.Empty);

        builder.Property(te => te.StartTimeUtc)
            .IsRequired();

        builder.Property(te => te.EndTimeUtc)
            .IsRequired();

        builder.Property(te => te.DurationMinutes)
            .IsRequired();

        builder.Property(te => te.IsBillable)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(te => te.Tag)
            .HasMaxLength(100);

        builder.Property(te => te.CreatedAtUtc)
            .IsRequired();

        builder.Property(te => te.UpdatedAtUtc);

        builder.HasIndex(te => new { te.UserId, te.StartTimeUtc });
        builder.HasIndex(te => te.ProjectId);

        builder.HasOne(te => te.User)
            .WithMany()
            .HasForeignKey(te => te.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(te => te.Project)
            .WithMany()
            .HasForeignKey(te => te.ProjectId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Ignore(te => te.DomainEvents);
    }
}
