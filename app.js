const screenEl = document.getElementById('screen');
let weatherCache = null;
let weatherUpdatedAt = 0;
let lastRenderKey = null;
let lastData = { incident: null, history: [], active911: {}, persistence: {} };
let stationConfig = null;

const DISPLAY_TIME_ZONE = 'America/Chicago';

function fmtTime(value) {
  if (!value) return '--';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: DISPLAY_TIME_ZONE });
}

function clock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: DISPLAY_TIME_ZONE });
}

function secondsLeft(incident) {
  if (!incident?.expiresAt) return 0;
  return Math.max(0, Math.ceil((incident.expiresAt - Date.now()) / 1000));
}

function countdownText(incident) {
  const s = secondsLeft(incident);
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, '0');
  return `${m}:${r}`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function unitText(units) {
  if (Array.isArray(units)) return units.join(', ');
  return units || '';
}

function mapBlock(title, src, fallback, extra = '') {
  // data-src lets us compare existing map URLs and avoid reloading images unnecessarily.
  return `<div class="map-card ${extra}" data-map-src="${esc(src)}"><img src="${src}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="map-fallback">${fallback}</div></div>`;
}

async function loadWeather(force = false) {
  if (!force && weatherCache && Date.now() - weatherUpdatedAt < 60_000) return weatherCache;
  try {
    const res = await fetch('/api/weather', { cache: 'no-store' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'weather unavailable');
    weatherCache = data;
    weatherUpdatedAt = Date.now();
    return data;
  } catch {
    weatherCache = { ok: false, temp: '--', condition: 'Weather unavailable', windMph: '--', windDir: '' };
    weatherUpdatedAt = Date.now();
    return weatherCache;
  }
}

function weatherHtml() {
  const w = weatherCache || { temp: '--', condition: 'Loading Weather', windMph: '--', windDir: '' };
  const cls = w.ok === false ? 'weather-block fail' : 'weather-block';
  return `<div class="${cls}"><div><b>${esc(w.temp)}°F</b> ${esc(w.condition)}</div><div>Wind: ${esc(w.windMph)} mph ${esc(w.windDir)}</div></div>`;
}

function stationFromPath() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/station2') || path.includes('/mvix/2') || path.includes('/emergency/2')) return '2';
  if (path.includes('/station3') || path.includes('/mvix/3') || path.includes('/emergency/3')) return '3';
  if (path.includes('/station1') || path.includes('/mvix/1') || path.includes('/emergency/1')) return '1';
  return null;
}

function routeStation() {
  const params = new URLSearchParams(window.location.search);
  const station = params.get('station') || stationFromPath() || localStorage.getItem('station') || '1';
  if (['1', '2', '3'].includes(String(station))) {
    localStorage.setItem('station', String(station));
    return String(station);
  }
  if (String(station).toLowerCase() === 'station2') return '2';
  if (String(station).toLowerCase() === 'station3') return '3';
  return '1';
}

function stationLabel() {
  return stationConfig?.label || `STATION ${routeStation()}`;
}

async function loadStationConfig(force = false) {
  if (!force && stationConfig) return stationConfig;
  try {
    const res = await fetch(`/api/station-config?station=${encodeURIComponent(routeStation())}`, { cache: 'no-store' });
    const data = await res.json();
    stationConfig = data.station || null;
  } catch {
    stationConfig = { id: routeStation(), label: `STATION ${routeStation()}` };
  }
  return stationConfig;
}


