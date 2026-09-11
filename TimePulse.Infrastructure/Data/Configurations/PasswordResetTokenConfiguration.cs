using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data.Configurations;

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("PasswordResetTokens");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.UserId)
            .IsRequired();

        builder.HasIndex(t => t.UserId);

        builder.Property(t => t.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(t => t.Email);

        builder.Property(t => t.TokenHash)
            .IsRequired()
            .HasMaxLength(128);

        builder.HasIndex(t => t.TokenHash)
            .IsUnique();

        builder.Property(t => t.CreatedAtUtc)
            .IsRequired();

        builder.Property(t => t.ExpiresAtUtc)
            .IsRequired();

        builder.Property(t => t.IsConsumed)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(t => t.ConsumedAtUtc);
    }
}
