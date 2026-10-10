# Google/Firebase dependency inventory

Source reviewed: root package.json, server.js, mvix-playback.js, active911-config.js.

| Source | Dependency | Plan |
|---|---|---|
| package.json | firebase-admin and firebase-functions | Delete from replacement project after endpoint parity |
| server.js | Firestore access to live incident records | Replace with SharePoint incident list via secured server-side integration |
| server.js | Published Google Sheet CSV/HTML: live document | Replace with SharePoint list or document library |
| server.js | Published Google Sheet CSV: training schedule | Replace with SharePoint list |
| deploy script | Firebase hosting/functions | Use SPFx app catalog and secured Azure/Power Automate services |
| mvix-playback.js | Remote Mvix playback URL | Decide whether Mvix should remain or its content should be migrated to SharePoint |

This list is **not exhaustive**. All JavaScript/HTML/assets, API routes and configs must be scanned before signing off on 'Google-free'. Do not retire Firebase until the existing operational system is proven replaced.
