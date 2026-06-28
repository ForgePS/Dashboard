const ACTIVE911_TAKEOVER_DURATION_MS =
  Number(new URLSearchParams(window.location.search).get('takeoverMinutes') || 5) * 60 * 1000;
const ACTIVE911_MONITOR_MS = 5000;
let takeoverInProgress = false;

function pageParams() {
  return new URLSearchParams(window.location.search);
}

function resolveStation() {
  const params = pageParams();
  const fromQuery = String(params.get('station') || '').trim();
  if (['1', '2', '3'].includes(fromQuery)) return fromQuery;

  const path = window.location.pathname.toLowerCase();
  const match = path.match(/station([123])/);
  return match ? match[1] : '1';
}

function signageUrl() {
  const station = resolveStation();
  const params = pageParams();
  const explicit = params.get('signageUrl');
  if (explicit) return explicit;

  const url = new URL(`/station${station}/signage`, window.location.origin);
  url.searchParams.set('station', station);
  return url.toString();
}

function loadPlaylist() {
  const frame = document.getElementById('mvixFrame');
  if (frame) frame.src = signageUrl();
}

function stationAlertPath() {
  const station = resolveStation();
  const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  const duration = encodeURIComponent(String(ACTIVE911_TAKEOVER_DURATION_MS / 60000));
  const suffix = `?returnTo=${returnTo}&durationMinutes=${duration}&station=${station}`;
  return `/station${station}/alert${suffix}`;
}

async function checkForActiveCall() {
  if (takeoverInProgress) return;
  const badge = document.getElementById('statusBadge');
  const station = resolveStation();

  try {
    const response = await fetch(`/api/active911-takeover?ts=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    const latest = Array.isArray(data.recent) ? data.recent[0] : null;

    if (!latest?.sent) {
      if (badge) badge.textContent = `Active911 monitor armed (Station ${station})`;
      return;
    }

    const sentAt = new Date(latest.sent).getTime();
    if (!Number.isFinite(sentAt)) {
      if (badge) badge.textContent = `Active911 monitor armed (Station ${station})`;
      return;
    }

    if (Date.now() - sentAt <= ACTIVE911_TAKEOVER_DURATION_MS) {
      takeoverInProgress = true;
      if (badge) badge.textContent = 'Active911 alert received - taking over';
      window.location.replace(stationAlertPath());
      return;
    }

    if (badge) badge.textContent = `Active911 monitor armed (Station ${station})`;
  } catch (err) {
    if (badge) badge.textContent = 'Active911 monitor warning';
  }
}

loadPlaylist();
checkForActiveCall();
setInterval(checkForActiveCall, ACTIVE911_MONITOR_MS);
