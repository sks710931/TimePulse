using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimePulse.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsBillableToProjectsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBillable",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBillable",
                table: "Projects");
        }
    }
}
