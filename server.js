// ======================================================
// HORN LAKE ACTIVE911 -> MVIX ANALYTICS + HYDRANT SERVER
// Connected full server.js
// ======================================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const buffer = require('@turf/buffer').default;
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const { point } = require('@turf/helpers');

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('ETag', '');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

function sendHtmlFileOrFallback(res, fileName, title, apiPath) {
  const filePath = path.join(__dirname, fileName);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  return res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f7f8fa; color: #18202a; }
    main { max-width: 760px; margin: 48px auto; padding: 0 20px; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    p { line-height: 1.5; }
    a { color: #075985; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>The server is running. The full display file <strong>${fileName}</strong> was not found on this deployment.</p>
    <p>Data endpoint: <a href="${apiPath}">${apiPath}</a></p>
  </main>
</body>
</html>`);
}

// ======================================================
// CONFIG
// ======================================================

const PORT = Number(process.env.PORT || 10000);
const TIME_ZONE = 'America/Chicago';

const DATA_DIR =
  process.env.DATA_DIR ||
  process.env.RENDER_DISK_PATH ||
  path.join(__dirname, 'data');

const INCIDENT_HISTORY_FILE =
  process.env.INCIDENT_HISTORY_FILE ||
  path.join(DATA_DIR, 'incident-history.json');

const DAILY_ROSTER_FILE =
  process.env.DAILY_ROSTER_FILE ||
  path.join(DATA_DIR, 'daily-roster.json');

const DAILY_ROSTER_URL =
  process.env.DAILY_ROSTER_URL ||
  'https://www.imagetrendslate.com/api/s/hlfdems/a/hornlakefi/public-roster-views/82m';

const DAILY_ROSTER_REFRESH_MS =
  Number(process.env.DAILY_ROSTER_REFRESH_MS || 30000);

const LIVE_DOCUMENT_CSV_URL =
  process.env.LIVE_DOCUMENT_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpXEJN7gWX7uSWqfCpxqsPb1M0hcAIWH_RZlZyeuTuhOYFvDxDqg_6wS6gd7XXsQswn9bcQmFJorUR/pub?gid=0&single=true&output=csv';

const LIVE_DOCUMENT_HTML_URL =
  process.env.LIVE_DOCUMENT_HTML_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpXEJN7gWX7uSWqfCpxqsPb1M0hcAIWH_RZlZyeuTuhOYFvDxDqg_6wS6gd7XXsQswn9bcQmFJorUR/pubhtml/sheet?headers=false&gid=0';

const LIVE_DOCUMENT_REFRESH_MS =
  Number(process.env.LIVE_DOCUMENT_REFRESH_MS || 30000);

const TRAINING_SCHEDULE_CSV_URL =
  process.env.TRAINING_SCHEDULE_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpXEJN7gWX7uSWqfCpxqsPb1M0hcAIWH_RZlZyeuTuhOYFvDxDqg_6wS6gd7XXsQswn9bcQmFJorUR/pub?gid=807010823&single=true&output=csv';

const TRAINING_SCHEDULE_REFRESH_MS =
  Number(process.env.TRAINING_SCHEDULE_REFRESH_MS || 30000);

const EMS_EXPIRATION_CSV_URL =
  process.env.EMS_EXPIRATION_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpXEJN7gWX7uSWqfCpxqsPb1M0hcAIWH_RZlZyeuTuhOYFvDxDqg_6wS6gd7XXsQswn9bcQmFJorUR/pub?gid=1789702326&single=true&output=csv';

const EMS_EXPIRATION_REFRESH_MS =
  Number(process.env.EMS_EXPIRATION_REFRESH_MS || 30000);

const EVENTS_CSV_URL =
  process.env.EVENTS_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpXEJN7gWX7uSWqfCpxqsPb1M0hcAIWH_RZlZyeuTuhOYFvDxDqg_6wS6gd7XXsQswn9bcQmFJorUR/pub?gid=223056177&single=true&output=csv';
const EVENTS_REFRESH_MS = Number(process.env.EVENTS_REFRESH_MS || 30000);

const HISTORICAL_INCIDENTS_CSV_FILE =
  process.env.HISTORICAL_INCIDENTS_CSV_FILE ||
  path.join(__dirname, 'historical-incidents.csv');

const HISTORICAL_MONTHLY_CSV_FILE =
  process.env.HISTORICAL_MONTHLY_CSV_FILE ||
  path.join(__dirname, 'historical-monthly-call-volume.csv');

const HISTORICAL_CALL_TYPE_CSV_FILE =
  process.env.HISTORICAL_CALL_TYPE_CSV_FILE ||
  path.join(__dirname, 'historical-call-type-volume.csv');

const HISTORICAL_LIVE_START =
  process.env.HISTORICAL_LIVE_START ||
  '';

const MAX_INCIDENT_HISTORY = Number(process.env.MAX_INCIDENT_HISTORY || 5000);
const ACTIVE911_POLL_MS = Number(process.env.ACTIVE911_POLL_MS || 15000);
const ACTIVE911_POLL_DETAIL_LIMIT = Number(process.env.ACTIVE911_POLL_DETAIL_LIMIT || 1000);

const ACTIVE911_ACCESS_TOKEN = process.env.ACTIVE911_ACCESS_TOKEN || '';
const ACTIVE911_ALERTS_URL =
  process.env.ACTIVE911_ALERTS_URL ||
  'https://access.active911.com/interface/open_api/api/alerts';

const ACTIVE911_POLLING_ENABLED =
  String(process.env.ACTIVE911_POLLING_ENABLED || 'true').toLowerCase() !== 'false';

const ACTIVE911_CLIENT_ID = process.env.ACTIVE911_CLIENT_ID || '';
const ACTIVE911_CLIENT_SECRET = process.env.ACTIVE911_CLIENT_SECRET || '';
const ACTIVE911_REFRESH_TOKEN = process.env.ACTIVE911_REFRESH_TOKEN || '';
const ACTIVE911_TOKEN_URL =
  process.env.ACTIVE911_TOKEN_URL ||
  'https://access.active911.com/interface/open_api/token.php';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const SPECIAL_ADDRESS_NOTES_FILE =
  process.env.SPECIAL_ADDRESS_NOTES_FILE ||
  path.join(DATA_DIR, 'special-address-notes.json');
const PREFIRE_PLANS_FILE =
  process.env.PREFIRE_PLANS_FILE ||
  path.join(DATA_DIR, 'pre-fire-plans.json');

const ACTIVE911_BACKFILL_START =
  process.env.ACTIVE911_BACKFILL_START ||
  '2026-01-01 00:00:01';

const ANALYTICS_HISTORY_START =
  process.env.ANALYTICS_HISTORY_START ||
  ACTIVE911_BACKFILL_START;

const ACTIVE911_BACKFILL_LIMIT = Number(process.env.ACTIVE911_BACKFILL_LIMIT || 10000);

let active911AccessToken = ACTIVE911_ACCESS_TOKEN;
const csvCache = new Map();

const INCIDENT_TYPE_CATEGORIES = {
  medical: 'MEDICAL - Medical',
  fire: 'FIRE - Fire',
  noemerg: 'NOEMERG - No Emergency',
  hazsit: 'HAZSIT - Hazardous Situation',
  pubserv: 'PUBSERV - Public Service',
  uncategorized: 'UNCATEGORIZED - Uncategorized',
  lawenforce: 'LAWENFORCE - Law Enforcement Support'
};

function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

// ======================================================
// TIME HELPERS
// ======================================================

function formatCentralDateTime(value) {
  if (!value) return '';

  return new Date(value).toLocaleString('en-US', {
    timeZone: TIME_ZONE,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function nowIso() {
  return new Date().toISOString();
}

function daysBetweenDates(start, end = new Date()) {
  const startDate = start instanceof Date ? start : parseCentralDateTime(start);
  if (Number.isNaN(startDate.getTime())) return 365;

  const diffMs = end.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)) + 1);
}

function parseCentralDateTime(value) {
  if (!value) return new Date(NaN);

  const text = String(value).trim();
  const centralTimeMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s+C[DS]T$/i
  );

  if (centralTimeMatch) {
    const [, month, day, year, hour, minute, second = '00'] = centralTimeMatch;
    return parseCentralDateTime(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${minute}:${second}`
    );
  }

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (!match) return new Date(text);

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  const utcGuess = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ));

  const centralParts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    timeZoneName: 'shortOffset',
    hour: '2-digit'
  }).formatToParts(utcGuess);
  const offset = centralParts.find((part) => part.type === 'timeZoneName')?.value || 'GMT-6';
  const offsetMatch = offset.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!offsetMatch) return utcGuess;

  const sign = offsetMatch[1] === '+' ? 1 : -1;
  const offsetMinutes = sign * ((Number(offsetMatch[2]) * 60) + Number(offsetMatch[3] || 0));

  return new Date(utcGuess.getTime() - (offsetMinutes * 60 * 1000));
}

function getCentralMonthParts(value) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(value);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;

  return { year, month, key: `${year}-${month}` };
}

function getCurrentCentralDateStart() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day} 00:00:00`;
}

// ======================================================
// PERSISTENCE
// ======================================================

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadJsonFile(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`Failed to load ${file}:`, err.message);
    return fallback;
  }
}

function saveJsonFile(file, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to save ${file}:`, err.message);
  }
}

let incidentHistory = loadJsonFile(INCIDENT_HISTORY_FILE, []);
let seenIncidentIds = new Set(incidentHistory.map((i) => i.id).filter(Boolean));
let dailyRosterCache = {
  loadedAt: null,
  error: null,
  data: null
};
let liveDocumentCache = {
  loadedAt: null,
  error: null,
  data: null
};
let trainingScheduleCache = {
  loadedAt: null,
  error: null,
  data: null
};
let emsExpirationCache = {
  loadedAt: null,
  error: null,
  data: null
};

// ======================================================
// ACTIVE911 INGESTION
// ======================================================

const active911Debug = {
  pollingEnabled: ACTIVE911_POLLING_ENABLED,
  alertsUrl: ACTIVE911_ALERTS_URL,
  hasAccessToken: Boolean(active911AccessToken),
  hasRefreshToken: Boolean(ACTIVE911_REFRESH_TOKEN),
  pollCount: 0,
  lastPollAt: null,
  lastPollSuccessAt: null,
  lastPollError: null,
  lastPollAdded: 0,
  lastPollChecked: 0,
  lastTokenRefreshAt: null,
  lastIngestAt: null,
  lastIngestSource: null,
  incidentCount: incidentHistory.length
};

async function refreshActive911Token() {
  if (!ACTIVE911_REFRESH_TOKEN || !ACTIVE911_CLIENT_ID || !ACTIVE911_CLIENT_SECRET) {
    throw new Error('Active911 refresh credentials are not fully configured');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: ACTIVE911_REFRESH_TOKEN,
    client_id: ACTIVE911_CLIENT_ID,
    client_secret: ACTIVE911_CLIENT_SECRET
  });

  const response = await fetch(ACTIVE911_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.access_token) {
    throw new Error(`Active911 token refresh failed: ${JSON.stringify(payload)}`);
  }

  active911AccessToken = payload.access_token;
  active911Debug.hasAccessToken = true;
  active911Debug.lastTokenRefreshAt = nowIso();

  return active911AccessToken;
}

async function active911Fetch(url, options = {}, retry = true) {
  if (!active911AccessToken && ACTIVE911_REFRESH_TOKEN) {
    await refreshActive911Token();
  }

  if (!active911AccessToken) {
    throw new Error('No Active911 access token or refresh token configured');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${active911AccessToken}`
    }
  });

  if (response.status === 401 && retry && ACTIVE911_REFRESH_TOKEN) {
    await refreshActive911Token();
    return active911Fetch(url, options, false);
  }

  return response;
}

function extractAlertArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.message?.alerts)) return payload.message.alerts;
  if (Array.isArray(payload?.alerts)) return payload.alerts;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.incidents)) return payload.incidents;
  return [];
}

async function fetchAlertDetail(alertRef) {
  if (!alertRef?.uri) return alertRef;

  const response = await active911Fetch(alertRef.uri, { method: 'GET' });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Alert detail HTTP ${response.status}: ${text.slice(0, 300)}`);
  }

  const detailPayload = await response.json();

  return {
    id: alertRef.id,
    uri: alertRef.uri,
    ...detailPayload,
    detailPayload
  };
}

