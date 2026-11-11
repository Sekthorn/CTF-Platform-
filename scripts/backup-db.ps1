# ==============================================================================
# WebSec CTF - Automated Database Backup Script (Windows)
# ==============================================================================
$ErrorActionPreference = "Stop"

$backupDir = "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "$backupDir\websec_ctf_backup_$timestamp.sql"

$containerName = "websec-mysql"
$runningContainers = docker ps --format '{{.Names}}'

if ($runningContainers -match "websec-prod-mysql") {
    $containerName = "websec-prod-mysql"
} elseif ($runningContainers -notmatch "websec-mysql") {
    Write-Error "Neither websec-mysql nor websec-prod-mysql container is currently running."
    exit 1
}

Write-Host "📦 Exporting database from container '$containerName'..." -ForegroundColor Cyan

$rootPassword = if ($env:DB_ROOT_PASSWORD) { $env:DB_ROOT_PASSWORD } else { "root_password" }
docker exec $containerName mysqldump -u root -p$rootPassword --single-transaction --quick websec_ctf | Out-File -FilePath $filename -Encoding utf8

Write-Host "✅ Backup created successfully at: $filename" -ForegroundColor Green
Get-Item $filename | Select-Object FullName, Length, LastWriteTime
