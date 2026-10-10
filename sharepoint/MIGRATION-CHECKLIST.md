# Migration acceptance criteria

## Functional parity
- [ ] Station 1, 2, 3 views compared against existing application
- [ ] MVIX playlist ordering, refresh and content duration matched
- [ ] Station-scoped playlist, announcements and media
- [ ] Active911 authenticated incident input via approved supported interface
- [ ] Incident deduplication by DispatchId and station
- [ ] Incident takeover, cancellation, all-clear, timeout and restart
- [ ] Apparatus/roster, training schedule and daily document replaced with Microsoft data sources
- [ ] Weather/radar integrations reviewed
- [ ] Offline/network-loss behavior and stale-data warning
- [ ] 24-hour display soak test, kiosk session handling and screen recovery

## Security and reliability
- [ ] No Firebase/Google calls in browser network logs or server workflows
- [ ] No API tokens committed, exposed in page source or SharePoint read lists
- [ ] App-only credentials restricted to an approved secure server-side ingestion component
- [ ] Read-only signage identity; editors separated from readers
- [ ] Authenticated access to dispatch data; no public SharePoint list endpoints
- [ ] Retention and audit settings for incident-related records
- [ ] Alert ingestion reliability tested with an approved non-live test event

## Deployment
- [ ] Scaffold and build official SPFx 1.23.2 project
- [ ] Configure web part manifest and localization resources
- [ ] Provision lists via approved PnP.PowerShell login
- [ ] Grant tenant/site App Catalog package approval
- [ ] Test in non-production SharePoint page
- [ ] Verify SharePoint full-screen display device and licensing
- [ ] Cut over after side-by-side acceptance, then retire Firebase
