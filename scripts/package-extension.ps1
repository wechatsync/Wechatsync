[CmdletBinding()]
param(
    [string]$OutputDirectory = "artifacts",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$extensionDirectory = Join-Path $repositoryRoot "packages\extension"
$distDirectory = Join-Path $extensionDirectory "dist"
$extensionPackageFile = Join-Path $extensionDirectory "package.json"

if (-not (Test-Path -LiteralPath $extensionPackageFile -PathType Leaf)) {
    throw "Extension package.json not found: $extensionPackageFile"
}

$extensionPackage = Get-Content -LiteralPath $extensionPackageFile -Raw -Encoding UTF8 |
    ConvertFrom-Json
$version = [string]$extensionPackage.version

if ([string]::IsNullOrWhiteSpace($version)) {
    throw "Unable to read the extension version from: $extensionPackageFile"
}

if (-not $SkipBuild) {
    Write-Host "Building the Chrome extension..." -ForegroundColor Cyan
    Push-Location $repositoryRoot
    try {
        & corepack yarn workspace "@wechatsync/extension" build
        if ($LASTEXITCODE -ne 0) {
            throw "Extension build failed with exit code: $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

$manifestFile = Join-Path $distDirectory "manifest.json"
if (-not (Test-Path -LiteralPath $manifestFile -PathType Leaf)) {
    throw "Build output not found: $manifestFile. Build first or omit -SkipBuild."
}

if ([System.IO.Path]::IsPathRooted($OutputDirectory)) {
    $resolvedOutputDirectory = $OutputDirectory
}
else {
    $resolvedOutputDirectory = Join-Path $repositoryRoot $OutputDirectory
}

New-Item -ItemType Directory -Path $resolvedOutputDirectory -Force | Out-Null
$resolvedOutputDirectory = (Resolve-Path -LiteralPath $resolvedOutputDirectory).Path

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveName = "wechatsync-extension-v$version-$timestamp.zip"
$archivePath = Join-Path $resolvedOutputDirectory $archiveName

Write-Host "Packaging: $archiveName" -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $distDirectory "*") -DestinationPath $archivePath

$archive = Get-Item -LiteralPath $archivePath
$sizeMb = [Math]::Round($archive.Length / 1MB, 2)

Write-Host ""
Write-Host "Package created successfully." -ForegroundColor Green
Write-Host "File: $($archive.FullName)"
Write-Host "Size: $sizeMb MB"
Write-Host ""
Write-Host "Manual install: extract the ZIP, open chrome://extensions, enable Developer mode, and choose Load unpacked."