function normalizeIncidentType(text) {
  const value = String(text || '').trim().toUpperCase();
  const code = value.split('-')[0].trim();

  if (!value) return 'UNKNOWN';

  if (code === 'MEDICAL' || code === 'HLEMS') return INCIDENT_TYPE_CATEGORIES.medical;
  if (code === 'FIRE') return INCIDENT_TYPE_CATEGORIES.fire;
  if (code === 'NOEMERG') return INCIDENT_TYPE_CATEGORIES.noemerg;
  if (code === 'HAZSIT') return INCIDENT_TYPE_CATEGORIES.hazsit;
  if (code === 'PUBSERV') return INCIDENT_TYPE_CATEGORIES.pubserv;
  if (code === 'UNCATEGORIZED') return INCIDENT_TYPE_CATEGORIES.uncategorized;
  if (code === 'LAWENFORCE') return INCIDENT_TYPE_CATEGORIES.lawenforce;
  if (code === 'FIREO' || code === 'FIREV' || code === 'FIREST' || code === 'ALMFIR') {
    return INCIDENT_TYPE_CATEGORIES.fire;
  }
  if (code === 'MVA' || code === 'MVAI' || code === 'MVAHR') {
    return INCIDENT_TYPE_CATEGORIES.noemerg;
  }
  if (code === 'HAZ' || code === 'HAZMAT' || code === 'GAS') {
    return INCIDENT_TYPE_CATEGORIES.hazsit;
  }
  if (code === 'WC' || code === 'TS' || code === 'LIFT') {
    return INCIDENT_TYPE_CATEGORIES.pubserv;
  }
  if (code === 'SUSP' || code === 'DUI' || code === '603' || code === 'DIST' || code === 'DISTD' || code === 'DISTW') {
    return INCIDENT_TYPE_CATEGORIES.lawenforce;
  }
  if (code === 'DOA' || code === 'SUICA') {
    return INCIDENT_TYPE_CATEGORIES.medical;
  }
  if (code === '911HU' || code === '911OL' || code === 'ALO' || code === 'COMP' || code === 'COMPA' || code === 'MA' || code === 'MP') {
    return INCIDENT_TYPE_CATEGORIES.noemerg;
  }

  if (
    value.includes('EMS') ||
    value.includes('MEDICAL') ||
    value.includes('CHEST') ||
    value.includes('BREATH') ||
    value.includes('SICK') ||
    value.includes('FALL') ||
    value.includes('HLEMS')
  ) {
    return INCIDENT_TYPE_CATEGORIES.medical;
  }

  if (value.includes('FIRE') || value.includes('SMOKE') || value.includes('STRUCTURE')) {
    return INCIDENT_TYPE_CATEGORIES.fire;
  }

  if (
    value.includes('MVC') ||
    value.includes('MVA') ||
    value.includes('ACCIDENT') ||
    value.includes('CRASH')
  ) {
    return INCIDENT_TYPE_CATEGORIES.noemerg;
  }

  if (value.includes('ALARM')) return INCIDENT_TYPE_CATEGORIES.noemerg;
  if (value.includes('HAZMAT') || value.includes('GAS LEAK')) return INCIDENT_TYPE_CATEGORIES.hazsit;
  if (value.includes('RESCUE')) return INCIDENT_TYPE_CATEGORIES.noemerg;
  if (value.includes('SERVICE') || value.includes('LIFT ASSIST')) return INCIDENT_TYPE_CATEGORIES.pubserv;

  return INCIDENT_TYPE_CATEGORIES.uncategorized;
}

function parseActive911Date(value) {
  if (!value) return new Date();

  const text = String(value).trim();
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const normalized = new Date(text.replace(' ', 'T') + 'Z');
  return Number.isNaN(normalized.getTime()) ? new Date() : normalized;
}

function normalizeAlertPayload(raw, source) {
  const payload = raw || {};

  const alert =
    payload?.message?.alert ||
    payload?.alert ||
    payload?.detailPayload?.message?.alert ||
    payload?.detailPayload?.alert ||
    payload;

  const id = String(alert.id || payload.id || '').trim();
  const nature = alert.description || alert.cad_code || alert.details || alert.type || 'UNKNOWN';
  const address = alert.address || payload.address || '';
  const businessName = alert.place || alert.unit || alert.units || payload.businessName || '';
  const sentCandidate = alert.sent || alert.received || payload.sent || payload.received || '';
  const sent = parseActive911Date(sentCandidate).toISOString();
  const type = normalizeIncidentType(nature || payload.type);

  const fallbackId =
    id ||
    `${sent}|${type}|${String(address).toUpperCase()}|${String(businessName).toUpperCase()}`;

  return {
    id: fallbackId,
    type,
    rawType: alert.description || payload.rawType || '',
    address: String(address || '').toUpperCase(),
    businessName: String(businessName || ''),
    city: alert.city || payload.city || '',
    state: alert.state || payload.state || '',
    cadCode: alert.cad_code || payload.cadCode || '',
    units: alert.units || payload.units || '',
    latitude: alert.latitude || payload.latitude || '',
    longitude: alert.longitude || payload.longitude || '',
    sent,
    timeLabel: formatCentralDateTime(sent),
    source,
    receivedAt: nowIso(),
    raw: alert
  };
}

function addIncident(raw, source = 'unknown') {
  const incident = normalizeAlertPayload(raw, source);

  if (!incident.id) return null;
  if (seenIncidentIds.has(incident.id)) return null;

  seenIncidentIds.add(incident.id);
  incidentHistory.unshift(incident);
  incidentHistory = incidentHistory.slice(0, MAX_INCIDENT_HISTORY);
  seenIncidentIds = new Set(incidentHistory.map((i) => i.id).filter(Boolean));

  saveJsonFile(INCIDENT_HISTORY_FILE, incidentHistory);

  active911Debug.lastIngestAt = nowIso();
  active911Debug.lastIngestSource = source;
  active911Debug.incidentCount = incidentHistory.length;

  return incident;
}

// ======================================================
// DAILY ROSTER INGESTION
// ======================================================

const ROSTER_LAYOUT = [
  {
    station: 'Battalion',
    left: [{ name: 'Battalion 1', source: '105', required: 1, supportSlots: 1 }],
    right: null
  },
  {
    station: 'Station 1',
    left: [{ name: 'Rescue 1', source: 'Rescue 1', required: 4, supportSlots: 2 }],
    right: { name: 'Unit 1', source: 'Unit 1', required: 2, supportSlots: 2 }
  },
  {
    station: 'Station 2',
    left: [{ name: 'Engine 2', source: 'Engine 2', required: 4, supportSlots: 2 }],
    right: { name: 'Unit 2', source: 'Unit 2', required: 2, supportSlots: 2 }
  },
  {
    station: 'Station 3',
    left: [
      { name: 'Engine 3', source: 'Engine 3', required: 4, supportSlots: 2 },
      { name: 'Truck 3', source: 'Truck 3', required: 3, supportSlots: 2 }
    ],
    right: { name: 'Unit 3', source: 'Unit 3', required: 2, supportSlots: 2 }
  }
];

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(value) {
  return decodeHtml(String(value || '').replace(/<[^>]+>/g, ''));
}

function extractFirstMatch(text, regex) {
  const match = String(text || '').match(regex);
  return match ? stripHtml(match[1]) : '';
}

