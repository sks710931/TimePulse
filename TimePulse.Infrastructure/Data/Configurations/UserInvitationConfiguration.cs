using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data.Configurations;

public class UserInvitationConfiguration : IEntityTypeConfiguration<UserInvitation>
{
    public void Configure(EntityTypeBuilder<UserInvitation> builder)
    {
        builder.ToTable("UserInvitations");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(i => i.Email);

        builder.Property(i => i.InvitationTokenHash)
            .IsRequired()
            .HasMaxLength(128);

        builder.HasIndex(i => i.InvitationTokenHash)
            .IsUnique();

        builder.Property(i => i.Roles)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(i => i.TeamIds)
            .HasMaxLength(2000);

        builder.Property(i => i.InvitedByUserId)
            .IsRequired();

        builder.Property(i => i.CreatedAtUtc)
            .IsRequired();

        builder.Property(i => i.ExpiresAtUtc)
            .IsRequired();

        builder.Property(i => i.IsConsumed)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(i => i.ConsumedAtUtc);
    }
}
