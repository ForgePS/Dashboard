# Firehouse Dashboard — Microsoft 365 migration (phase 1)

This is an **isolated migration branch**, not a production replacement. Nothing here changes the Firebase deployment.

## Original functionality found
- `mvix-playback.js`: MVIX/live playlist and station selection
- `active911*.js`: dispatch/incident takeover workflows
- `server.js`: Node/Express server with Firebase Admin, roster, incident and schedule integration

## Target
- Native SharePoint Framework (SPFx) React web part
- SharePoint Lists for station settings, apparatus, announcements and incident records
- SharePoint document library for approved media
- Power Automate/Azure Functions for authenticated incident ingestion (NOT an unauthenticated client webhook)
- Microsoft Entra ID for staff access

## Scaffold a supported SPFx project
1. Install Node.js 22 and the latest Microsoft SPFx generator/CLI compatible with your tenant.
2. Generate a React SPFx web part named `FirehouseDashboard` in this directory using Microsoft's official generator. Use the version and toolchain from Microsoft's compatibility reference: https://learn.microsoft.com/sharepoint/dev/spfx/compatibility
3. Copy `src/FirehouseDashboard.tsx` and `src/SharePointData.ts` into the generated web part's `components` directory.
4. Pass `this.context.pageContext.web.absoluteUrl` and `this.context.spHttpClient` to the component.
5. Provision the SharePoint lists below (exact internal field names) and grant display readers access.
6. Run the generated project's production build and package command; deploy the resulting .sppkg to the tenant App Catalog with administrator approval.

This branch contains application migration code, **not** a built or tested `.sppkg`. A Microsoft 365 connection and local SPFx toolchain are not available in this session.

## SharePoint lists
- `FirehouseStations`: Title (text), StationNumber (number, indexed), IsEnabled (Yes/No), PlaylistSeconds (number)
- `FirehouseAnnouncements`: Title (text), StationNumber (number, indexed), Message (multiple lines), StartsAt (date/time), EndsAt (date/time), IsActive (Yes/No)
- `FirehouseIncidents`: Title (text), StationNumber (number, indexed), DispatchId (text, UNIQUE), Address (text), IncidentType (text), DispatchedAt (date/time), Status (text)
- `FirehousePlaylist`: Title (text), StationNumber (number, indexed), MediaUrl (hyperlink or text), DurationSeconds (number), IsEnabled (Yes/No), SortOrder (number)

Use separate list permissions: operators edit configuration; display account can read only. Do not store Active911 secrets or API keys in lists accessible to display accounts.

## Important constraints
- MVIX external playback may retain a third-party dependency; replace it with SharePoint-hosted media if complete external-service independence is required.
- The original code contains Google Sheets sources and Firebase data persistence; migrating only HTML would NOT remove Google dependency.
- Real-time Active911 ingestion needs an authorized upstream interface and server-side credentials. Never expose those credentials in a browser web part.
- Shared/public signage devices need Microsoft 365 licensing, kiosk sign-in/security and session expiry planning.
- Leave the original live dashboard in operation until feature parity, incident takeover, permissions and display recovery have been validated.
