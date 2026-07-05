const DEFAULT_MVIX_PLAYBACK_URL = 'https://vp-iqewtzht.cms.mvix.com/playback';

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

function internalSignageUrl() {
  const station = resolveStation();
  const url = new URL(`/station${station}/signage`, window.location.origin);
  url.searchParams.set('station', station);
  url.searchParams.set('monitor', '0');
  return url.toString();
}

function playbackUrl() {
  const params = pageParams();
  const explicitPlayback = params.get('playbackUrl');
  if (explicitPlayback) return explicitPlayback;

  const explicitSignage = params.get('signageUrl');
  if (explicitSignage) return explicitSignage;

  const playlist = String(params.get('playlist') || params.get('source') || '').toLowerCase();
  if (playlist === 'signage' || playlist === 'dashboard') {
    return internalSignageUrl();
  }

  return DEFAULT_MVIX_PLAYBACK_URL;
}

function loadPlayback() {
  const frame = document.getElementById('mvixFrame');
  if (frame) frame.src = playbackUrl();
}

loadPlayback();
