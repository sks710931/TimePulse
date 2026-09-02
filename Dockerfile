# ==========================================
# Stage 1: Build Frontend (Vite + React)
# ==========================================
FROM node:20-alpine AS ui-builder
WORKDIR /src/TimePulse.UI

COPY TimePulse.UI/package*.json ./
RUN npm ci

COPY TimePulse.UI/ ./
RUN npm run build

# ==========================================
# Stage 2: Build & Publish Backend (.NET 10)
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS dotnet-builder
WORKDIR /src

# Copy props and project files for caching dependency restore
COPY Directory.Packages.props ./
COPY TimePulse.Domain/TimePulse.Domain.csproj TimePulse.Domain/
COPY TimePulse.Application/TimePulse.Application.csproj TimePulse.Application/
COPY TimePulse.Infrastructure/TimePulse.Infrastructure.csproj TimePulse.Infrastructure/
COPY TimePulse.API/TimePulse.API.csproj TimePulse.API/

RUN dotnet restore TimePulse.API/TimePulse.API.csproj -p:BuildingInsideDocker=true

# Copy source code
COPY TimePulse.Domain/ TimePulse.Domain/
COPY TimePulse.Application/ TimePulse.Application/
COPY TimePulse.Infrastructure/ TimePulse.Infrastructure/
COPY TimePulse.API/ TimePulse.API/

# Copy compiled frontend from Stage 1 into TimePulse.API/wwwroot
COPY --from=ui-builder /src/TimePulse.API/wwwroot ./TimePulse.API/wwwroot

# Publish the .NET application (skipping the UI esproj since frontend is already built in Stage 1)
RUN dotnet publish TimePulse.API/TimePulse.API.csproj -c Release -o /app/publish --no-restore -p:BuildingInsideDocker=true

# ==========================================
# Stage 3: Final Lean Runtime Image
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=dotnet-builder /app/publish .

ENTRYPOINT ["dotnet", "TimePulse.API.dll"]
