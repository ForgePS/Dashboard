const DEFAULT_MVIX_PLAYBACK_URL = 'https://vp-iqewtzht.cms.mvix.com/playback';
const DEFAULT_MVIX_SLOT_SECONDS = 45;
const PLAYLIST_REFRESH_MS = 30 * 60 * 1000;

const frame = document.getElementById('mvixFrame');

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

function playlistMode() {
  const params = pageParams();
  const explicitPlayback = params.get('playbackUrl');
  const explicitSignage = params.get('signageUrl');
  if (explicitPlayback) return 'mvix-only';
  if (explicitSignage) return 'signage-only';

  const mode = String(params.get('playlist') || params.get('source') || 'all').toLowerCase();
  if (mode === 'mvix' || mode === 'live') return 'mvix-only';
  if (mode === 'signage' || mode === 'dashboard') return 'signage-only';
  return 'all';
}

function mvixLiveSlot() {
  const params = pageParams();
  const seconds = Number(params.get('mvixSeconds') || DEFAULT_MVIX_SLOT_SECONDS);
  const url = params.get('playbackUrl') || DEFAULT_MVIX_PLAYBACK_URL;

  return {
    id: 'mvix-live-playback',
    title: 'MVIX Live Playback',
    type: 'url',
    url,
    durationSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_MVIX_SLOT_SECONDS
  };
}

function withCacheBust(url) {
  const next = new URL(url, window.location.origin);
  next.searchParams.set('ts', String(Date.now()));
  return next.toString();
}

function buildSlotUrl(slot, station) {
  if (slot.type === 'video') {
    const src = slot.path || slot.url;
    if (!src) return withCacheBust('/signage-asset.html?type=video&src=');
    const asset = new URL('/signage-asset.html', window.location.origin);
    asset.searchParams.set('type', 'video');
    asset.searchParams.set('src', src);
    return withCacheBust(asset.toString());
  }

  if (slot.type === 'image') {
    const src = slot.path || slot.url;
    if (!src) return withCacheBust('/signage-asset.html?type=image&src=');
    const asset = new URL('/signage-asset.html', window.location.origin);
    const isPdf = slot.assetType === 'pdf' || /\.pdf(?:$|\?)/i.test(src);
    asset.searchParams.set('type', isPdf ? 'pdf' : 'image');
    asset.searchParams.set('src', src);
    return withCacheBust(asset.toString());
  }

  if (slot.type === 'url' && slot.url) {
    return withCacheBust(slot.url);
  }

  const url = new URL(slot.path, window.location.origin);
  url.searchParams.set('signage', '1');
  url.searchParams.set('station', station);
  return withCacheBust(url.toString());
}

function filterSlots(slots) {
  return (Array.isArray(slots) ? slots : []).filter((slot) => {
    if (!slot || slot.disabled) return false;
    if (slot.type === 'video' || slot.type === 'image') return Boolean(slot.path || slot.url);
    if (slot.type === 'url') return Boolean(slot.url);
    return Boolean(slot.path);
  });
}

let slots = [];
let slotIndex = 0;
let rotationTimer = null;
let currentMode = 'all';

function showSlot(slot) {
  const station = resolveStation();
  if (!frame || !slot) return;
  frame.src = buildSlotUrl(slot, station);
}

function scheduleNext() {
  clearTimeout(rotationTimer);
  if (!slots.length) return;

  const slot = slots[slotIndex % slots.length];
  slotIndex += 1;
  showSlot(slot);

  const durationMs = Math.max(10, Number(slot.durationSeconds || 45)) * 1000;
  rotationTimer = setTimeout(scheduleNext, durationMs);
}

async function loadSignageSlots(station) {
  const response = await fetch(`/api/signage-playlist?station=${encodeURIComponent(station)}&ts=${Date.now()}`, {
    cache: 'no-store'
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'playlist unavailable');
  return filterSlots(data.slots);
}

function buildRotation(mode, signageSlots) {
  if (mode === 'mvix-only') return [mvixLiveSlot()];
  if (mode === 'signage-only') return signageSlots;
  if (!signageSlots.length) return [mvixLiveSlot()];
  // Play every dashboard slide first, then one MVIX live catch-up before repeating.
  return [...signageSlots, mvixLiveSlot()];
}

async function refreshPlaylist({ preservePosition = true } = {}) {
  const station = resolveStation();
  const previousId = slots[slotIndex % slots.length]?.id || '';
  const signageSlots = currentMode === 'mvix-only' ? [] : await loadSignageSlots(station);
  const nextSlots = buildRotation(currentMode, signageSlots);

  if (!nextSlots.length) return;
  slots = nextSlots;

  if (preservePosition && previousId) {
    const found = slots.findIndex((slot) => slot.id === previousId);
    if (found >= 0) slotIndex = found;
  }
}

async function init() {
  const station = resolveStation();
  currentMode = playlistMode();

  try {
    const signageSlots = currentMode === 'mvix-only' ? [] : await loadSignageSlots(station);
    slots = buildRotation(currentMode, signageSlots);

    if (!slots.length) {
      if (frame) frame.src = withCacheBust(`/weather?signage=1&station=${encodeURIComponent(station)}`);
      return;
    }

    slotIndex = 0;
    scheduleNext();

    if (currentMode !== 'mvix-only') {
      setInterval(() => {
        refreshPlaylist({ preservePosition: true }).catch((err) => {
          console.error('Playlist refresh failed:', err.message);
        });
      }, PLAYLIST_REFRESH_MS);
    }
  } catch (err) {
    console.error('MVIX playback init failed:', err.message);
    if (frame) {
      frame.src = currentMode === 'signage-only'
        ? withCacheBust(`/weather?signage=1&station=${encodeURIComponent(station)}`)
        : (pageParams().get('playbackUrl') || DEFAULT_MVIX_PLAYBACK_URL);
    }
  }
}

init();
