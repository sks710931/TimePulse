using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimePulse.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPrimaryColorsToBrandSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PrimaryColorDark",
                table: "BrandSettings",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryColorLight",
                table: "BrandSettings",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "BrandSettings",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "PrimaryColorDark", "PrimaryColorLight" },
                values: new object[] { null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrimaryColorDark",
                table: "BrandSettings");

            migrationBuilder.DropColumn(
                name: "PrimaryColorLight",
                table: "BrandSettings");
        }
    }
}
