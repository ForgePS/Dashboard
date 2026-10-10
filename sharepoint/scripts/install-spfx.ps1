# Generates an official SPFx project; do not handcraft undocumented rig/Heft files.
# Requires Node 22 and npm; requires permission to install npm packages.
param([string]$Root = (Join-Path $PSScriptRoot '..'))
$ErrorActionPreference = 'Stop'
Set-Location $Root
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22.' }
$major = [int]((node --version).TrimStart('v').Split('.')[0])
if ($major -ne 22) { throw "Node 22 required; found $(node --version)" }
npm install --global yo @microsoft/generator-sharepoint@1.23.2
Write-Host 'Generate official SPFx React webpart using: yo @microsoft/sharepoint'
Write-Host 'Select: SharePoint Online, WebPart, React, FirehouseDashboard.'
Write-Host 'Copy the files from sharepoint/src into the generated src/webparts/firehouseDashboard/ folder.'
Write-Host 'IMPORTANT: update generated web part imports/manifest according to project layout, then run: npm install; npm run build; npm run package-solution'
Write-Host 'The web-part source in this repository is a migration starter; it is not yet integrated with an automatically generated project.'
