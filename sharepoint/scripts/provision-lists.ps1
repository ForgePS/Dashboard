# Prerequisites: PnP.PowerShell installed, permitted SharePoint site access,
# and an approved Entra app registration for PnP interactive login.
# Run: ./provision-lists.ps1 -SiteUrl https://TENANT.sharepoint.com/sites/Firehouse -ClientId <APP-ID>
param([Parameter(Mandatory=$true)][string]$SiteUrl,[Parameter(Mandatory=$true)][string]$ClientId)
$ErrorActionPreference = 'Stop'
Connect-PnPOnline -Url $SiteUrl -Interactive -ClientId $ClientId

function Ensure-List([string]$Name) {
  $existing = Get-PnPList -Identity $Name -ErrorAction SilentlyContinue
  if (-not $existing) { New-PnPList -Title $Name -Template GenericList | Out-Null }
}
function Ensure-Field([string]$List,[string]$Name,[string]$Type) {
  $field = Get-PnPField -List $List -Identity $Name -ErrorAction SilentlyContinue
  if (-not $field) { Add-PnPField -List $List -DisplayName $Name -InternalName $Name -Type $Type | Out-Null }
}
$spec = @{
  FirehouseStations = @(@('StationNumber','Number'),@('IsEnabled','Boolean'),@('PlaylistSeconds','Number'))
  FirehouseAnnouncements = @(@('StationNumber','Number'),@('Message','Note'),@('StartsAt','DateTime'),@('EndsAt','DateTime'),@('IsActive','Boolean'))
  FirehouseIncidents = @(@('StationNumber','Number'),@('DispatchId','Text'),@('Address','Text'),@('IncidentType','Text'),@('DispatchedAt','DateTime'),@('Status','Text'))
  FirehousePlaylist = @(@('StationNumber','Number'),@('MediaUrl','URL'),@('DurationSeconds','Number'),@('IsEnabled','Boolean'),@('SortOrder','Number'))
}
foreach($name in $spec.Keys) {
  Ensure-List $name
  foreach($definition in $spec[$name]) { Ensure-Field $name $definition[0] $definition[1] }
  Write-Host "Provisioned list: $name"
}
# Seed only a non-operational station configuration. Never invent an actual incident.
$station = Get-PnPListItem -List 'FirehouseStations' -PageSize 100 |
  Where-Object { $_['StationNumber'] -eq 1 } | Select-Object -First 1
if (-not $station) {
  Add-PnPListItem -List 'FirehouseStations' -Values @{Title='Station 1';StationNumber=1;IsEnabled=$true;PlaylistSeconds=45} | Out-Null
}
Write-Host 'List setup complete. Configure permissions and verify internal field names before production.'