function parseSlateRosterHtml(html) {
  const dateLabel = extractFirstMatch(html, /<h2[^>]*class=["']date-title["'][^>]*>([\s\S]*?)<\/h2>/i);
  const title = extractFirstMatch(html, /<h1[^>]*class=["']page-title["'][^>]*>([\s\S]*?)<\/h1>/i);
  const resources = {};
  const tbodyRegex = /<tbody>([\s\S]*?)<\/tbody>/gi;
  let tbodyMatch;

  while ((tbodyMatch = tbodyRegex.exec(html)) !== null) {
    const section = tbodyMatch[1];
    const resourceName = extractFirstMatch(
      section,
      /<tr[^>]*class=["']resource-shift-row["'][^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/i
    );

    if (!resourceName) continue;

    const baseName = resourceName.split('|')[0].trim();
    const shift = resourceName.includes('|') ? resourceName.split('|').slice(1).join('|').trim() : '';
    const personnel = [];
    const rowRegex = /<tr(?![^>]*resource-shift-row)[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(section)) !== null) {
      const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => stripHtml(cell[1]));
      if (cells.length < 7) continue;

      const position = cells[1];
      const required = cells[2];
      const name = cells[3];
      const hours = cells[4];
      const startTime = cells[5];
      const endTime = cells[6];

      if (!name) continue;

      personnel.push({
        position,
        required,
        name,
        hours,
        startTime,
        endTime,
        isPartial: Number(hours) > 0 && Number(hours) < 24,
        isTradeOrExtra: String(required || '').toLowerCase() === 'no'
      });
    }

    resources[baseName.toUpperCase()] = {
      resourceName,
      baseName,
      shift,
      personnel
    };
  }

  return {
    ok: true,
    title: title || 'HL Fire Daily Roster',
    dateLabel,
    source: DAILY_ROSTER_URL,
    fetchedAt: nowIso(),
    fetchedAtLabel: formatCentralDateTime(new Date()),
    resources
  };
}

function findRosterResource(parsed, sourceName) {
  if (!sourceName) return null;

  const key = String(sourceName).toUpperCase();
  return parsed.resources[key] || null;
}

function buildRosterApparatus(parsed, config) {
  const source = findRosterResource(parsed, config.source);
  const personnel = source?.personnel || [];
  const primary = sortRosterPersonnel(personnel.slice(0, config.required));
  const extras = sortRosterPersonnel(personnel.slice(config.required));
  const supportRows = [...extras];

  while (supportRows.length < config.supportSlots) {
    supportRows.push({
      name: '',
      position: '1/2 Shift / Trade',
      hours: '',
      isPlaceholder: true
    });
  }

  while (primary.length < config.required) {
    primary.push({
      name: '',
      position: 'Open Seat',
      hours: '',
      isVacant: true
    });
  }

  return {
    name: config.name,
    source: config.source,
    shift: source?.shift || '',
    required: config.required,
    personnel: primary,
    supportRows,
    totalAssigned: personnel.length
  };
}

function rosterPositionRank(person) {
  const position = String(person?.position || '').toUpperCase();

  if (position.includes('BATTALION')) return 0;
  if (position.includes('PARAMEDIC')) return 1;
  if (position.includes('EMT')) return 2;
  if (position.includes('LIEUTENANT') || position.includes('CAPTAIN')) return 1;
  if (position.includes('DRIVER')) return 2;
  if (position.includes('FIREFIGHTER')) return 3;
  return 9;
}

function sortRosterPersonnel(personnel) {
  return [...personnel].sort((a, b) => {
    const rankDiff = rosterPositionRank(a) - rosterPositionRank(b);
    if (rankDiff) return rankDiff;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

function shapeDailyRoster(parsed) {
  return {
    ok: true,
    title: parsed.title,
    dateLabel: parsed.dateLabel,
    updated: parsed.fetchedAt,
    updatedLabel: parsed.fetchedAtLabel,
    source: parsed.source,
    refreshMs: DAILY_ROSTER_REFRESH_MS,
    rows: ROSTER_LAYOUT.map((row) => ({
      station: row.station,
      left: row.left.map((apparatus) => buildRosterApparatus(parsed, apparatus)),
      right: row.right ? buildRosterApparatus(parsed, row.right) : null
    }))
  };
}

async function fetchDailyRoster(force = false) {
  const now = Date.now();
  const loadedAt = dailyRosterCache.loadedAt ? new Date(dailyRosterCache.loadedAt).getTime() : 0;

  if (!force && dailyRosterCache.data && now - loadedAt < DAILY_ROSTER_REFRESH_MS) {
    return dailyRosterCache.data;
  }

  try {
    const response = await fetch(DAILY_ROSTER_URL, {
      headers: {
        Accept: 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`Slate roster HTTP ${response.status}`);
    }

    const html = await response.text();
    const parsed = parseSlateRosterHtml(html);
    const shaped = shapeDailyRoster(parsed);

    dailyRosterCache = {
      loadedAt: nowIso(),
      error: null,
      data: shaped
    };

    saveJsonFile(DAILY_ROSTER_FILE, shaped);
    return shaped;
  } catch (err) {
    const fallback = dailyRosterCache.data || loadJsonFile(DAILY_ROSTER_FILE, null);

    dailyRosterCache.error = err.message;

    if (fallback) {
      return {
        ...fallback,
        ok: true,
        stale: true,
        error: err.message
      };
    }

    throw err;
  }
}

async function pollActive911() {
  if (!ACTIVE911_POLLING_ENABLED) return;

  active911Debug.pollCount++;
  active911Debug.lastPollAt = nowIso();

  try {
    const response = await active911Fetch(ACTIVE911_ALERTS_URL, { method: 'GET' });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Active911 HTTP ${response.status}: ${text.slice(0, 300)}`);
    }

    const payload = await response.json();
    const alertRefs = extractAlertArray(payload);

    let added = 0;
    let checked = 0;

    for (const alertRef of alertRefs.slice(0, ACTIVE911_POLL_DETAIL_LIMIT)) {
      checked++;

      if (alertRef?.id && seenIncidentIds.has(String(alertRef.id))) {
        continue;
      }

      try {
        const fullAlert = await fetchAlertDetail(alertRef);
        const incident = addIncident(fullAlert, 'active911-poll');
        if (incident) added++;
      } catch (detailErr) {
        console.error(`Failed to fetch Active911 alert detail ${alertRef?.id || ''}: ${detailErr.message}`);
      }
    }

    active911Debug.lastPollSuccessAt = nowIso();
    active911Debug.lastPollError = null;
    active911Debug.lastPollAdded = added;
    active911Debug.lastPollChecked = checked;
    active911Debug.incidentCount = incidentHistory.length;
  } catch (err) {
    active911Debug.lastPollError = err.message;
    console.error('Active911 polling error:', err.message);
  }
}

async function fetchActive911AlertList(page = 1, start = ACTIVE911_BACKFILL_START, limit = ACTIVE911_BACKFILL_LIMIT) {
  const alertDays = daysBetweenDates(start);
  const url = buildUrl(ACTIVE911_ALERTS_URL, {
    page,
    start,
    limit,
    per_page: limit,
    alert_days: alertDays
  });
  const response = await active911Fetch(url, { method: 'GET' });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Active911 page ${page} HTTP ${response.status}: ${text.slice(0, 250)}`);
  }

  return response.json();
}

// ======================================================
// ANALYTICS HELPERS
// ======================================================

function readCsvRows(file) {
  if (!fs.existsSync(file)) return [];

  const stat = fs.statSync(file);
  const cached = csvCache.get(file);

  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return cached.rows;
  }

  const raw = fs.readFileSync(file, 'utf8');
  const parsedRows = parseCsvText(raw);
  if (parsedRows.length < 2) return [];

  const headers = parsedRows[0].map(normalizeHeader);

  const rows = parsedRows.slice(1).map((values) => {
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    return row;
  });

  csvCache.set(file, {
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    rows
  });

  return rows;
}

function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      if (row.some((value) => String(value).trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => String(value).trim() !== '')) rows.push(row);
  }

  return rows;
}

function getCsvValue(row, names) {
  for (const name of names) {
    const key = normalizeHeader(name);
    const value = row[key];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function compactCsvRows(rows) {
  return rows
    .map((row) => {
      const copy = [...row];
      while (copy.length && String(copy[copy.length - 1] || '').trim() === '') {
        copy.pop();
      }
      return copy.map((value) => String(value || '').trim());
    })
    .filter((row) => row.some((value) => value));
}

function rowSlice(row, start, end) {
  return row.slice(start, end).map((value) => String(value || '').trim());
}

function decodeHtmlEntity(entity) {
  const value = String(entity || '');
  const numeric = value.match(/^#(\d+)$/);
  const hex = value.match(/^#x([0-9a-f]+)$/i);

  if (numeric) return String.fromCodePoint(Number(numeric[1]));
  if (hex) return String.fromCodePoint(parseInt(hex[1], 16));

  return {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' '
  }[value] || `&${value};`;
}

function stripHtmlCell(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&([^;]+);/g, (_, entity) => decodeHtmlEntity(entity))
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePublishedSheetHtmlRows(html) {
  const tableMatch = String(html || '').match(/<table[\s\S]*?<\/table>/i);
  if (!tableMatch) return [];

  const rows = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(tableMatch[0])) !== null) {
    const row = [];
    const cellRegex = /<td\b([^>]*)>([\s\S]*?)<\/td>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      const attrs = cellMatch[1] || '';
      const colspan = Math.max(1, Number((attrs.match(/colspan="(\d+)"/i) || [])[1] || 1));
      const value = stripHtmlCell(cellMatch[2]);

      row.push(value);
      for (let i = 1; i < colspan; i++) row.push(value);
    }

    if (row.some((value) => value)) rows.push(row);
  }

  return rows;
}

function sectionRows(rows, startIndex, columns, includePredicate) {
  const output = [];

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[0] || '').trim() === 'OOS Equipment') break;

    const values = rowSlice(row, columns[0], columns[1]);
    if (includePredicate(values, row)) output.push(values);
  }

  return output;
}

function parseSheetDate(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

  if (!match) return null;

  const [, month, day, yearText] = match;
  const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
  const date = new Date(year, Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateRange(value) {
  const parts = String(value || '').split('-').map((part) => part.trim());
  const start = parseSheetDate(parts[0]);
  const end = parseSheetDate(parts[1] || parts[0]);

  return { start, end };
}

function sortAndFilterTrainingRows(rows) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rows
    .map((row) => {
      const range = parseDateRange(row[2]);
      return { row, start: range.start, end: range.end };
    })
    .filter((item) => !item.end || item.end >= today)
    .sort((a, b) => {
      const aTime = a.start ? a.start.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.start ? b.start.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .map((item) => item.row);
}

function shapeLiveDocumentRows(rows) {
  const cleanRows = compactCsvRows(rows);
  const oosIndex = cleanRows.findIndex((row) => row[0] === 'OOS Equipment');
  const oosHeaderIndex = oosIndex >= 0 ? oosIndex + 1 : -1;
  const inlineOosIndex = cleanRows[0]?.findIndex((value) => String(value || '').trim() === 'OOS Equipment') ?? -1;

  const unitStatus = {
    title: cleanRows[0]?.[0] || 'Unit Status',
    headers: rowSlice(cleanRows[1] || [], 0, 4),
    rows: sectionRows(cleanRows, 2, [0, 4], (values) => values[0])
  };

  const trainingSchedule = {
    title: cleanRows[0]?.[6] || 'Training Schedule',
    headers: ['Name', 'Course', 'Date', 'Status'],
    rows: sortAndFilterTrainingRows(
      sectionRows(cleanRows, 1, [6, 10], (values) => values[0])
    )
  };

  const oosEquipment = inlineOosIndex >= 0 ? {
    title: cleanRows[0][inlineOosIndex] || 'OOS Equipment',
    headers: rowSlice(cleanRows[1] || [], inlineOosIndex, inlineOosIndex + 3),
    rows: sectionRows(cleanRows, 2, [inlineOosIndex, inlineOosIndex + 3], (values) => values[0])
  } : {
    title: oosIndex >= 0 ? cleanRows[oosIndex][0] : 'OOS Equipment',
    headers: oosHeaderIndex >= 0 ? rowSlice(cleanRows[oosHeaderIndex] || [], 0, 3) : [],
    rows: []
  };

  const emsExpirations = {
    title: oosIndex >= 0 ? cleanRows[oosIndex][3] : 'EMS Expiration Dates',
    headers: oosHeaderIndex >= 0 ? rowSlice(cleanRows[oosHeaderIndex] || [], 3, 6) : [],
    rows: []
  };

  if (inlineOosIndex < 0 && oosHeaderIndex >= 0) {
    for (let i = oosHeaderIndex + 1; i < cleanRows.length; i++) {
      const row = cleanRows[i];
      const oosValues = rowSlice(row, 0, 3);
      const emsValues = rowSlice(row, 3, 6);

      if (oosValues[0]) oosEquipment.rows.push(oosValues);
      if (emsValues[0]) emsExpirations.rows.push(emsValues);
    }
  }

  return {
    unitStatus,
    trainingSchedule,
    oosEquipment,
    emsExpirations
  };
}

function buildLiveDocumentFallback(error) {
  const sections = {
    unitStatus: {
      title: 'Unit Status',
      headers: ['Name', 'Model', 'Status', 'Comments'],
      rows: [
        ['Rescue 1', 'Pierce', 'In Service', ''],
        ['Engine 2', 'Pierce', 'In Service', ''],
        ['Engine 3', 'Pierce', 'In Service', ''],
        ['Engine 4', 'E-One', 'Reserve', ''],
        ['Truck 1', 'E-One', 'Reserve', ''],
        ['Truck 3', 'Pierce', 'In Service', ''],
        ['Unit 1', 'Ford', 'OOS in Shop', ''],
        ['Unit 2', 'Ford', 'In Service', ''],
        ['Unit 3', 'Ford', 'In Service', ''],
        ['Unit 4', 'Ford', 'Reserve', ''],
        ['Unit 5', 'Ford', 'In Service', ''],
        ['FD 2', 'Ford', 'In Service', ''],
        ['FD 3', 'Chevrolet', 'In Service', ''],
        ['FD 4', 'Ford', 'In Service', ''],
        ['FD 5', 'Chevrolet', 'In Service', ''],
        ['Water Truck', '', 'In Service', '']
      ]
    },
    oosEquipment: {
      title: 'OOS Equipment',
      headers: ['Item', 'Item Description', 'Date OOS'],
      rows: [['Airpack', 'E3C', '3/15/2026']]
    }
  };

  return {
    ok: true,
    title: 'Unit Status & OOS',
    source: LIVE_DOCUMENT_CSV_URL,
    updated: nowIso(),
    updatedLabel: formatCentralDateTime(new Date()),
    refreshMs: LIVE_DOCUMENT_REFRESH_MS,
    stale: true,
    error,
    sections
  };
}

async function fetchLiveDocumentRows() {
  const csvResponse = await fetch(LIVE_DOCUMENT_CSV_URL, {
    headers: {
      Accept: 'text/csv,text/plain'
    }
  });

  if (csvResponse.ok) {
    return {
      rows: parseCsvText(await csvResponse.text()),
      source: LIVE_DOCUMENT_CSV_URL
    };
  }

  const csvError = `Google Sheet CSV HTTP ${csvResponse.status}`;
  const htmlResponse = await fetch(LIVE_DOCUMENT_HTML_URL, {
    headers: {
      Accept: 'text/html'
    }
  });

  if (!htmlResponse.ok) {
    throw new Error(`${csvError}; HTML HTTP ${htmlResponse.status}`);
  }

  const rows = parsePublishedSheetHtmlRows(await htmlResponse.text());
  if (!rows.length) {
    throw new Error(`${csvError}; HTML table was empty`);
  }

  return {
    rows,
    source: LIVE_DOCUMENT_HTML_URL
  };
}

async function fetchLiveDocument(force = false) {
  const now = Date.now();
  const loadedAt = liveDocumentCache.loadedAt ? new Date(liveDocumentCache.loadedAt).getTime() : 0;

  if (!force && liveDocumentCache.data && now - loadedAt < LIVE_DOCUMENT_REFRESH_MS) {
    return liveDocumentCache.data;
  }

  try {
    const { rows, source } = await fetchLiveDocumentRows();
    const sections = shapeLiveDocumentRows(rows);
    const data = {
      ok: true,
      title: 'Unit Status & OOS',
      source,
      updated: nowIso(),
      updatedLabel: formatCentralDateTime(new Date()),
      refreshMs: LIVE_DOCUMENT_REFRESH_MS,
      rawRows: compactCsvRows(rows),
      sections
    };

    liveDocumentCache = {
      loadedAt: nowIso(),
      error: null,
      data
    };

    return data;
  } catch (err) {
    liveDocumentCache.error = err.message;

    if (liveDocumentCache.data) {
      return {
        ...liveDocumentCache.data,
        stale: true,
        error: err.message
      };
    }

    return buildLiveDocumentFallback(err.message);
  }
}

function shapeTrainingScheduleRows(rows) {
  const cleanRows = compactCsvRows(rows);
  const title = cleanRows[0]?.[0] || 'Training Schedule';
  const dataRows = cleanRows.slice(1).filter((row) => row[0]);

  return {
    title,
    headers: ['Name', 'Course', 'Date', 'Status'],
    rows: sortAndFilterTrainingRows(
      dataRows.map((row) => rowSlice(row, 0, 4))
    )
  };
}

async function fetchTrainingSchedule(force = false) {
  const now = Date.now();
  const loadedAt = trainingScheduleCache.loadedAt ? new Date(trainingScheduleCache.loadedAt).getTime() : 0;

  if (!force && trainingScheduleCache.data && now - loadedAt < TRAINING_SCHEDULE_REFRESH_MS) {
    return trainingScheduleCache.data;
  }

  try {
    const response = await fetch(TRAINING_SCHEDULE_CSV_URL, {
      headers: {
        Accept: 'text/csv,text/plain'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Sheet HTTP ${response.status}`);
    }

    const csv = await response.text();
    const rows = parseCsvText(csv);
    const section = shapeTrainingScheduleRows(rows);
    const data = {
      ok: true,
      title: section.title,
      source: TRAINING_SCHEDULE_CSV_URL,
      updated: nowIso(),
      updatedLabel: formatCentralDateTime(new Date()),
      refreshMs: TRAINING_SCHEDULE_REFRESH_MS,
      section
    };

    trainingScheduleCache = {
      loadedAt: nowIso(),
      error: null,
      data
    };

    return data;
  } catch (err) {
    trainingScheduleCache.error = err.message;

    if (trainingScheduleCache.data) {
      return {
        ...trainingScheduleCache.data,
        stale: true,
        error: err.message
      };
    }

    throw err;
  }
}

function shapeEmsExpirationRows(rows) {
  const cleanRows = compactCsvRows(rows);
  const title = cleanRows[0]?.[0] || 'EMS Expiration Dates';
  const headers = rowSlice(cleanRows[1] || [], 0, 3);
  const dataRows = cleanRows.slice(2).filter((row) => row[0]);

  return {
    title,
    headers: headers.length ? headers : ['Name', 'Certification', 'Expiration Date'],
    rows: dataRows.map((row) => rowSlice(row, 0, 3))
  };
}

function buildEmsExpirationFallback(error) {
  return {
    ok: true,
    title: 'EMS Expiration Dates',
    source: EMS_EXPIRATION_CSV_URL,
    updated: nowIso(),
    updatedLabel: formatCentralDateTime(new Date()),
    refreshMs: EMS_EXPIRATION_REFRESH_MS,
    stale: true,
    error,
    section: {
      title: 'EMS Expiration Dates',
      headers: ['Name', 'Certification', 'Expiration Date'],
      rows: []
    }
  };
}

async function fetchEmsExpirations(force = false) {
  const now = Date.now();
  const loadedAt = emsExpirationCache.loadedAt ? new Date(emsExpirationCache.loadedAt).getTime() : 0;

  if (!force && emsExpirationCache.data && now - loadedAt < EMS_EXPIRATION_REFRESH_MS) {
    return emsExpirationCache.data;
  }

  try {
    const response = await fetch(EMS_EXPIRATION_CSV_URL, {
      headers: {
        Accept: 'text/csv,text/plain'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Sheet HTTP ${response.status}`);
    }

    const csv = await response.text();
    const rows = parseCsvText(csv);
    const section = shapeEmsExpirationRows(rows);
    const data = {
      ok: true,
      title: section.title,
      source: EMS_EXPIRATION_CSV_URL,
      updated: nowIso(),
      updatedLabel: formatCentralDateTime(new Date()),
      refreshMs: EMS_EXPIRATION_REFRESH_MS,
      section
    };

    emsExpirationCache = {
      loadedAt: nowIso(),
      error: null,
      data
    };

    return data;
  } catch (err) {
    emsExpirationCache.error = err.message;

    if (emsExpirationCache.data) {
      return {
        ...emsExpirationCache.data,
        stale: true,
        error: err.message
      };
    }

    return buildEmsExpirationFallback(err.message);
  }
}

function parseEventDate(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  let match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\b.*)?$/);

  if (match) {
    const [, month, day, yearText] = match;
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
    const date = new Date(year, Number(month) - 1, Number(day), 12, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);

  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const monthMatch = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
  const dayMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);

  if (monthMatch && dayMatch) {
    const monthMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11
    };
    const yearMatch = text.match(/\b(20\d{2})\b/);
    const month = monthMap[monthMatch[1].slice(0, 3).toLowerCase()];
    const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
    const date = new Date(year, month, Number(dayMatch[1]), 12, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(text);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatShortEventDate(date) {
  if (!date || Number.isNaN(date.getTime())) return '--';

  return date.toLocaleDateString('en-US', {
    timeZone: TIME_ZONE,
    month: 'short',
    day: 'numeric'
  });
}

function formatEventDate(value) {
  const text = String(value || '').trim();
  const monthMatch = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
  const days = [...text.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)?\b/g)]
    .map((match) => Number(match[1]))
    .filter((day) => day >= 1 && day <= 31);

  if (monthMatch && days.length > 1) {
    const start = parseEventDate(`${monthMatch[1]} ${days[0]}`);
    const endDay = days[days.length - 1];
    return `${formatShortEventDate(start)}-${endDay}`;
  }

  const date = parseEventDate(value);
  if (!date) return String(value || '').trim() || '--';

  return formatShortEventDate(date);
}

function getEventMonthKey(value) {
  const date = parseEventDate(value);
  if (!date) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function shapeEventRows(rows) {
  const cleanRows = compactCsvRows(rows);
  if (cleanRows.length < 2) return [];

  const headers = cleanRows[0].map(normalizeHeader);

  return cleanRows.slice(1)
    .map((values, index) => {
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      const title = getCsvValue(row, ['title', 'event', 'event_name', 'name']);
      const date = getCsvValue(row, ['date', 'event_date', 'start_date']);
      const time = getCsvValue(row, ['time', 'event_time', 'start_time']);
      const location = getCsvValue(row, ['location', 'place', 'venue']);
      const category = getCsvValue(row, ['category', 'type', 'event_type']);
      const status = getCsvValue(row, ['status']);
      const notes = getCsvValue(row, ['notes', 'description', 'details']);
      const owner = getCsvValue(row, ['owner', 'contact', 'lead']);
      const sortDate = parseEventDate(date);
      const fallbackTitle = [category, location, date]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join(' - ');

      return {
        id: getCsvValue(row, ['id']) || `event-${index + 1}`,
        title: title || fallbackTitle || 'Untitled Event',
        date,
        dateLabel: formatEventDate(date),
        startDateLabel: formatShortEventDate(sortDate),
        monthKey: getEventMonthKey(date),
        time: time || '--',
        location: location || '--',
        category,
        status: status || 'Scheduled',
        notes,
        owner,
        sortTime: sortDate ? sortDate.getTime() : Number.MAX_SAFE_INTEGER
      };
    })
    .filter((event) => {
      const values = [
        event.title,
        event.date,
        event.time,
        event.location,
        event.category,
        event.status,
        event.notes,
        event.owner
      ];

      return values.some((value) => {
        const text = String(value || '').trim();
        return text && text !== '--' && text !== 'Scheduled';
      });
    })
    .sort((a, b) => a.sortTime - b.sortTime);
}

function fallbackEvents() {
  return [
    {
      id: 'sample-1',
      title: 'Sheet Not Connected',
      date: '',
      dateLabel: 'Ready',
      time: '--',
      location: 'Add EVENTS_CSV_URL',
      category: 'Setup',
      status: 'Waiting',
      notes: 'Publish a Google Sheet as CSV and set EVENTS_CSV_URL to make this page live.',
      owner: '',
      sortTime: Number.MAX_SAFE_INTEGER
    }
  ];
}

async function fetchEvents(force = false) {
  const now = Date.now();
  const loadedAt = eventsCache.loadedAt ? new Date(eventsCache.loadedAt).getTime() : 0;

  if (!force && eventsCache.data && now - loadedAt < EVENTS_REFRESH_MS) {
    return eventsCache.data;
  }

  if (!EVENTS_CSV_URL) {
    const data = {
      ok: true,
      title: 'Events',
      source: '',
      connected: false,
      updated: nowIso(),
      updatedLabel: formatCentralDateTime(new Date()),
      refreshMs: EVENTS_REFRESH_MS,
      events: fallbackEvents()
    };

    eventsCache = { loadedAt: nowIso(), data, error: null };
    return data;
  }

  try {
    const response = await fetch(EVENTS_CSV_URL, {
      headers: {
        Accept: 'text/csv,text/plain'
      }
    });

    if (!response.ok) {
      throw new Error(`Events sheet HTTP ${response.status}`);
    }

    const events = shapeEventRows(parseCsvText(await response.text()));
    const data = {
      ok: true,
      title: 'Events',
      source: EVENTS_CSV_URL,
      connected: true,
      updated: nowIso(),
      updatedLabel: formatCentralDateTime(new Date()),
      refreshMs: EVENTS_REFRESH_MS,
      events
    };

    eventsCache = { loadedAt: nowIso(), data, error: null };
    return data;
  } catch (err) {
    eventsCache.error = err.message;

    if (eventsCache.data) {
      return {
        ...eventsCache.data,
        stale: true,
        error: err.message
      };
    }

    throw err;
  }
}

function parseCount(value) {
  const parsed = Number(String(value || '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseMonthKeyFromCsv(row) {
  const monthKey = getCsvValue(row, ['month_key', 'monthkey', 'yyyy_mm', 'year_month']);
  if (/^\d{4}-\d{2}$/.test(String(monthKey).trim())) return String(monthKey).trim();

  const year = getCsvValue(row, ['year', 'yr']);
  const month = getCsvValue(row, ['month_number', 'month_num', 'month']);

  if (/^\d{4}$/.test(String(year).trim())) {
    const monthText = String(month || '').trim();
    const monthNumber = /^\d{1,2}$/.test(monthText)
      ? Number(monthText)
      : new Date(`${monthText} 1, ${year}`).getMonth() + 1;

    if (Number.isFinite(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
      return `${year}-${String(monthNumber).padStart(2, '0')}`;
    }
  }

  const dateText = getCsvValue(row, ['date', 'sent', 'dispatch_date', 'month_start', 'period']);
  const parsed = parseCentralDateTime(dateText);
  if (!Number.isNaN(parsed.getTime())) return getCentralMonthParts(parsed).key;

  return '';
}

function loadHistoricalIncidentRows() {
  return readCsvRows(HISTORICAL_INCIDENTS_CSV_FILE)
    .map((row, index) => {
      const sentCandidate = getCsvValue(row, [
        'sent',
        'date',
        'datetime',
        'dispatch_time',
        'dispatch_date',
        'received',
        'created_at'
      ]);
      const sentDate = parseCentralDateTime(sentCandidate);

      if (Number.isNaN(sentDate.getTime())) return null;

      const nature = getCsvValue(row, ['type', 'call_type', 'nature', 'description', 'cad_code']);
      const address = getCsvValue(row, ['address', 'location', 'incident_address']);
      const businessName = getCsvValue(row, ['business_name', 'business', 'place', 'location_name']);
      const id = getCsvValue(row, ['id', 'incident_id', 'alert_id', 'cad_id']) ||
        `historical-csv-${sentDate.toISOString()}-${address}-${index}`;

      return {
        id: String(id),
        type: normalizeIncidentType(nature),
        rawType: String(nature || ''),
        address: String(address || '').toUpperCase(),
        businessName: String(businessName || ''),
        sent: sentDate.toISOString(),
        timeLabel: formatCentralDateTime(sentDate),
        source: 'historical-csv',
        receivedAt: sentDate.toISOString(),
        raw: row
      };
    })
    .filter(Boolean);
}

function loadHistoricalMonthlyRows() {
  return readCsvRows(HISTORICAL_MONTHLY_CSV_FILE)
    .map((row) => {
      const monthKey = parseMonthKeyFromCsv(row);
      if (!monthKey) return null;

      const fire = parseCount(getCsvValue(row, ['fire', 'fires', 'fire_calls']));
      const ems = parseCount(getCsvValue(row, ['ems', 'medical', 'ems_calls']));
      const total = parseCount(getCsvValue(row, ['total', 'calls', 'call_volume', 'total_calls']));
      const otherValue = parseCount(getCsvValue(row, ['other', 'other_calls']));
      const other = otherValue || Math.max(0, total - fire - ems);

      return {
        monthKey,
        total: total || fire + ems + other,
        fire,
        ems,
        other
      };
    })
    .filter(Boolean);
}

function loadHistoricalCallTypeRows() {
  return readCsvRows(HISTORICAL_CALL_TYPE_CSV_FILE)
    .map((row) => {
      const typeText = getCsvValue(row, ['alert_type', 'call_type', 'type', 'category']);
      const volume = parseCount(getCsvValue(row, ['volume', 'total', 'calls', 'count']));

      if (!typeText || !volume) return null;

      return {
        type: normalizeIncidentType(typeText),
        rawType: String(typeText),
        volume
      };
    })
    .filter(Boolean);
}

function getHistoricalMonthlyAnalyticsRows() {
  const start = parseCentralDateTime(ANALYTICS_HISTORY_START);
  const startParts = Number.isNaN(start.getTime()) ? { key: '2026-01' } : getCentralMonthParts(start);

  return loadHistoricalMonthlyRows()
    .filter((row) => row.monthKey >= startParts.key);
}

function getAnalyticsHistory(options = {}) {
  const start = parseCentralDateTime(ANALYTICS_HISTORY_START);
  const startMs = start.getTime();
  const historicalIncidentRows = options.historicalIncidentRows || loadHistoricalIncidentRows();
  const historicalMonthlyRows = options.historicalMonthlyRows || getHistoricalMonthlyAnalyticsRows();
  const historicalCallTypeRows = options.historicalCallTypeRows || loadHistoricalCallTypeRows();
  const liveStartText = HISTORICAL_LIVE_START ||
    (historicalIncidentRows.length || historicalMonthlyRows.length || historicalCallTypeRows.length
      ? getCurrentCentralDateStart()
      : '');
  const liveStart = liveStartText ? parseCentralDateTime(liveStartText) : null;
  const liveStartMs = liveStart && !Number.isNaN(liveStart.getTime()) ? liveStart.getTime() : null;

  const combined = [...historicalIncidentRows, ...incidentHistory];
  const unique = new Map();

  for (const incident of combined) {
    if (!incident?.id) continue;
    if (incident.source !== 'historical-csv' && liveStartMs) {
      const sent = new Date(incident.sent || '');
      if (Number.isNaN(sent.getTime()) || sent.getTime() < liveStartMs) continue;
    }

    if (!unique.has(incident.id)) {
      unique.set(incident.id, incident);
    }
  }

  return [...unique.values()]
    .filter((incident) => {
      if (!Number.isFinite(startMs)) return true;
      if (!incident.sent) return false;

      const sent = new Date(incident.sent);
      return !Number.isNaN(sent.getTime()) && sent >= start;
    })
    .sort((a, b) => {
      const aTime = new Date(a.sent || 0).getTime();
      const bTime = new Date(b.sent || 0).getTime();
      return bTime - aTime;
    });
}

function getIncidentDateRange(history) {
  const dates = history
    .map((incident) => new Date(incident.sent || ''))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);

  const oldest = dates[0] || null;
  const newest = dates[dates.length - 1] || null;

  return {
    oldest: oldest ? oldest.toISOString() : null,
    oldestLabel: oldest ? formatCentralDateTime(oldest) : null,
    newest: newest ? newest.toISOString() : null,
    newestLabel: newest ? formatCentralDateTime(newest) : null
  };
}

function generateTotals(history, monthlyRows = [], callTypeRows = []) {
  const monthlyTotal = monthlyRows.reduce((sum, row) => sum + row.total, 0);
  const monthlyFire = monthlyRows.reduce((sum, row) => sum + row.fire, 0);
  const monthlyEms = monthlyRows.reduce((sum, row) => sum + row.ems, 0);
  const monthlyOther = monthlyRows.reduce((sum, row) => sum + row.other, 0);
  const typeTotal = callTypeRows.reduce((sum, row) => sum + row.volume, 0);
  const typeFire = callTypeRows
    .filter((row) => row.type === INCIDENT_TYPE_CATEGORIES.fire)
    .reduce((sum, row) => sum + row.volume, 0);
  const typeEms = callTypeRows
    .filter((row) => row.type === INCIDENT_TYPE_CATEGORIES.medical)
    .reduce((sum, row) => sum + row.volume, 0);
  const typeOther = callTypeRows
    .filter((row) => row.type !== INCIDENT_TYPE_CATEGORIES.fire && row.type !== INCIDENT_TYPE_CATEGORIES.medical)
    .reduce((sum, row) => sum + row.volume, 0);

  const total = history.length + monthlyTotal + typeTotal;
  const fire = history.filter((i) => i.type === INCIDENT_TYPE_CATEGORIES.fire).length + monthlyFire + typeFire;
  const ems = history.filter((i) => i.type === INCIDENT_TYPE_CATEGORIES.medical).length + monthlyEms + typeEms;
  const other = history
    .filter((i) => i.type !== INCIDENT_TYPE_CATEGORIES.fire && i.type !== INCIDENT_TYPE_CATEGORIES.medical)
    .length + monthlyOther + typeOther;

  return {
    total,
    fire,
    ems,
    other,
    firePercent: total ? Math.round((fire / total) * 100) : 0,
    emsPercent: total ? Math.round((ems / total) * 100) : 0,
    otherPercent: total ? Math.round((other / total) * 100) : 0
  };
}

function generateTypeCounts(history, monthlyRows = [], callTypeRows = []) {
  const counts = {
    [INCIDENT_TYPE_CATEGORIES.medical]: 0,
    [INCIDENT_TYPE_CATEGORIES.fire]: 0,
    [INCIDENT_TYPE_CATEGORIES.noemerg]: 0,
    [INCIDENT_TYPE_CATEGORIES.hazsit]: 0,
    [INCIDENT_TYPE_CATEGORIES.pubserv]: 0,
    [INCIDENT_TYPE_CATEGORIES.uncategorized]: 0,
    [INCIDENT_TYPE_CATEGORIES.lawenforce]: 0
  };

  for (const incident of history) {
    const type = String(incident.type || '');
    if (Object.prototype.hasOwnProperty.call(counts, type)) counts[type]++;
    else counts[INCIDENT_TYPE_CATEGORIES.uncategorized]++;
  }

  for (const row of monthlyRows) {
    counts[INCIDENT_TYPE_CATEGORIES.fire] += row.fire;
    counts[INCIDENT_TYPE_CATEGORIES.medical] += row.ems;
    counts[INCIDENT_TYPE_CATEGORIES.uncategorized] += row.other;
  }

  for (const row of callTypeRows) {
    const type = String(row.type || '');
    if (Object.prototype.hasOwnProperty.call(counts, type)) counts[type] += row.volume;
    else counts[INCIDENT_TYPE_CATEGORIES.uncategorized] += row.volume;
  }

  return counts;
}

function generateBusiestAddresses(history) {
  const counts = {};

  for (const incident of history) {
    const address = (incident.address || '').trim();
    if (!address) continue;
    counts[address] = (counts[address] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([address, calls]) => ({ address, calls }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10);
}

function generateDailyStats(history, monthlyRows = []) {
  const months = [];
  const monthLookup = {};
  const start = parseCentralDateTime(ANALYTICS_HISTORY_START);
  const startDate = Number.isNaN(start.getTime()) ? new Date('2026-01-01T06:00:01.000Z') : start;
  const startParts = getCentralMonthParts(startDate);
  const currentParts = getCentralMonthParts(new Date());
  const endYear = Number(currentParts.year);
  const endMonth = Number(currentParts.month);

  let cursorYear = Number(startParts.year);
  let cursorMonth = Number(startParts.month);

  while (
    cursorYear < endYear ||
    (cursorYear === endYear && cursorMonth <= endMonth)
  ) {
    const key = `${cursorYear}-${String(cursorMonth).padStart(2, '0')}`;
    const labelDate = new Date(Date.UTC(cursorYear, cursorMonth - 1, 15, 12, 0, 0));
    const label = labelDate.toLocaleString('en-US', {
      timeZone: TIME_ZONE,
      month: 'short'
    }).toUpperCase();

    const item = {
      date: label,
      month: label,
      monthKey: key,
      total: 0,
      fire: 0,
      ems: 0
    };

    months.push(item);
    monthLookup[key] = item;

    cursorMonth++;
    if (cursorMonth > 12) {
      cursorMonth = 1;
      cursorYear++;
    }
  }

  for (const incident of history) {
    if (!incident.sent) continue;

    const d = new Date(incident.sent);
    if (Number.isNaN(d.getTime())) continue;

    const { key: monthKey } = getCentralMonthParts(d);

    const item = monthLookup[monthKey];
    if (!item) continue;

    item.total++;
    if (incident.type === INCIDENT_TYPE_CATEGORIES.fire) item.fire++;
    if (incident.type === INCIDENT_TYPE_CATEGORIES.medical) item.ems++;
  }

  for (const row of monthlyRows) {
    const item = monthLookup[row.monthKey];
    if (!item) continue;

    item.total += row.total;
    item.fire += row.fire;
    item.ems += row.ems;
  }

  return months;
}

function buildAnalyticsDashboard(recentLimit = 5) {
  const historicalIncidentRows = loadHistoricalIncidentRows();
  const monthlyRows = getHistoricalMonthlyAnalyticsRows();
  const callTypeRows = historicalIncidentRows.length ? [] : loadHistoricalCallTypeRows();
  const history = getAnalyticsHistory({
    historicalIncidentRows,
    historicalMonthlyRows: monthlyRows,
    historicalCallTypeRows: callTypeRows
  });

  return {
    ok: true,
    updated: nowIso(),
    updatedLabel: formatCentralDateTime(new Date()),
    historyStart: ANALYTICS_HISTORY_START,
    dateRange: getIncidentDateRange(history),
    totals: generateTotals(history, monthlyRows, callTypeRows),
    typeCounts: generateTypeCounts(history, monthlyRows, callTypeRows),
    busiestAddresses: generateBusiestAddresses(history),
    recent: history.slice(0, recentLimit).map((item) => ({
      type: item.type || 'UNKNOWN',
      rawType: item.rawType || '',
      address: item.address || '',
      businessName: item.businessName || '',
      cadCode: item.cadCode || '',
      units: item.units || '',
      latitude: item.latitude || '',
      longitude: item.longitude || '',
      sent: item.sent || '',
      timeLabel: item.sent ? formatCentralDateTime(item.sent) : '',
      details: item.raw?.details || item.raw?.description || item.raw?.cad_code || item.rawType || ''
    })),
    daily: generateDailyStats(history, monthlyRows),
    historicalCsv: {
      incidentsFile: HISTORICAL_INCIDENTS_CSV_FILE,
      monthlyFile: HISTORICAL_MONTHLY_CSV_FILE,
      callTypeFile: HISTORICAL_CALL_TYPE_CSV_FILE,
      incidentRows: historicalIncidentRows.length,
      monthlyRows: monthlyRows.length,
      callTypeRows: callTypeRows.length,
      liveStart: HISTORICAL_LIVE_START ||
        (historicalIncidentRows.length || monthlyRows.length || callTypeRows.length
          ? getCurrentCentralDateStart()
          : null)
    },
    active911: active911Debug
  };
}

function normalizeAddressKey(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\b(NORTH|SOUTH|EAST|WEST)\b/g, (match) => match[0])
    .replace(/\s+/g, ' ')
    .trim();
}

function loadSpecialAddressNotes() {
  const rows = loadJsonFile(SPECIAL_ADDRESS_NOTES_FILE, []);
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => ({
      address: String(row.address || row.location || '').trim(),
      notes: String(row.notes || row.note || '').trim()
    }))
    .filter((row) => row.address && row.notes);
}

function getSpecialAddressNotes(address) {
  const incidentKey = normalizeAddressKey(address);
  if (!incidentKey) return '';

  const match = loadSpecialAddressNotes().find((row) => {
    const noteKey = normalizeAddressKey(row.address);
    return noteKey && (incidentKey.includes(noteKey) || noteKey.includes(incidentKey));
  });

  return match?.notes || '';
}

function loadPreFirePlans() {
  const rows = loadJsonFile(PREFIRE_PLANS_FILE, []);
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => ({
      address: String(row.address || row.location || '').trim(),
      name: String(row.name || row.title || row.businessName || 'Pre Fire Plan').trim(),
      url: String(row.url || row.link || row.planUrl || row.preFirePlanUrl || '').trim()
    }))
    .filter((row) => row.address && row.url);
}

function getPreFirePlan(address) {
  const incidentKey = normalizeAddressKey(address);
  if (!incidentKey) return null;

  const match = loadPreFirePlans().find((row) => {
    const planKey = normalizeAddressKey(row.address);
    return planKey && (incidentKey.includes(planKey) || planKey.includes(incidentKey));
  });

  if (!match) return null;

  return {
    name: match.name || 'Pre Fire Plan',
    url: match.url
  };
}

function formatTakeoverIncident(item) {
  const preFirePlan = getPreFirePlan(item.address);

  return {
      id: item.id || '',
      type: item.rawType || item.type || 'UNKNOWN',
      normalizedType: item.type || 'UNKNOWN',
      address: item.address || '',
      businessName: item.businessName || '',
      cadCode: item.cadCode || '',
      units: item.units || '',
      latitude: item.latitude || '',
      longitude: item.longitude || '',
      sent: item.sent || '',
      timeLabel: item.sent ? formatCentralDateTime(item.sent) : '',
      details: item.raw?.details || item.raw?.description || item.raw?.cad_code || item.rawType || item.cadCode || '',
      specialNotes: getSpecialAddressNotes(item.address),
      preFirePlan
  };
}

async function buildActive911TakeoverPayload(recentLimit = 5) {
  try {
    const response = await active911Fetch(ACTIVE911_ALERTS_URL, { method: 'GET' });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Active911 HTTP ${response.status}: ${text.slice(0, 250)}`);
    }

    const payload = await response.json();
    const alertRefs = extractAlertArray(payload).slice(0, recentLimit);
    const recent = [];

    for (const alertRef of alertRefs) {
      try {
        const fullAlert = await fetchAlertDetail(alertRef);
        const incident = normalizeAlertPayload(fullAlert, 'active911-takeover');
        recent.push(formatTakeoverIncident(incident));
        addIncident(fullAlert, 'active911-takeover');
      } catch (err) {
        const incident = normalizeAlertPayload(alertRef, 'active911-takeover-list');
        recent.push(formatTakeoverIncident(incident));
      }
    }

    active911Debug.lastPollSuccessAt = nowIso();
    active911Debug.lastPollError = null;

    return {
      ok: true,
      source: 'active911-api',
      updated: nowIso(),
      updatedLabel: formatCentralDateTime(new Date()),
      recent,
      active911: active911Debug
    };
  } catch (err) {
    active911Debug.lastPollError = err.message;

    const recent = incidentHistory
      .slice(0, recentLimit)
      .map(formatTakeoverIncident);

    return {
      ok: recent.length > 0,
      source: 'stored-fail-safe',
      error: err.message,
      updated: nowIso(),
      updatedLabel: formatCentralDateTime(new Date()),
      recent,
      active911: active911Debug
    };
  }
}

// ======================================================
// HYDRANT CONFIG
// ======================================================

const HYDRANT_CSV_FILE = process.env.HYDRANT_CSV_FILE || path.join(__dirname, 'Hydrant Locations.csv');
const HYDRANT_CSV_URL =
  process.env.HYDRANT_CSV_URL ||
  '';
const PROBLEMATIC_HYDRANTS_CSV_URL =
  process.env.PROBLEMATIC_HYDRANTS_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLewBiDD_jQoTckHzJX0u-DYHF2rb3pkfmizj5iFfMMooeoOVUOBu8CZzxcgQ0AWu0PtMhytNMFvBs/pub?output=csv';
const HYDRANT_CSV_REFRESH_MS = Number(process.env.HYDRANT_CSV_REFRESH_MS || 30000);
const HYDRANT_BOUNDARY_FILE =
  process.env.HYDRANT_BOUNDARY_FILE || path.join(__dirname, 'horn-lake-boundary.geojson');
const HORN_LAKE_BOUNDARY_URL =
  process.env.HORN_LAKE_BOUNDARY_URL ||
  "https://gis.desotocountyms.gov/arcgis/rest/services/CountyWebMap/County_Web_Map/MapServer/86/query?where=NAME%3D%27Horn%20Lake%27&outFields=*&returnGeometry=true&f=geojson";
const HYDRANT_BUFFER_MILES = Number(process.env.HYDRANT_BUFFER_MILES || 0.5);

let cachedBoundary = null;
let cachedBufferedBoundary = null;
let cachedBoundaryLoadedAt = null;
let cachedBoundarySource = null;
let hydrantCsvCache = {
  loadedAt: null,
  raw: null,
  source: null,
  error: null
};
let problematicHydrantCsvCache = {
  loadedAt: null,
  raw: null,
  source: null,
  error: null
};
let eventsCache = {
  loadedAt: null,
  data: null,
  error: null
};

// ======================================================
// ANALYTICS ROUTES
// ======================================================

app.get('/', (req, res) => {
  sendHtmlFileOrFallback(res, 'analytics.html', 'Horn Lake Fire Analytics', '/api/analytics-dashboard');
});

app.get('/analytics', (req, res) => {
  sendHtmlFileOrFallback(res, 'analytics.html', 'Horn Lake Fire Analytics', '/api/analytics-dashboard');
});

app.get('/mvix-playback', (req, res) => {
  sendHtmlFileOrFallback(res, 'mvix-playback.html', 'MVIX Playback With Active911 Override', '/api/active911-takeover');
});

app.get('/mvix', (req, res) => {
  sendHtmlFileOrFallback(res, 'mvix-playback.html', 'MVIX Playback With Active911 Override', '/api/active911-takeover');
});

app.get('/station1', (req, res) => {
  sendHtmlFileOrFallback(res, 'analytics.html', 'Horn Lake Fire Analytics', '/api/analytics-dashboard');
});

app.get('/station2', (req, res) => {
  sendHtmlFileOrFallback(res, 'analytics.html', 'Horn Lake Fire Analytics', '/api/analytics-dashboard');
});

app.get('/station3', (req, res) => {
  sendHtmlFileOrFallback(res, 'analytics.html', 'Horn Lake Fire Analytics', '/api/analytics-dashboard');
});

app.get('/daily-roster', (req, res) => {
  sendHtmlFileOrFallback(res, 'daily-roster.html', 'Horn Lake Daily Roster', '/api/daily-roster');
});

app.get('/roster', (req, res) => {
  sendHtmlFileOrFallback(res, 'daily-roster.html', 'Horn Lake Daily Roster', '/api/daily-roster');
});

app.get('/live-document', (req, res) => {
  sendHtmlFileOrFallback(res, 'live-document.html', 'Unit Status & OOS', '/api/live-document');
});

app.get('/live-doc', (req, res) => {
  sendHtmlFileOrFallback(res, 'live-document.html', 'Unit Status & OOS', '/api/live-document');
});

app.get('/live-document.html', (req, res) => {
  sendHtmlFileOrFallback(res, 'live-document.html', 'Unit Status & OOS', '/api/live-document');
});

app.get('/training-schedule', (req, res) => {
  sendHtmlFileOrFallback(res, 'training-schedule.html', 'Training Schedule', '/api/training-schedule');
});

app.get('/training-schedule.html', (req, res) => {
  sendHtmlFileOrFallback(res, 'training-schedule.html', 'Training Schedule', '/api/training-schedule');
});

app.get('/ems-expiration-dates', (req, res) => {
  sendHtmlFileOrFallback(res, 'ems-expiration-dates.html', 'EMS Expiration Dates', '/api/ems-expiration-dates');
});

app.get('/ems-expiration-dates.html', (req, res) => {
  sendHtmlFileOrFallback(res, 'ems-expiration-dates.html', 'EMS Expiration Dates', '/api/ems-expiration-dates');
});

app.get('/events', (req, res) => {
  sendHtmlFileOrFallback(res, 'events.html', 'Events', '/api/events');
});

app.get('/active911', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911.html', 'Active911 Alert Takeover', '/api/latest');
});

app.get('/alerts', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911.html', 'Active911 Alert Takeover', '/api/latest');
});

app.get('/alert', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911.html', 'Active911 Alert Takeover', '/api/active911-takeover');
});

app.get('/ipad/alert', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911-ipad.html', 'Active911 Alert Takeover iPad', '/api/active911-takeover');
});

app.get('/ipad/station:station/alert', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911-ipad.html', 'Active911 Alert Takeover iPad', '/api/active911-takeover');
});

app.get('/active911/station:station', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911.html', 'Active911 Alert Takeover', '/api/latest');
});

app.get('/alerts/station:station', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911.html', 'Active911 Alert Takeover', '/api/latest');
});

app.get('/station:station/active911', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911.html', 'Active911 Alert Takeover', '/api/latest');
});

app.get('/station:station/alerts', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911.html', 'Active911 Alert Takeover', '/api/latest');
});

app.get('/station:station/alert', (req, res) => {
  sendHtmlFileOrFallback(res, 'active911.html', 'Active911 Alert Takeover', '/api/active911-takeover');
});

app.get('/api/daily-roster', async (req, res) => {
  try {
    const roster = await fetchDailyRoster(String(req.query.force || '').toLowerCase() === 'true');
    res.json(roster);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      source: DAILY_ROSTER_URL
    });
  }
});

app.get('/api/live-document', async (req, res) => {
  try {
    const documentData = await fetchLiveDocument(String(req.query.force || '').toLowerCase() === 'true');
    res.json(documentData);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      source: LIVE_DOCUMENT_CSV_URL
    });
  }
});

app.get('/api/training-schedule', async (req, res) => {
  try {
    const schedule = await fetchTrainingSchedule(String(req.query.force || '').toLowerCase() === 'true');
    res.json(schedule);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      source: TRAINING_SCHEDULE_CSV_URL
    });
  }
});

app.get('/api/ems-expiration-dates', async (req, res) => {
  try {
    const expirations = await fetchEmsExpirations(String(req.query.force || '').toLowerCase() === 'true');
    res.json(expirations);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      source: EMS_EXPIRATION_CSV_URL
    });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await fetchEvents(String(req.query.force || '').toLowerCase() === 'true');
    res.json(events);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      source: EVENTS_CSV_URL
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    serverTime: nowIso(),
    serverTimeCentral: formatCentralDateTime(new Date()),
    service: 'Horn Lake Fire Analytics + Hydrants + Active911',
    active911: active911Debug
  });
});

app.get('/health', (req, res) => res.redirect('/api/health'));

app.get('/api/analytics-dashboard', (req, res) => {
  res.json(buildAnalyticsDashboard(5));
});

app.get('/api/dashboard', (req, res) => {
  res.json(buildAnalyticsDashboard(5));
});

app.get('/api/analytics', (req, res) => {
  res.json(buildAnalyticsDashboard(5));
});

app.get('/api/latest', (req, res) => {
  res.json(buildAnalyticsDashboard(5));
});

app.get('/api/active911-takeover', async (req, res) => {
  const dashboard = await buildActive911TakeoverPayload(5);
  res.json(dashboard);
});

app.get('/api/analytics-refresh', (req, res) => {
  const dashboard = buildAnalyticsDashboard(5);
  res.json({ ...dashboard, refreshed: true });
});

app.get('/api/analytics-debug', (req, res) => {
  const dashboard = buildAnalyticsDashboard(5);
  res.json({
    ok: true,
    message: 'Analytics debug route is working.',
    totals: dashboard.totals,
    typeCounts: dashboard.typeCounts,
    busiestAddressCount: dashboard.busiestAddresses.length,
    dailyCount: dashboard.daily.length,
    recentCount: incidentHistory.length,
    incidentHistoryFile: INCIDENT_HISTORY_FILE,
    active911: active911Debug
  });
});

app.get('/api/historical-debug', (req, res) => {
  try {
    const historicalIncidentRows = loadHistoricalIncidentRows();
    const monthlyRows = getHistoricalMonthlyAnalyticsRows();
    const callTypeRows = historicalIncidentRows.length ? [] : loadHistoricalCallTypeRows();
    const history = getAnalyticsHistory({
      historicalIncidentRows,
      historicalMonthlyRows: monthlyRows,
      historicalCallTypeRows: callTypeRows
    });

    res.json({
      ok: true,
      files: {
        incidents: {
          path: HISTORICAL_INCIDENTS_CSV_FILE,
          exists: fs.existsSync(HISTORICAL_INCIDENTS_CSV_FILE),
          rows: historicalIncidentRows.length
        },
        monthly: {
          path: HISTORICAL_MONTHLY_CSV_FILE,
          exists: fs.existsSync(HISTORICAL_MONTHLY_CSV_FILE),
          rows: monthlyRows.length
        },
        callType: {
          path: HISTORICAL_CALL_TYPE_CSV_FILE,
          exists: fs.existsSync(HISTORICAL_CALL_TYPE_CSV_FILE),
          rows: callTypeRows.length
        }
      },
      analyticsRows: history.length,
      dateRange: getIncidentDateRange(history),
      totals: generateTotals(history, monthlyRows, callTypeRows),
      firstRecent: history.slice(0, 3).map((incident) => ({
        id: incident.id,
        type: incident.type,
        address: incident.address,
        sent: incident.sent,
        timeLabel: formatCentralDateTime(incident.sent)
      }))
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
});

app.get('/api/test-alert', (req, res) => {
  const item = {
    id: `test-${Date.now()}`,
    type: String(req.query.type || 'EMS').toUpperCase(),
    address: String(req.query.address || '2401 GOODMAN RD').toUpperCase(),
    businessName: String(req.query.businessName || 'Manual Test'),
    sent: req.query.sent ? new Date(String(req.query.sent)).toISOString() : nowIso()
  };

  const incident = addIncident(item, 'manual-test');
  res.json({ ok: true, incident, history: incidentHistory });
});

app.post('/api/active911-webhook', (req, res) => {
  const incident = addIncident(req.body, 'active911-webhook');
  res.json({ ok: true, added: Boolean(incident), incident, recentCount: incidentHistory.length });
});

app.post('/active911-webhook', (req, res) => {
  const incident = addIncident(req.body, 'active911-webhook');
  res.json({ ok: true, added: Boolean(incident), incident, recentCount: incidentHistory.length });
});

app.post('/api/alerts', (req, res) => {
  const incident = addIncident(req.body, 'api-alerts');
  res.json({ ok: true, added: Boolean(incident), incident, recentCount: incidentHistory.length });
});

// ======================================================
// HYDRANT HELPERS
// ======================================================

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function normalizeHydrantStatus(value) {
  const s = String(value || '').trim().toLowerCase();
  if (s === 'out of service' || s === 'oos') return 'OOS';
  if (s === 'low flow' || s === 'low-flow') return 'LOW FLOW';
  if (s === 'under repair' || s === 'repair') return 'UNDER REPAIR';
  if (s === 'testing' || s === 'test') return 'TESTING';
  if (s === 'private') return 'PRIVATE';
  if (s === 'available' || s === 'in service' || s === 'active') return 'AVAILABLE';
  return value ? String(value).toUpperCase() : 'AVAILABLE';
}

function normalizeHydrantProvider(value) {
  const p = String(value || '').trim().toLowerCase();
  if (p.includes('horn')) return 'Horn Lake Water';
  if (p.includes('days') || p.includes('day')) return 'Days Water';
  if (p.includes('walls') || p.includes('wall')) return 'Walls Water';
  return value ? String(value).trim() : 'Unknown';
}

function guessProviderFromLocation(row) {
  const text = `${row.location || ''} ${row.location_name || ''} ${row.description || ''}`.toLowerCase();
  if (text.includes('walls')) return 'Walls Water';
  if (text.includes('day') || text.includes('days')) return 'Days Water';
  return 'Horn Lake Water';
}

async function loadHydrantCsvText(force = false) {
  const now = Date.now();
  const loadedAt = hydrantCsvCache.loadedAt ? new Date(hydrantCsvCache.loadedAt).getTime() : 0;

  if (!force && hydrantCsvCache.raw && now - loadedAt < HYDRANT_CSV_REFRESH_MS) {
    return hydrantCsvCache;
  }

  if (HYDRANT_CSV_URL) {
    try {
      const response = await fetch(HYDRANT_CSV_URL, {
        headers: {
          Accept: 'text/csv,text/plain'
        }
      });

      if (!response.ok) {
        throw new Error(`Hydrant sheet HTTP ${response.status}`);
      }

      hydrantCsvCache = {
        loadedAt: nowIso(),
        raw: await response.text(),
        source: HYDRANT_CSV_URL,
        error: null
      };

      return hydrantCsvCache;
    } catch (err) {
      hydrantCsvCache.error = err.message;

      if (hydrantCsvCache.raw) {
        return hydrantCsvCache;
      }

      console.warn('Hydrant sheet fetch failed; checking local CSV:', err.message);
    }
  }

  if (!fs.existsSync(HYDRANT_CSV_FILE)) {
    return {
      loadedAt: nowIso(),
      raw: '',
      source: HYDRANT_CSV_FILE,
      error: hydrantCsvCache.error
    };
  }

  return {
    loadedAt: nowIso(),
    raw: fs.readFileSync(HYDRANT_CSV_FILE, 'utf8'),
    source: HYDRANT_CSV_FILE,
    error: hydrantCsvCache.error
  };
}

function parseHydrantRowsFromCsvText(raw, defaultStatus = 'AVAILABLE') {
  const parsedRows = parseCsvText(raw || '');
  if (parsedRows.length < 2) return [];

  const headers = parsedRows[0].map(normalizeHeader);

  return parsedRows.slice(1).map((values, index) => {
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });

    const locationId = row.location_id || row.hydrant_id || row.id || `H-${index + 1}`;
    const locationName = row.location_name || row.location || row.description || '';
    const provider = normalizeHydrantProvider(row.provider || row.water_provider || '');
    const providerFinal =
      provider === 'Unknown' ? guessProviderFromLocation({ ...row, location: locationName }) : provider;
    const status = normalizeHydrantStatus(row.status || row.hydrant_status || defaultStatus);

    return {
      location_id: locationId,
      hydrant_id: row.hydrant_id || locationId,
      location: row.location || locationName,
      location_name: locationName,
      description: row.description || '',
      lat: row.lat || row.latitude || '',
      lon: row.lon || row.lng || row.longitude || '',
      provider: providerFinal,
      status,
      flow_gpm: row.flow_gpm || row.gpm || '',
      static_psi: row.static_psi || row.psi || '',
      last_checked: row.last_checked || row.last_inspection || row.inspection_date || '',
      issue: row.issue || '',
      alternate_supply: row.alternate_supply || row.alternate || '',
      notes: row.notes || ''
    };
  });
}

async function loadHydrantStatusRows(force = false) {
  const csvData = await loadHydrantCsvText(force);
  return parseHydrantRowsFromCsvText(csvData.raw, 'AVAILABLE');
}

async function loadProblematicHydrantRows(force = false) {
  if (!PROBLEMATIC_HYDRANTS_CSV_URL) return [];

  const now = Date.now();
  const loadedAt = problematicHydrantCsvCache.loadedAt
    ? new Date(problematicHydrantCsvCache.loadedAt).getTime()
    : 0;

  if (!force && problematicHydrantCsvCache.raw && now - loadedAt < HYDRANT_CSV_REFRESH_MS) {
    return parseHydrantRowsFromCsvText(problematicHydrantCsvCache.raw, 'OOS');
  }

  try {
    const response = await fetch(PROBLEMATIC_HYDRANTS_CSV_URL, {
      headers: {
        Accept: 'text/csv,text/plain'
      }
    });

    if (!response.ok) {
      throw new Error(`Problem hydrants sheet HTTP ${response.status}`);
    }

    problematicHydrantCsvCache = {
      loadedAt: nowIso(),
      raw: await response.text(),
      source: PROBLEMATIC_HYDRANTS_CSV_URL,
      error: null
    };
  } catch (err) {
    problematicHydrantCsvCache.error = err.message;

    if (!problematicHydrantCsvCache.raw) {
      console.warn('Problem hydrants sheet fetch failed:', err.message);
      return [];
    }
  }

  return parseHydrantRowsFromCsvText(problematicHydrantCsvCache.raw, 'OOS');
}

async function fetchHornLakeBoundaryFromArcGIS() {
  const response = await fetch(HORN_LAKE_BOUNDARY_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Boundary fetch failed: HTTP ${response.status}`);

  const geojson = await response.json();
  if (!geojson || !Array.isArray(geojson.features) || !geojson.features.length) {
    throw new Error('Boundary GeoJSON did not include any features.');
  }

  return geojson;
}

async function loadHornLakeBoundary() {
  if (cachedBoundary && cachedBufferedBoundary) {
    return {
      boundary: cachedBoundary,
      bufferedBoundary: cachedBufferedBoundary,
      loadedAt: cachedBoundaryLoadedAt,
      source: cachedBoundarySource
    };
  }

  let boundaryGeoJson;
  let source = 'local geojson';

  if (fs.existsSync(HYDRANT_BOUNDARY_FILE)) {
    boundaryGeoJson = JSON.parse(fs.readFileSync(HYDRANT_BOUNDARY_FILE, 'utf8'));
  } else {
    source = 'arcgis';
    boundaryGeoJson = await fetchHornLakeBoundaryFromArcGIS();
    try {
      fs.writeFileSync(HYDRANT_BOUNDARY_FILE, JSON.stringify(boundaryGeoJson, null, 2));
    } catch (err) {
      console.warn('Could not save Horn Lake boundary locally:', err.message);
    }
  }

  const feature = boundaryGeoJson.type === 'Feature' ? boundaryGeoJson : boundaryGeoJson.features?.[0];
  if (!feature) throw new Error('Horn Lake boundary feature was not found.');

  cachedBoundary = feature;
  cachedBufferedBoundary = buffer(feature, HYDRANT_BUFFER_MILES, { units: 'miles' });
  cachedBoundaryLoadedAt = nowIso();
  cachedBoundarySource = source;

  return {
    boundary: cachedBoundary,
    bufferedBoundary: cachedBufferedBoundary,
    loadedAt: cachedBoundaryLoadedAt,
    source: cachedBoundarySource
  };
}

function getHydrantJurisdiction(hydrant, boundary, bufferedBoundary) {
  const lat = Number(hydrant.lat);
  const lon = Number(hydrant.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 'OUTSIDE';

  const hydrantPoint = point([lon, lat]);
  if (booleanPointInPolygon(hydrantPoint, boundary)) return 'CITY';
  if (booleanPointInPolygon(hydrantPoint, bufferedBoundary)) return 'BUFFER';
  return 'OUTSIDE';
}

function blankProviderSummary() {
  return { total: 0, available: 0, oos: 0, lowFlow: 0, underRepair: 0, testing: 0 };
}

function applyStatusCount(summary, providerSummary, status) {
  if (status === 'OOS') {
    summary.oos++;
    providerSummary.oos++;
  } else if (status === 'LOW FLOW') {
    summary.lowFlow++;
    providerSummary.lowFlow++;
  } else if (status === 'UNDER REPAIR') {
    summary.underRepair++;
    providerSummary.underRepair++;
  } else if (status === 'TESTING') {
    summary.testing++;
    providerSummary.testing++;
  } else if (status === 'PRIVATE') {
    summary.private++;
  } else if (status === 'AVAILABLE') {
    summary.available++;
    providerSummary.available++;
  } else {
    summary.unknown++;
  }
}

function hydrantMatchKeys(hydrant) {
  return [
    hydrant.hydrant_id,
    hydrant.location_id,
    hydrant.id,
    hydrant.location_name,
    hydrant.location
  ]
    .map((value) => String(value || '').trim().toUpperCase())
    .filter(Boolean);
}

function buildHydrantLookup(rows) {
  const lookup = new Map();

  for (const row of rows) {
    for (const key of hydrantMatchKeys(row)) {
      if (!lookup.has(key)) lookup.set(key, row);
    }
  }

  return lookup;
}

function applyProblemHydrantStatus(hydrant, problemHydrant) {
  if (!problemHydrant) return hydrant;

  return {
    ...hydrant,
    ...problemHydrant,
    lat: problemHydrant.lat || hydrant.lat,
    lon: problemHydrant.lon || hydrant.lon,
    location_id: hydrant.location_id || problemHydrant.location_id,
    hydrant_id: hydrant.hydrant_id || problemHydrant.hydrant_id,
    location: problemHydrant.location || hydrant.location,
    location_name: problemHydrant.location_name || hydrant.location_name,
    provider: problemHydrant.provider || hydrant.provider,
    status: problemHydrant.status || hydrant.status
  };
}

async function buildHydrantStatusDashboard() {
  const allHydrants = await loadHydrantStatusRows();
  const problemHydrants = await loadProblematicHydrantRows();
  const problemLookup = buildHydrantLookup(problemHydrants);
  const boundaryInfo = await loadHornLakeBoundary();
  const insideHydrants = [];
  const bufferHydrants = [];

  for (const hydrant of allHydrants) {
    const problemHydrant = hydrantMatchKeys(hydrant)
      .map((key) => problemLookup.get(key))
      .find(Boolean);
    const hydrated = applyProblemHydrantStatus(hydrant, problemHydrant);
    const jurisdiction = getHydrantJurisdiction(
      hydrated,
      boundaryInfo.boundary,
      boundaryInfo.bufferedBoundary
    );

    if (jurisdiction === 'CITY') insideHydrants.push({ ...hydrated, jurisdiction });
    else if (jurisdiction === 'BUFFER') bufferHydrants.push({ ...hydrated, jurisdiction });
  }

  const hydrants = [...insideHydrants, ...bufferHydrants];

  const summary = {
    totalInventory: allHydrants.length,
    total: insideHydrants.length,
    operationalCoverage: hydrants.length,
    bufferHydrants: bufferHydrants.length,
    excludedOutsideBoundary: allHydrants.length - hydrants.length,
    bufferMiles: HYDRANT_BUFFER_MILES,
    available: 0,
    oos: 0,
    lowFlow: 0,
    underRepair: 0,
    testing: 0,
    private: 0,
    unknown: 0
  };

  const byProvider = {
    'Horn Lake Water': blankProviderSummary(),
    'Days Water': blankProviderSummary(),
    'Walls Water': blankProviderSummary()
  };

  for (const hydrant of insideHydrants) {
    const provider = byProvider[hydrant.provider] ? hydrant.provider : 'Horn Lake Water';
    byProvider[provider].total++;
    applyStatusCount(summary, byProvider[provider], String(hydrant.status || '').toUpperCase());
  }

  if (problemHydrants.length) {
    summary.oos = problemHydrants.filter((h) => String(h.status || '').toUpperCase() === 'OOS').length;
    summary.lowFlow = problemHydrants.filter((h) => String(h.status || '').toUpperCase() === 'LOW FLOW').length;
    summary.underRepair = problemHydrants.filter((h) => String(h.status || '').toUpperCase() === 'UNDER REPAIR').length;
    summary.testing = problemHydrants.filter((h) => String(h.status || '').toUpperCase() === 'TESTING').length;
  }

  const critical = problemHydrants
    .filter((h) => ['OOS', 'LOW FLOW', 'UNDER REPAIR', 'TESTING'].includes(String(h.status || '').toUpperCase()))
    .slice(0, 30);
  const notes = problemHydrants.slice(0, 20);
  const recent = [...hydrants]
    .filter((h) => h.last_checked)
    .sort((a, b) => new Date(b.last_checked) - new Date(a.last_checked))
    .slice(0, 20);

  return {
    ok: true,
    updated: nowIso(),
    updatedLabel: formatCentralDateTime(new Date()),
    title: 'Out of Service Hydrants',
    source: hydrantCsvCache.source || HYDRANT_CSV_FILE,
    problemSource: problematicHydrantCsvCache.source || PROBLEMATIC_HYDRANTS_CSV_URL,
    refreshMs: HYDRANT_CSV_REFRESH_MS,
    csvFile: HYDRANT_CSV_FILE,
    csvUrl: HYDRANT_CSV_URL,
    csvError: hydrantCsvCache.error,
    problemCsvUrl: PROBLEMATIC_HYDRANTS_CSV_URL,
    problemCsvError: problematicHydrantCsvCache.error,
    boundaryFile: HYDRANT_BOUNDARY_FILE,
    boundaryLoadedAt: boundaryInfo.loadedAt,
    boundarySource: boundaryInfo.source,
    summary,
    byProvider,
    critical,
    notes,
    recent,
    hydrants
  };
}

// ======================================================
// HYDRANT ROUTES
// ======================================================

app.get('/hydrants', (req, res) => {
  sendHtmlFileOrFallback(res, 'hydrants.html', 'Out of Service Hydrants', '/api/hydrants-status');
});

app.get('/api/hydrants-status', async (req, res) => {
  try {
    const dashboard = await buildHydrantStatusDashboard();
    res.json(dashboard);
  } catch (err) {
    console.error('Hydrant status error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ======================================================
// ACTIVE911 TAKEOVER MAP + WEATHER ROUTES
// ======================================================

const ACTIVE911_STATIONS = {
  '1': {
    id: '1',
    label: 'STATION 1',
    address: '6770 Tulane Horn Lake, MS 38637',
    color: '0x91c900'
  },
  '2': {
    id: '2',
    label: 'STATION 2',
    address: '5711 Hwy 51 Horn Lake, MS 38637',
    color: '0x2e9cff'
  },
  '3': {
    id: '3',
    label: 'STATION 3',
    address: '6363 Hwy 301 Walls, MS 38680',
    color: '0xb25cff'
  }
};

const HORN_LAKE_WEATHER = { lat: 34.9554, lon: -90.0348 };

function safeString(value) {
  return String(value ?? '').trim();
}

const mapGeocodeCache = new Map();

async function geocodeAddressForMaps(address) {
  const text = safeString(address);
  if (!GOOGLE_MAPS_API_KEY || !text) return null;

  const key = text.toUpperCase();
  if (mapGeocodeCache.has(key)) return mapGeocodeCache.get(key);

  const params = new URLSearchParams({
    address: `${text}, Horn Lake, MS`,
    key: GOOGLE_MAPS_API_KEY
  });
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok || payload.status !== 'OK') {
    throw new Error(payload.error_message || payload.status || response.statusText);
  }

  const location = payload.results?.[0]?.geometry?.location;
  if (!location?.lat || !location?.lng) return null;

  const result = {
    lat: String(location.lat),
    lon: String(location.lng)
  };
  mapGeocodeCache.set(key, result);
  return result;
}

async function resolveMapPoint(req) {
  const lat = safeString(req.query.lat);
  const lon = safeString(req.query.lon || req.query.lng);

  if (lat && lon) {
    return { lat, lon };
  }

  return geocodeAddressForMaps(req.query.address);
}

function bearingDegrees(fromLat, fromLon, toLat, toLon) {
  const lat1 = Number(fromLat) * Math.PI / 180;
  const lat2 = Number(toLat) * Math.PI / 180;
  const deltaLon = (Number(toLon) - Number(fromLon)) * Math.PI / 180;
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

function offsetLatLon(lat, lon, northFeet, eastFeet) {
  const metersNorth = Number(northFeet) * 0.3048;
  const metersEast = Number(eastFeet) * 0.3048;
  const dLat = metersNorth / 111320;
  const dLon = metersEast / (111320 * Math.cos(Number(lat) * Math.PI / 180));

  return {
    lat: Number(lat) + dLat,
    lon: Number(lon) + dLon
  };
}

async function getStreetViewMetadata(lat, lon, radius = 220) {
  const params = new URLSearchParams({
    location: `${lat},${lon}`,
    radius: String(radius),
    source: 'outdoor',
    key: GOOGLE_MAPS_API_KEY
  });
  const response = await fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok || payload.status !== 'OK' || !payload.location?.lat || !payload.location?.lng) return null;
  return payload;
}

function feetBetween(lat1, lon1, lat2, lon2) {
  const radiusFeet = 20902231;
  const toRad = (value) => Number(value) * Math.PI / 180;
  const dLat = toRad(lat2) - toRad(lat1);
  const dLon = toRad(lon2) - toRad(lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * radiusFeet * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function streetViewCameraForPoint(lat, lon, radius = 1000) {
  const baseLat = Number(lat);
  const baseLon = Number(lon);
  const offsets = [
    [0, 0],
    [0, 90],
    [0, -90],
    [90, 0],
    [-90, 0],
    [70, 70],
    [70, -70],
    [-70, 70],
    [-70, -70],
    [0, 180],
    [0, -180],
    [180, 0],
    [-180, 0]
  ];

  const candidates = [];

  for (const [north, east] of offsets) {
    const point = offsetLatLon(baseLat, baseLon, north, east);
    const metadata = await getStreetViewMetadata(point.lat, point.lon, 260).catch(() => null);
    if (!metadata) continue;

    const panoLat = Number(metadata.location.lat);
    const panoLon = Number(metadata.location.lng);
    const distance = feetBetween(baseLat, baseLon, panoLat, panoLon);

    candidates.push({
      metadata,
      distance,
      location: `${panoLat},${panoLon}`,
      heading: String(Math.round(bearingDegrees(panoLat, panoLon, baseLat, baseLon)))
    });
  }

  const chosen = candidates
    .filter((candidate) => candidate.distance >= 25)
    .sort((a, b) => a.distance - b.distance)[0] ||
    candidates.sort((a, b) => a.distance - b.distance)[0];

  if (!chosen) {
    return {
      location: `${lat},${lon}`,
      heading: safeString('')
    };
  }

  return {
    location: chosen.location,
    pano: chosen.metadata.pano_id || '',
    heading: chosen.heading
  };
}

function normalizeActive911StationId(value) {
  const raw = safeString(value).toLowerCase().replace(/\s+/g, '');
  if (raw === 'station2' || raw === '2') return '2';
  if (raw === 'station3' || raw === '3') return '3';
  return '1';
}

function active911StationFromRequest(req) {
  const pathText = safeString(req.path).toLowerCase();
  if (pathText.includes('station2')) return '2';
  if (pathText.includes('station3')) return '3';
  if (pathText.includes('station1')) return '1';
  return normalizeActive911StationId(req.query.station || process.env.STATION_ID || '1');
}

function svgPlaceholder(title, message) {
  const safeTitle = safeString(title).replace(/[<>&"]/g, '');
  const safeMessage = safeString(message).replace(/[<>&"]/g, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="520" viewBox="0 0 1280 520">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#111820"/><stop offset="1" stop-color="#06090d"/></linearGradient></defs>
<rect width="1280" height="520" fill="url(#g)"/>
<rect x="20" y="20" width="1240" height="480" rx="22" fill="none" stroke="#3a424f" stroke-width="3"/>
<text x="640" y="230" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="48" font-weight="700">${safeTitle}</text>
<text x="640" y="292" text-anchor="middle" fill="#bfc7d4" font-family="Arial" font-size="28">${safeMessage}</text>
</svg>`;
}

function loadTakeoverHydrants() {
  try {
    if (!fs.existsSync(HYDRANT_CSV_FILE)) return [];

    const lines = fs.readFileSync(HYDRANT_CSV_FILE, 'utf8').split(/\r?\n/).filter(Boolean);

    return lines.slice(1)
      .map((line) => {
        const cols = parseCsvLine(line);
        const lat = Number(cols[3]);
        const lon = Number(cols[4]);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        return { lat, lon };
      })
      .filter(Boolean);
  } catch (err) {
    console.error('Takeover hydrant load failed:', err.message);
    return [];
  }
}

function nearestTakeoverHydrants(lat, lon, limit = 18) {
  const a = Number(lat);
  const b = Number(lon);

  if (!Number.isFinite(a) || !Number.isFinite(b)) return [];

  return loadTakeoverHydrants()
    .map((hydrant) => ({
      ...hydrant,
      distance: Math.hypot(hydrant.lat - a, hydrant.lon - b)
    }))
    .sort((x, y) => x.distance - y.distance)
    .slice(0, limit);
}

function windDirectionLabel(degrees) {
  const dir = Number(degrees);
  if (!Number.isFinite(dir)) return '';

  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(dir / 45) % 8];
}

app.get('/api/weather', async (req, res) => {
  try {
    const point = await resolveMapPoint(req).catch(() => null);
    const lat = safeString(point?.lat || HORN_LAKE_WEATHER.lat);
    const lon = safeString(point?.lon || HORN_LAKE_WEATHER.lon);
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}` +
      '&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m' +
      '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago';
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.reason || response.statusText);
    }

    const codeMap = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Cloudy',
      45: 'Fog',
      48: 'Fog',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      80: 'Rain Showers',
      81: 'Rain Showers',
      82: 'Heavy Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm',
      99: 'Thunderstorm'
    };

    res.json({
      ok: true,
      temp: Math.round(Number(payload.current?.temperature_2m)),
      condition: codeMap[payload.current?.weather_code] || 'Current Weather',
      windMph: Math.round(Number(payload.current?.wind_speed_10m)),
      windDir: windDirectionLabel(payload.current?.wind_direction_10m),
      time: payload.current?.time || null
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/map/streetview', async (req, res) => {
  const mapPoint = await resolveMapPoint(req).catch((err) => {
    console.error('Street View geocode failed:', err.message);
    return null;
  });
  const lat = safeString(mapPoint?.lat);
  const lon = safeString(mapPoint?.lon);

  if (!GOOGLE_MAPS_API_KEY || !lat || !lon) {
    return res.type('svg').send(svgPlaceholder(
      'STREET VIEW UNAVAILABLE',
      !GOOGLE_MAPS_API_KEY ? 'Google Maps API key is not configured.' : 'No coordinates received.'
    ));
  }

  const camera = await streetViewCameraForPoint(lat, lon, safeString(req.query.radius || '1000')).catch((err) => {
    console.error('Street View camera lookup failed:', err.message);
    return {
      location: `${lat},${lon}`,
      heading: safeString(req.query.heading || '')
    };
  });

  const params = new URLSearchParams({
    size: safeString(req.query.size || '640x260'),
    fov: safeString(req.query.fov || '120'),
    heading: camera.heading || safeString(req.query.heading || '0'),
    pitch: safeString(req.query.pitch || '-2'),
    source: 'outdoor',
    key: GOOGLE_MAPS_API_KEY
  });

  if (camera.pano) {
    params.set('pano', camera.pano);
  } else {
    params.set('location', camera.location || `${lat},${lon}`);
    params.set('radius', safeString(req.query.radius || '1000'));
  }

  res.redirect(`https://maps.googleapis.com/maps/api/streetview?${params.toString()}`);
});

app.get('/api/map/satellite', async (req, res) => {
  const mapPoint = await resolveMapPoint(req).catch((err) => {
    console.error('Satellite geocode failed:', err.message);
    return null;
  });
  const lat = safeString(mapPoint?.lat);
  const lon = safeString(mapPoint?.lon);

  if (!GOOGLE_MAPS_API_KEY || !lat || !lon) {
    return res.type('svg').send(svgPlaceholder(
      'SATELLITE VIEW UNAVAILABLE',
      !GOOGLE_MAPS_API_KEY ? 'Google Maps API key is not configured.' : 'No coordinates received.'
    ));
  }

  const params = new URLSearchParams({
    center: `${lat},${lon}`,
    zoom: safeString(req.query.zoom || '17'),
    size: safeString(req.query.size || '640x260'),
    scale: '2',
    maptype: 'satellite',
    markers: `color:blue|label:A|${lat},${lon}`,
    key: GOOGLE_MAPS_API_KEY
  });

  const hydrants = nearestTakeoverHydrants(lat, lon, Number(req.query.hydrants || 14));
  if (hydrants.length) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    params.append('markers', `icon:${baseUrl}/hydrant-icon.png|${hydrants.map((h) => `${h.lat},${h.lon}`).join('|')}`);
  }

  res.redirect(`https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`);
});

async function getDirectionsPolyline(origin, destination) {
  const params = new URLSearchParams({
    origin,
    destination,
    mode: 'driving',
    key: GOOGLE_MAPS_API_KEY
  });
  const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok || payload.status !== 'OK') {
    throw new Error(payload.error_message || payload.status || response.statusText);
  }

  return payload.routes?.[0]?.overview_polyline?.points || null;
}

app.get('/api/map/route', async (req, res) => {
  const mapPoint = await resolveMapPoint(req).catch((err) => {
    console.error('Route geocode failed:', err.message);
    return null;
  });
  const lat = safeString(mapPoint?.lat);
  const lon = safeString(mapPoint?.lon);

  if (!GOOGLE_MAPS_API_KEY || !lat || !lon) {
    return res.type('svg').send(svgPlaceholder(
      'ROUTE UNAVAILABLE',
      !GOOGLE_MAPS_API_KEY ? 'Google Maps API key is not configured.' : 'No coordinates received.'
    ));
  }

  const station = ACTIVE911_STATIONS[active911StationFromRequest(req)] || ACTIVE911_STATIONS['1'];
  const destination = `${lat},${lon}`;
  const params = new URLSearchParams({
    size: safeString(req.query.size || '640x260'),
    scale: '2',
    maptype: 'roadmap',
    markers: `color:red|label:I|${destination}`,
    key: GOOGLE_MAPS_API_KEY
  });

  params.append('markers', `color:green|label:${station.id}|${station.address}`);

  try {
    const polyline = await getDirectionsPolyline(station.address, destination);
    if (polyline) {
      params.append('path', `color:${station.color}|weight:6|enc:${polyline}`);
    }
  } catch (err) {
    console.error(`Route map failed for station ${station.id}:`, err.message);
  }

  res.redirect(`https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`);
});

app.get('/api/stations', (req, res) => {
  res.json({ ok: true, stations: ACTIVE911_STATIONS });
});

// ======================================================
// ACTIVE911 DEBUG + BACKFILL ROUTES
// ======================================================

app.get('/api/active911-latest-debug', async (req, res) => {
  try {
    const listResponse = await active911Fetch(ACTIVE911_ALERTS_URL, { method: 'GET' });

    if (!listResponse.ok) {
      const text = await listResponse.text();
      throw new Error(`Active911 HTTP ${listResponse.status}: ${text.slice(0, 250)}`);
    }

    const listPayload = await listResponse.json();
    const alerts = extractAlertArray(listPayload);
    const latest = alerts[0];

    if (!latest?.uri) {
      return res.json({
        ok: false,
        error: 'No latest alert URI found',
        listPayload
      });
    }

    const detailResponse = await active911Fetch(latest.uri, { method: 'GET' });
    const detailPayload = await detailResponse.json().catch(() => ({}));

    res.json({
      ok: true,
      latestAlertRef: latest,
      detailStatus: detailResponse.status,
      detailPayload
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.name === 'AbortError' ? 'Active911 request timed out' : err.message
    });
  }
});

app.get('/api/active911-backfill', async (req, res) => {
  try {
    const start = String(req.query.start || ACTIVE911_BACKFILL_START);
    const requestedLimit = Number(req.query.limit || ACTIVE911_BACKFILL_LIMIT);
    const backfillLimit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? requestedLimit
      : ACTIVE911_BACKFILL_LIMIT;

    let page = 1;
    let added = 0;
    let checked = 0;
    let duplicates = 0;
    let failed = 0;
    let keepGoing = true;
    const pageCounts = [];
    const pageNewIds = [];
    const allListIds = new Set();
    let stopReason = 'limit reached';

    while (keepGoing && checked < backfillLimit) {
      const payload = await fetchActive911AlertList(page, start, backfillLimit);
      const alertRefs = extractAlertArray(payload);
      pageCounts.push(alertRefs.length);

      if (!alertRefs.length) {
        stopReason = 'Active911 returned an empty page';
        break;
      }

      const pageUniqueIds = alertRefs
        .map((alertRef) => alertRef?.id ? String(alertRef.id) : '')
        .filter(Boolean);
      const newIdsOnPage = pageUniqueIds.filter((alertId) => !allListIds.has(alertId)).length;
      pageNewIds.push(newIdsOnPage);

      if (newIdsOnPage === 0 && pageUniqueIds.length) {
        stopReason = 'Active911 repeated a page with no new alert IDs';
        break;
      }

      for (const alertRef of alertRefs) {
        if (checked >= backfillLimit) break;
        checked++;

      const alertId = alertRef?.id ? String(alertRef.id) : '';
      if (alertId && !allListIds.has(alertId)) {
        allListIds.add(alertId);
      }

        if (alertId && seenIncidentIds.has(alertId)) {
          duplicates++;
          continue;
        }

        try {
          const fullAlert = await fetchAlertDetail(alertRef);
          const incident = addIncident(fullAlert, 'active911-backfill');
          if (incident) added++;
          else duplicates++;
        } catch (err) {
          failed++;
          console.error(`Backfill failed for ${alertRef?.id || 'unknown'}:`, err.message);
        }
      }

      page++;
    }

    const analyticsHistory = getAnalyticsHistory();

    res.json({
      ok: true,
      start,
      limit: backfillLimit,
      alertDays: daysBetweenDates(start),
      pagesChecked: pageCounts.length,
      pageCounts,
      pageNewIds,
      alertsChecked: checked,
      uniqueAlertRefsReturned: allListIds.size,
      added,
      duplicates,
      failed,
      totalStored: incidentHistory.length,
      analyticsStored: analyticsHistory.length,
      dateRange: getIncidentDateRange(analyticsHistory),
      stopReason
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({
    ok: false,
    error: `API route not found: ${req.originalUrl}`,
    availableRoutes: [
      '/api/analytics-dashboard',
      '/api/dashboard',
      '/api/analytics',
      '/api/latest',
      '/api/hydrants-status',
      '/api/daily-roster',
      '/api/live-document',
      '/api/events',
      '/api/health'
    ]
  });
});

// ======================================================
// START SERVER
// ======================================================

if (ACTIVE911_POLLING_ENABLED && (active911AccessToken || ACTIVE911_REFRESH_TOKEN)) {
  pollActive911();
  setInterval(pollActive911, ACTIVE911_POLL_MS);
  console.log('Active911 polling enabled');
} else {
  console.log('Active911 polling not started. Check Active911 credentials and ACTIVE911_POLLING_ENABLED.');
}

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log(`Horn Lake Fire Analytics + Hydrants + Active911 running on ${PORT}`);
  console.log('========================================');
  console.log('');
});
