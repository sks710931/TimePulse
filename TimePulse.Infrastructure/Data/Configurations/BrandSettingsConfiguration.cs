using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data.Configurations;

public class BrandSettingsConfiguration : IEntityTypeConfiguration<BrandSettings>
{
    public void Configure(EntityTypeBuilder<BrandSettings> builder)
    {
        builder.ToTable("BrandSettings");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.AppName)
            .IsRequired(false)
            .HasMaxLength(150);

        builder.Property(b => b.LogoData)
            .HasColumnType("text");

        builder.Property(b => b.LogoType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.LogoDarkData)
            .HasColumnType("text");

        builder.Property(b => b.LogoDarkType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.PrimaryColorLight)
            .IsRequired(false)
            .HasMaxLength(30);

        builder.Property(b => b.PrimaryColorDark)
            .IsRequired(false)
            .HasMaxLength(30);

        builder.Property(b => b.UpdatedAtUtc)
            .IsRequired();

        builder.Ignore(b => b.IsCustom);
        builder.Ignore(b => b.DomainEvents);

        // Seed initial default brand settings
        builder.HasData(BrandSettings.CreateDefault());
    }
}
