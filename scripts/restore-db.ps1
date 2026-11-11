# ==============================================================================
# WebSec CTF - Database Restoration Script (Windows)
# ==============================================================================
param (
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

if (-not $BackupFile) {
    Write-Host "Usage: .\scripts\restore-db.ps1 -BackupFile <path_to_file.sql>`n"
    Write-Host "Available backups in backups/:" -ForegroundColor Yellow
    Get-ChildItem -Path "backups\*.sql*" -ErrorAction SilentlyContinue | Select-Object Name, Length, LastWriteTime
    exit 1
}

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file '$BackupFile' was not found."
    exit 1
}

$containerName = "websec-mysql"
$runningContainers = docker ps --format '{{.Names}}'

if ($runningContainers -match "websec-prod-mysql") {
    $containerName = "websec-prod-mysql"
} elseif ($runningContainers -notmatch "websec-mysql") {
    Write-Error "Neither websec-mysql nor websec-prod-mysql container is currently running."
    exit 1
}

$confirm = Read-Host "⚠️ WARNING: Restoring will overwrite existing data. Type 'yes' to proceed"
if ($confirm -ne "yes") {
    Write-Host "Restoration aborted."
    exit 0
}

Write-Host "⏳ Streaming SQL into container '$containerName'..." -ForegroundColor Cyan

$rootPassword = if ($env:DB_ROOT_PASSWORD) { $env:DB_ROOT_PASSWORD } else { "root_password" }
Get-Content $BackupFile | docker exec -i $containerName mysql -u root -p$rootPassword websec_ctf

Write-Host "✅ Database restored successfully." -ForegroundColor Green
