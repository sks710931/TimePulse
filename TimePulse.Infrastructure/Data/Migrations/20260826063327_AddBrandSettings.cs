using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimePulse.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBrandSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BrandSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    LogoData = table.Column<string>(type: "text", nullable: true),
                    LogoType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrandSettings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "BrandSettings",
                columns: new[] { "Id", "AppName", "LogoData", "LogoType", "UpdatedAtUtc" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), "TimePulse", null, "Default", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BrandSettings");
        }
    }
}
