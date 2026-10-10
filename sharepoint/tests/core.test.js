const assert = require('node:assert/strict');
const { test } = require('node:test');
const { activeIncident } = require('../build/incident.js');
const { mediaSource, mediaKind, orderedItems } = require('../build/playlist.js');
const t = Date.parse('2026-10-10T21:00:00Z');
const event = (status, minutesAgo=1, id=1) => ({
  Id:id, Title:'Alarm', DispatchId:'TEST-'+id, Address:'Demo Address', IncidentType:'Alarm',
  DispatchedAt:new Date(t-minutesAgo*60000).toISOString(), Status:status
});
test('fresh incident takes over; completed and canceled do not', () => {
  assert.equal(activeIncident([event('active')],t,5)?.Id,1);
  for(const status of ['closed','canceled','cancelled','cleared','completed']) {
    assert.equal(activeIncident([event(status)],t,5),undefined);
  }
  assert.equal(activeIncident([event('active',6)],t,5),undefined);
});
test('newest active incident is preferred', () => {
  assert.equal(activeIncident([event('active',4,1),event('active',1,2)],t,5)?.Id,2);
});
test('media URLs accept HTTPS and reject dangerous schemes', () => {
  assert.equal(mediaSource({MediaUrl:'javascript:alert(1)'}),undefined);
  assert.equal(mediaSource({MediaUrl:'http://example.org/p.png'}),undefined);
  assert.equal(mediaKind('https://example.org/a.PDF?x=1'),'pdf');
  assert.equal(mediaKind('https://example.org/a.mp4'),'video');
});
test('playlist filters disabled and sorts by position', () => {
  const items=[
    {Id:1,Title:'A',MediaUrl:'https://example.org/a.png',IsEnabled:true,SortOrder:2,DurationSeconds:10},
    {Id:2,Title:'B',MediaUrl:'https://example.org/b.png',IsEnabled:false,SortOrder:1,DurationSeconds:10},
    {Id:3,Title:'C',MediaUrl:'https://example.org/c.png',IsEnabled:true,SortOrder:1,DurationSeconds:10}
  ];
  assert.deepEqual(orderedItems(items).map(x=>x.Id),[3,1]);
});
