using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimePulse.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDarkLogoToBrandSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LogoDarkData",
                table: "BrandSettings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoDarkType",
                table: "BrandSettings",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "BrandSettings",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "LogoDarkData", "LogoDarkType" },
                values: new object[] { null, "Default" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoDarkData",
                table: "BrandSettings");

            migrationBuilder.DropColumn(
                name: "LogoDarkType",
                table: "BrandSettings");
        }
    }
}
