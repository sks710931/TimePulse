using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(p => p.Code)
            .HasMaxLength(50);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.ClientName)
            .HasMaxLength(150);

        builder.Property(p => p.ColorHex)
            .HasMaxLength(30);

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.CreatedAtUtc)
            .IsRequired();

        builder.Property(p => p.UpdatedAtUtc);

        builder.HasMany(p => p.Teams)
            .WithOne(tp => tp.Project)
            .HasForeignKey(tp => tp.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Teams)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Ignore(p => p.DomainEvents);
    }
}
