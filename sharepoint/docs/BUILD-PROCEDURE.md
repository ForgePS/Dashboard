# Build installable SharePoint application (SPFx)
The Microsoft generator must create the Heft build rig, manifests, dependency lockfile, localization and solution metadata. Hand-crafting a .sppkg without these is unsafe.

## Steps
1. On a workstation with Node.js 22 and npm registry access, install Yeoman and the official SPFx generator compatible with the tenant's SharePoint Online environment.
2. Generate a new React **web part** named FirehouseDashboard (use a single web part in a new project).
3. Clone or download this repository's feature/sharepoint-migration branch.
4. Run `node sharepoint/scripts/integrate-generated-spfx.mjs PATH_TO_GENERATED_PROJECT`. This copies the existing components and replaces only the generated web part controller, preserving the generator's manifest/build infrastructure.
5. Run `npm install` in the generated project, then `npx heft build --production` and `npx heft package-solution --production`.
6. Review the resulting package in `sharepoint/solution` inside the generated project. Test in a nonproduction SharePoint App Catalog/page after approval.

## Caveats
- The integrator expects exactly one generated React web part; it fails closed if it encounters an unknown scaffold.
- The integration code is **not** proof that the SPFx build passes. Resolve any compile issues in the generated environment.
- Avoid copying the old root Firebase package.json, service credentials, and Google endpoints into the replacement.
- The standalone `sharepoint/src/FirehouseDashboardWebPart.ts` is reference source; integration script creates a file matching the generator's existing class name.
- The old Firebase production application remains untouched.
