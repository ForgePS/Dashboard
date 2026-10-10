import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('SPFx integration copies components and keeps generated class identity', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(),'firehouse-spfx-'));
  try {
    const source = path.join(folder,'src/webparts/firehouseDashboard');
    fs.mkdirSync(source,{recursive:true});
    fs.writeFileSync(path.join(folder,'package.json'),'{}');
    fs.writeFileSync(path.join(source,'FirehouseDashboardWebPart.ts'),
      'export default class FirehouseDashboardWebPart extends BaseClientSideWebPart<IFirehouseDashboardWebPartProps> {}');
    const run = spawnSync(process.execPath,[path.join(root,'scripts/integrate-generated-spfx.mjs'),folder],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr);
    const output = fs.readFileSync(path.join(source,'FirehouseDashboardWebPart.ts'),'utf8');
    assert.match(output,/class FirehouseDashboardWebPart extends BaseClientSideWebPart/);
    assert.match(output,/from '.\/components\/FirehouseDashboard'/);
    assert.ok(fs.existsSync(path.join(source,'components/SignagePlayer.tsx')));
    assert.ok(fs.existsSync(path.join(source,'FirehouseDashboardWebPart.ts.pre-firehouse.bak')));
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});
