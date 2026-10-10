# Creates Microsoft SPFx package from a generated and integrated project.
param([Parameter(Mandatory=$true)][string]$ProjectDirectory)
$ErrorActionPreference='Stop'
Set-Location $ProjectDirectory
if (-not (Test-Path 'config/rig.json')) { throw 'Expected an official Heft-based SPFx project (config/rig.json missing).' }
if (-not (Test-Path 'node_modules')) { npm ci; if ($LASTEXITCODE -ne 0) {throw 'npm ci failed'} }
npx heft build --production
if ($LASTEXITCODE -ne 0) {throw 'SPFx production build failed'}
npx heft package-solution --production
if ($LASTEXITCODE -ne 0) {throw 'SPFx package-solution failed'}
Get-ChildItem 'sharepoint/solution/*.sppkg' | Select-Object FullName,Length,LastWriteTime
