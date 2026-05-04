#!/usr/bin/env pwsh
# bump-and-release.ps1
# Stage 1: bump the patch version in TBA-ImportMembers.php, commit, push branch
#          -> open and merge the PR on GitHub, then run Stage 2
# Stage 2: checkout main, pull the merged PR, tag, push tag  (-SkipBump)
#
# Usage: .\bump-and-release.ps1 [-Branch <branch>] [-DryRun]
#        .\bump-and-release.ps1 -SkipBump   (after PR is merged)
# Defaults to the current branch.

param(
    [string]$Branch = "",
    [switch]$DryRun,
    [switch]$SkipBump
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -- helpers ------------------------------------------------------------------

function Write-Step([string]$msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Done([string]$msg) { Write-Host "    OK: $msg" -ForegroundColor Green }
function Invoke-Git([string[]]$gitArgs) {
    if ($DryRun) {
        Write-Host "    [dry-run] git $($gitArgs -join ' ')" -ForegroundColor DarkYellow
        return
    }
    & git @gitArgs
    if ($LASTEXITCODE -ne 0) { throw "git $($gitArgs -join ' ') failed (exit $LASTEXITCODE)" }
}

# -- resolve current branch ---------------------------------------------------

if (-not $Branch) {
    $Branch = (git rev-parse --abbrev-ref HEAD).Trim()
}
if ($Branch -eq "master") {
    Write-Error "You are already on 'master'. Checkout a feature/fix branch first."
    exit 1
}
Write-Step "Working branch: $Branch"

$dirty = & git status --porcelain
if ($dirty -and -not $DryRun -and -not $SkipBump) {
    Write-Host "`nUncommitted changes detected:" -ForegroundColor Yellow
    $dirty | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    Write-Host "`nPlease commit your changes first, then re-run this script to bump and release." -ForegroundColor Yellow
    exit 1
}

# -- locate plugin file -------------------------------------------------------

$repoRoot = (git rev-parse --show-toplevel).Trim()
$pluginFile = Join-Path $repoRoot "content-card-shortcode.php"
if (-not (Test-Path $pluginFile)) {
    Write-Error "Cannot find content-card-shortcode.php at: $pluginFile"
    exit 1
}

# -- read current version -----------------------------------------------------

$content = Get-Content $pluginFile -Raw
if ($content -notmatch 'Version:\s*(\d+)\.(\d+)\.(\d+)') {
    Write-Error "Could not find 'Version: x.y.z' in $pluginFile"
    exit 1
}
$major = [int]$Matches[1]
$minor = [int]$Matches[2]
$patch = [int]$Matches[3]
$oldVersion = "$major.$minor.$patch"
$newVersion = "$major.$minor.$($patch + 1)"

Write-Step "Bumping $oldVersion -> $newVersion"

# -- [STAGE 1] ----------------------------------------------------------------

if ($SkipBump) {
    # Derive version from the existing plugin file without modifying anything
    $content = Get-Content $pluginFile -Raw
    if ($content -notmatch 'Version:\s*(\d+\.\d+\.\d+)') {
        Write-Error "Could not find 'Version: x.y.z' in $pluginFile"
        exit 1
    }
    $newVersion = $Matches[1]
    $tagName = $newVersion
    Write-Step "Skipping bump - using existing version $newVersion"
} else {
$content = $content -replace "(?m)(^\s*\*\s*Version:\s*)$([regex]::Escape($oldVersion))", "`${1}$newVersion"

# Update the define() constant
$content = $content -replace "(?m)(define\('CONTENT_CARD_VERSION',\s*')$([regex]::Escape($oldVersion))('\s*\);)", "`${1}$newVersion`${2}"

if ($DryRun) {
    Write-Host "    [dry-run] would write updated version to $pluginFile" -ForegroundColor DarkYellow
} else {
    Set-Content $pluginFile $content -NoNewline
}
Write-Done "Updated version in $pluginFile"

$tagName = $newVersion
$commitMsg = "Bump version to $newVersion"

Invoke-Git @("add", $pluginFile)
Invoke-Git @("commit", "-m", $commitMsg)
Write-Done "Committed: $commitMsg"

Invoke-Git @("push", "origin", $Branch)
Write-Done "Pushed branch $Branch to origin"
Write-Host "`nNext: open a PR on GitHub, get it reviewed, and merge it." -ForegroundColor Yellow
Write-Host "Then run: ..\.github\skills\bump-and-release\scripts\bump-and-release.ps1 -SkipBump`n" -ForegroundColor Yellow
} # end if -not SkipBump

# -- [/STAGE 1] ---------------------------------------------------------------

if (-not $SkipBump) { return }

# -- [STAGE 2] ----------------------------------------------------------------

Write-Step "Checking out master and tagging $tagName"

Invoke-Git @("checkout", "master")
Invoke-Git @("pull", "--ff-only", "origin", "master")

# Verify the bump commit is present on main (PR was actually merged)
$versionOnMain = (& git show HEAD:content-card-shortcode.php) -match "Version:\s*$([regex]::Escape($newVersion))"
if (-not $versionOnMain -and -not $DryRun) {
    Write-Error "Version $newVersion not found on main. Has the PR been merged yet?"
    exit 1
}

Invoke-Git @("tag", $tagName)
Invoke-Git @("push", "origin", $tagName)

Write-Done "Pushed tag $tagName to origin"
Write-Host "`nRelease $tagName is on its way - check GitHub Actions for the build." -ForegroundColor Green

# -- [/STAGE 2] ---------------------------------------------------------------
