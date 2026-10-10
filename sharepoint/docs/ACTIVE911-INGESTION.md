# Active911 / dispatch ingestion design (not yet connected)
Do not migrate a public or browser-side Active911 token into a SharePoint page.

## Proposed Microsoft-side event path
1. Confirm the department's permitted Active911 integration method and its terms.
2. Send authorized events to an Azure Function with authentication and strict request validation (or an approved Power Automate protected endpoint where appropriate).
3. Resolve target StationNumber using configuration stored server-side; do not trust station routing solely from a public request field.
4. Normalize events: DispatchId, StationNumber, IncidentType, Address, DispatchedAt, Status.
5. Deduplicate events using a unique key based on source and dispatch identifier. Handle updates/cancellations idempotently.
6. Create/update FirehouseIncidents through app-only Microsoft Graph/SharePoint authorization with least privilege.
7. Log ingest failures and expose last successful sync to signage. No secrets in SPFx assets.
8. Test takeover and cancellation using synthetic events, then seek operational approval before connecting live dispatch.

## Operational caution
The current SharePoint dashboard polls SharePoint Lists, so it is NOT a guaranteed real-time alerting system. It is supplementary signage only. Dispatch paging and operational communications must remain independent of the dashboard.
