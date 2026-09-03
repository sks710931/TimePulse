using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data.Configurations;

public class LeaveConfiguration : IEntityTypeConfiguration<Leave>
{
    public void Configure(EntityTypeBuilder<Leave> builder)
    {
        builder.ToTable("Leaves");

        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id)
            .ValueGeneratedNever();

        builder.Property(l => l.UserId)
            .IsRequired();

        builder.Property(l => l.Date)
            .IsRequired();

        builder.Property(l => l.LeaveType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(l => l.Reason)
            .HasMaxLength(500);

        builder.Property(l => l.CreatedAtUtc)
            .IsRequired();

        builder.Property(l => l.UpdatedAtUtc);

        builder.HasIndex(l => new { l.UserId, l.Date })
            .IsUnique();

        builder.HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(l => l.DomainEvents);
    }
}
