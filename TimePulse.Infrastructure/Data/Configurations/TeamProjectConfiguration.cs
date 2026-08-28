using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data.Configurations;

public class TeamProjectConfiguration : IEntityTypeConfiguration<TeamProject>
{
    public void Configure(EntityTypeBuilder<TeamProject> builder)
    {
        builder.ToTable("TeamProjects");

        builder.HasKey(tp => tp.Id);

        builder.Property(tp => tp.AssignedAtUtc)
            .IsRequired();

        builder.HasIndex(tp => new { tp.TeamId, tp.ProjectId })
            .IsUnique();

        builder.HasOne(tp => tp.Project)
            .WithMany()
            .HasForeignKey(tp => tp.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(tp => tp.DomainEvents);
    }
}
