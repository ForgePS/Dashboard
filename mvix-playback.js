const ACTIVE911_TAKEOVER_DURATION_MS =
  Number(new URLSearchParams(window.location.search).get('takeoverMinutes') || 5) * 60 * 1000;
const DEFAULT_MVIX_PLAYBACK_URL = 'https://vp-iqewtzht.cms.mvix.com/playback';

function playbackUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('playbackUrl') || DEFAULT_MVIX_PLAYBACK_URL;
}

function loadPlaylist() {
  const frame = document.getElementById('mvixFrame');
  if (frame) frame.src = playbackUrl();
}

function stationAlertPath() {
  const params = new URLSearchParams(window.location.search);
  const station = String(params.get('station') || '').trim();
  const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  const duration = encodeURIComponent(String(ACTIVE911_TAKEOVER_DURATION_MS / 60000));
  const suffix = `?returnTo=${returnTo}&durationMinutes=${duration}`;

  if (station === '2') return `/station2/alert${suffix}`;
  if (station === '3') return `/station3/alert${suffix}`;
  if (station === '1') return `/station1/alert${suffix}`;
  return `/alert${suffix}`;
}

async function checkForActiveCall() {
  try {
    const response = await fetch(`/api/active911-takeover?ts=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    const latest = Array.isArray(data.recent) ? data.recent[0] : null;

    if (!latest?.sent) return;

    const sentAt = new Date(latest.sent).getTime();
    if (!Number.isFinite(sentAt)) return;

    if (Date.now() - sentAt <= ACTIVE911_TAKEOVER_DURATION_MS) {
      window.location.href = stationAlertPath();
    }
  } catch (err) {
    const badge = document.getElementById('statusBadge');
    if (badge) badge.textContent = 'Active911 monitor warning';
  }
}

loadPlaylist();
checkForActiveCall();
setInterval(checkForActiveCall, 15000);
