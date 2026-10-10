# Prepare the official SPFx 1.23.2 generator on a Node 22 workstation.
# This script intentionally does not perform unattended scaffolding:
# the generator's answers determine the manifest and package identity.
param([string]$ProjectDirectory = (Join-Path (Get-Location) 'firehouse-spfx'))
$ErrorActionPreference = 'Stop'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 22 must be installed.' }
$major = [int]((node --version).TrimStart('v').Split('.')[0])
if ($major -ne 22) { throw "Node 22 required, found $(node --version)" }
npm install --global yo @microsoft/generator-sharepoint@1.23.2
if ($LASTEXITCODE -ne 0) { throw 'Failed to install SPFx generator.' }
New-Item -ItemType Directory -Force -Path $ProjectDirectory | Out-Null
Set-Location $ProjectDirectory
Write-Host 'Run: yo @microsoft/sharepoint'
Write-Host 'Choose: SharePoint Online, React web part, FirehouseDashboard (one web part).'
Write-Host 'Then, from the Git checkout: node sharepoint/scripts/integrate-generated-spfx.mjs "<generated SPFx project directory>"'
Write-Host 'Then run npx heft build --production and npx heft package-solution --production in the generated SPFx project.'
