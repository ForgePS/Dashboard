#!/usr/bin/env node
// Copies the migration React sources into a freshly generated Microsoft SPFx React web part.
// Usage: node sharepoint/scripts/integrate-generated-spfx.mjs /absolute/path/to/generated-spfx
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] ? path.resolve(process.argv[2]) : '';
if (!target || !fs.existsSync(path.join(target, 'package.json'))) {
  throw new Error('Provide the generated SPFx project directory.');
}
const webparts = path.join(target, 'src', 'webparts');
if (!fs.existsSync(webparts)) throw new Error('Target has no src/webparts directory. Generate an SPFx React web part first.');
const entries = fs.readdirSync(webparts, { withFileTypes: true }).filter(e => e.isDirectory());
if (entries.length !== 1) throw new Error('Expected exactly one generated web part directory; found ' + entries.length);
const webpartDir = path.join(webparts, entries[0].name);
const generated = fs.readdirSync(webpartDir).filter(n => n.endsWith('WebPart.ts'));
if (generated.length !== 1) throw new Error('Expected exactly one generated *WebPart.ts file.');
const generatedFile = path.join(webpartDir, generated[0]);
const components = path.join(webpartDir, 'components');
fs.mkdirSync(components, { recursive: true });
const sources = ['FirehouseDashboard.tsx','SharePointData.ts','SignagePlayer.tsx','playlist.ts','incident.ts'];
for (const name of sources) fs.copyFileSync(path.join(root, 'src', name), path.join(components, name));

const original = fs.readFileSync(generatedFile, 'utf8');
const exported = original.match(/export default class\s+(\w+)\s+extends\s+BaseClientSideWebPart<([^>]+)>/);
if (!exported) throw new Error('Unknown generated SPFx web part class; do not overwrite it.');
const className = exported[1];
const propsName = exported[2];
const result = `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneSlider, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { FirehouseDashboard, DashboardProps } from './components/FirehouseDashboard';

export interface ${propsName} {
  stationNumber: string;
  refreshSeconds: number;
  takeoverMinutes: number;
}

export default class ${className} extends BaseClientSideWebPart<${propsName}> {
  public render(): void {
    const parsed = Number(this.properties.stationNumber || '1');
    const props: DashboardProps = {
      spHttpClient: this.context.spHttpClient,
      webUrl: this.context.pageContext.web.absoluteUrl,
      stationNumber: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
      refreshSeconds: this.properties.refreshSeconds || 15,
      takeoverMinutes: this.properties.takeoverMinutes || 5
    };
    ReactDom.render(React.createElement(FirehouseDashboard, props), this.domElement);
  }
  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse('1.0'); }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: 'Firehouse station display' },
      groups: [{ groupName: 'Station configuration', groupFields: [
        PropertyPaneTextField('stationNumber', {label:'Station number'}),
        PropertyPaneSlider('refreshSeconds', {label:'Refresh interval (seconds)',min:10,max:120}),
        PropertyPaneSlider('takeoverMinutes', {label:'Dispatch takeover (minutes)',min:1,max:30})
      ]}] }] };
  }
}
`;
const backup = generatedFile + '.pre-firehouse.bak';
if (!fs.existsSync(backup)) fs.copyFileSync(generatedFile, backup);
fs.writeFileSync(generatedFile, result);
console.log('Integrated Firehouse component into:', generatedFile);
console.log('Review generated manifest and package-solution.json, then run: npx heft build --production');
