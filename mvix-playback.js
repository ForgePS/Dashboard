const ACTIVE911_MONITOR_MS = 5000;
const DEFAULT_MVIX_PLAYBACK_URL = 'https://vp-iqewtzht.cms.mvix.com/playback';
let takeoverInProgress = false;
let mvixConfig = null;

function pageParams() {
  return new URLSearchParams(window.location.search);
}

function takeoverDurationMs() {
  const params = pageParams();
  const fromQuery = Number(params.get('takeoverMinutes'));
  const fromConfig = Number(mvixConfig?.wrapper?.takeoverMinutes);
  const minutes = Number.isFinite(fromQuery) && fromQuery > 0
    ? fromQuery
    : Number.isFinite(fromConfig) && fromConfig > 0
      ? fromConfig
      : 5;
  return minutes * 60 * 1000;
}

function resolveStation() {
  const params = pageParams();
  const fromQuery = String(params.get('station') || '').trim();
  if (['1', '2', '3'].includes(fromQuery)) return fromQuery;

  const path = window.location.pathname.toLowerCase();
  const match = path.match(/station([123])/);
  return match ? match[1] : '';
}

function shouldShowBadge() {
  const params = pageParams();
  if (params.get('badge') === '1') return true;
  if (params.get('badge') === '0') return false;
  return mvixConfig?.wrapper?.hideStatusBadge !== true;
}

function hostedSignageUrl(station) {
  const url = new URL('/mvix/signage', window.location.origin);
  if (station) url.searchParams.set('station', station);
  return url.toString();
}

function resolvePlaybackUrl() {
  const params = pageParams();
  const explicit = params.get('playbackUrl');
  if (explicit) return explicit;

  const signageMode = String(
    params.get('signageMode') ||
    mvixConfig?.signageMode ||
    'cms'
  ).toLowerCase();

  if (signageMode === 'cms') {
    return mvixConfig?.mvixOrgPlaybackUrl || DEFAULT_MVIX_PLAYBACK_URL;
  }

  return hostedSignageUrl(resolveStation());
}

async function loadMvixConfig() {
  try {
    const response = await fetch(`/api/mvix-config?ts=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    if (data.ok) mvixConfig = data;
  } catch (err) {
    console.warn('MVIX config unavailable, using defaults:', err.message);
  }
}

function loadPlaylist() {
  const frame = document.getElementById('mvixFrame');
  if (frame) frame.src = resolvePlaybackUrl();
}

function updateBadgeVisibility() {
  const badge = document.getElementById('statusBadge');
  if (!badge) return;
  badge.hidden = !shouldShowBadge();
}

function stationAlertPath() {
  const station = resolveStation();
  const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  const duration = encodeURIComponent(String(takeoverDurationMs() / 60000));
  const suffix = `?returnTo=${returnTo}&durationMinutes=${duration}`;

  if (station === '2') return `/station2/alert${suffix}`;
  if (station === '3') return `/station3/alert${suffix}`;
  if (station === '1') return `/station1/alert${suffix}`;
  return `/alert${suffix}`;
}

async function checkForActiveCall() {
  if (takeoverInProgress) return;
  const badge = document.getElementById('statusBadge');

  try {
    const response = await fetch(`/api/active911-takeover?ts=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    const latest = Array.isArray(data.recent) ? data.recent[0] : null;

    if (!latest?.sent) {
      if (badge) badge.textContent = 'Active911 monitor armed';
      return;
    }

    const sentAt = new Date(latest.sent).getTime();
    if (!Number.isFinite(sentAt)) {
      if (badge) badge.textContent = 'Active911 monitor armed';
      return;
    }

    if (Date.now() - sentAt <= takeoverDurationMs()) {
      takeoverInProgress = true;
      if (badge) badge.textContent = 'Active911 alert received - taking over';
      window.location.replace(stationAlertPath());
      return;
    }

    if (badge) badge.textContent = 'Active911 monitor armed';
  } catch (err) {
    if (badge) badge.textContent = 'Active911 monitor warning';
  }
}

async function init() {
  await loadMvixConfig();
  updateBadgeVisibility();
  loadPlaylist();
  checkForActiveCall();
  setInterval(checkForActiveCall, ACTIVE911_MONITOR_MS);
}

init();