function removeFooterArtifacts() {
  const banned = [
    'active911 ----> mvix',
    'active911 ---> mvix',
    'active911 → mvix',
    'active911 -> mvix',
    'active911 to mvix',
    'active911 mvix'
  ];

  document.querySelectorAll('footer, .footer, .app-footer, .bottom-footer, .bottom-bar, .pipeline, .branding-footer, .display-footer, .status-footer, #footer, #appFooter, #displayFooter').forEach(el => el.remove());

  document.querySelectorAll('body *').forEach(el => {
    if (!el || el.id === 'screen' || el.closest('#screen')) return;
    const text = (el.textContent || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (banned.some(term => text.includes(term))) el.remove();
  });
}

function systemStatusHtml(data = lastData) {
  return '';
}

function historyForDisplay(history = [], currentIncident = null) {
  const currentId = currentIncident?.id ? String(currentIncident.id) : null;
  const seen = new Set();
  return history.filter(h => {
    if (!h?.id) return false;
    if (currentId && String(h.id) === currentId) return false;
    if (seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  }).slice(0, 5);
}

function historyKey(history = []) {
  return history.slice(0, 5).map(h => `${h.id || ''}:${h.type || ''}:${h.address || ''}:${h.sent || h.startedAt || ''}`).join('|');
}

function weatherKey() {
  const w = weatherCache || {};
  return `${w.temp || ''}:${w.condition || ''}:${w.windMph || ''}:${w.windDir || ''}`;
}

function buildRenderKey(data) {
  const incident = data.incident;
  const hKey = historyKey(data.history || []);
  const wKey = weatherKey();
  const station = routeStation();
  const stationName = stationConfig?.name || '';
  if (!incident) return `idle:${station}:${stationName}:${hKey}:${wKey}`;
  // Intentionally do NOT include the countdown time. That prevents image flashing every refresh.
  return [
    'incident', station, stationName, incident.id, incident.type, incident.address,
    incident.latitude, incident.longitude, unitText(incident.units), incident.notes,
    incident.sent, hKey, wKey
  ].join(':');
}

function renderIdle(history = []) {
  const displayHistory = historyForDisplay(history, null);
  const calls = displayHistory.map(h => `<div class="history-row"><strong>${esc(h.type)}</strong><span>${esc(h.address)}</span><small>${fmtTime(h.sent || h.startedAt)}</small></div>`).join('');
  screenEl.className = 'screen idle';
  screenEl.innerHTML = `
    <header class="idle-top">
      <img class="dept-logo" src="/horn-lake-logo.png" alt="Horn Lake Fire Department" />
      <div><h1>HORN LAKE FIRE DEPARTMENT</h1><p>${stationLabel()} dashboard online. Waiting for Active911 alert.</p></div>
      <div class="idle-right"><div class="now">${clock()}</div>${weatherHtml()}</div>
    </header>
    <section class="idle-panel">
      <h2>LAST 5 INCIDENTS</h2>
      <div class="idle-history">${calls || '<span class="muted">No calls loaded.</span>'}</div>
    </section>`;
}

function renderIncident(incident, history) {
  const lat = incident.latitude;
  const lon = incident.longitude;
  const hasMap = lat && lon;
  const station = routeStation();
  const street = hasMap ? `/api/map/streetview?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&size=640x260&fov=120&pitch=-7&radius=500` : '';
  const sat = hasMap ? `/api/map/satellite?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&size=640x260` : '';
  const route = hasMap ? `/api/map/route?station=${station}&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&size=640x260` : '';
  const displayHistory = historyForDisplay(history, incident);
  const calls = displayHistory.map(h => `<div class="history-row"><strong>${esc(h.type)}</strong><span>${esc(h.address)}</span><small>${fmtTime(h.sent || h.startedAt)}</small></div>`).join('');
  const units = unitText(incident.units);
  screenEl.className = 'screen alert';
  screenEl.innerHTML = `
    <header class="topbar">
      <div class="dispatch-block"><div class="label">DISPATCHED</div><div class="big-clock">${fmtTime(incident.sent)}</div></div>
      <div class="incident-head"><h1>${esc(incident.type)}</h1><h2>${esc(incident.address)}</h2><div class="unit-strip">${esc(units)}</div></div>
      <div class="brand-weather"><img class="dept-logo" src="/horn-lake-logo.png" alt="Horn Lake Fire Department" />${weatherHtml()}</div>
      <div class="alert-countdown">CLEARS IN <b id="countdown">${countdownText(incident)}</b></div>
    </header>
    <section class="grid">
      <aside class="panel history"><h3>LAST 5 INCIDENTS</h3>${calls}</aside>
      <section class="middle-stack">
        ${hasMap ? mapBlock('STREET VIEW - FACING ADDRESS', street, `${esc(lat)}, ${esc(lon)}`, 'street-middle') : '<div class="map-card street-middle"><div class="map-fallback">No coordinates received.</div></div>'}
        <section class="panel notes"><h3>INCIDENT INFORMATION</h3><div class="notes-box notes-only">${esc(incident.notes || 'No notes received.')}</div></section>
      </section>
      <section class="maps two-maps">
        ${hasMap ? mapBlock('SATELLITE + HYDRANTS', sat, `${esc(lat)}, ${esc(lon)}`) : ''}
        ${hasMap ? mapBlock('ROUTE', route, `${esc(lat)}, ${esc(lon)}`) : ''}
      </section>
    </section>`;
}

function updateLiveFields() {
  const now = document.querySelector('.now');
  if (now) now.textContent = clock();

  const countdown = document.getElementById('countdown');
  if (countdown && lastData.incident) countdown.textContent = countdownText(lastData.incident);
}

async function refresh() {
  try {
    await loadStationConfig();
    await loadWeather();
    const res = await fetch('/api/incident', { cache: 'no-store' });
    const data = await res.json();
    lastData = {
      incident: data.incident || null,
      history: data.history || [],
      active911: data.active911 || {},
      persistence: data.persistence || {},
      serverTime: data.serverTime || null,
    };

    const nextKey = buildRenderKey(lastData);
    if (nextKey !== lastRenderKey) {
      lastRenderKey = nextKey;
      if (lastData.incident) renderIncident(lastData.incident, lastData.history);
      else renderIdle(lastData.history);
      removeFooterArtifacts();
    } else {
      updateLiveFields();
    }
  } catch (err) {
    if (lastRenderKey !== `error:${err.message}`) {
      lastRenderKey = `error:${err.message}`;
      screenEl.className = 'screen idle';
      screenEl.innerHTML = `<section class="idle-panel fail-panel"><h1>DASHBOARD FAIL-SAFE MODE</h1><p>Unable to reach dashboard server.</p><p>${esc(err.message)}</p></section>`;
    }
  }
}

removeFooterArtifacts();
refresh();
setInterval(refresh, 3000);
setInterval(updateLiveFields, 1000);
setInterval(removeFooterArtifacts, 1000);
