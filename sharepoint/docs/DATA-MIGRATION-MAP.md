# SharePoint data migration mapping

| Original source | SharePoint target | Notes |
|---|---|---|
| Firebase station display settings | FirehouseStations | StationNumber, IsEnabled, PlaylistSeconds |
| Firebase/incidents API | FirehouseIncidents | DispatchId, StationNumber, IncidentType, Address, DispatchedAt, Status |
| Firebase/live announcements | FirehouseAnnouncements | Message, StartsAt, EndsAt, IsActive |
| MVIX scheduling metadata | FirehousePlaylist | Requires review of source schedule rights and media locations |
| Google Sheets live-document data | SharePoint list/library TBD | Exact field parity requires original sheet contents |
| Google Sheets training schedule | TrainingSchedule list TBD | Source mapping requires existing layout |
| Roster provider | Separate roster integration | Not automatically replaced by SharePoint |

Do not migrate actual operational incidents into demo environments.
