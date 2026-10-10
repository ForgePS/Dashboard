# Firehouse Dashboard SharePoint deployment runbook

## Preconditions
- Microsoft 365 site with tenant-approved SPFx custom app deployment rights
- Node.js 22 and compatible SPFx toolchain installed on a development workstation
- Test site and test display user with read-only permissions
- PnP.PowerShell app registration with approved permissions, if using provisioning script

## Build
1. Generate a supported SPFx React web part, then integrate the source under `sharepoint/src`.
2. Confirm generated package, manifest, localization and build config refer to the correct web part module.
3. Install dependencies and run lint, unit tests and production build.
4. Generate the production SharePoint solution package (.sppkg).
5. Upload to a nonproduction site or tenant App Catalog with appropriate approval.
6. Add web part to a test SharePoint page; configure station number, refresh seconds and takeover minutes.

## Operational verification
- Confirm the configured station reads only its own list records.
- Verify no Google/Firebase network requests originate from SharePoint client or back-end.
- Reproduce dispatch takeover from synthetic test data, including cancellation.
- Verify playlist media is from trusted approved sources and data remains access-controlled.
- Run a prolonged TV display and sign-in/session test.
- Compare functional parity to original application and record missing features.

## Rollback
Leave Firebase deployment active until signed acceptance. If the SharePoint rollout fails, remove/disable the test web part or revert the catalog package. Do not deactivate dispatch feeds or delete historical records during testing.

## Explicit limitations
These scripts have not provisioned lists and no SPFx package has been produced or deployed in the connected Microsoft 365 tenant.
