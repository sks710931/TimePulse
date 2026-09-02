using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data.Configurations;

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRoles");

        builder.HasKey(ur => ur.Id);
        builder.Property(ur => ur.Id)
            .ValueGeneratedNever();

        builder.Property(ur => ur.Role)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(ur => new { ur.UserId, ur.Role })
            .IsUnique();

        builder.Ignore(ur => ur.DomainEvents);
    }
}
