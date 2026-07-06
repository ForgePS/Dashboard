const frame = document.getElementById('signageFrame');

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

function buildSlotUrl(slot, station) {
  if (slot.type === 'video') {
    const src = slot.path || slot.url;
    if (!src) return `/signage-asset.html?type=video&src=`;
    const asset = new URL('/signage-asset.html', window.location.origin);
    asset.searchParams.set('type', 'video');
    asset.searchParams.set('src', src);
    return asset.toString();
  }

  if (slot.type === 'image') {
    const src = slot.path || slot.url;
    if (!src) return `/signage-asset.html?type=image&src=`;
    const asset = new URL('/signage-asset.html', window.location.origin);
    const isPdf = slot.assetType === 'pdf' || /\.pdf(?:$|\?)/i.test(src);
    asset.searchParams.set('type', isPdf ? 'pdf' : 'image');
    asset.searchParams.set('src', src);
    return asset.toString();
  }

  if (slot.type === 'url' && slot.url) {
    return slot.url;
  }

  const url = new URL(slot.path, window.location.origin);
  url.searchParams.set('signage', '1');
  url.searchParams.set('station', station);
  return url.toString();
}

let slots = [];
let slotIndex = 0;
let rotationTimer = null;

function showSlot(slot) {
  const station = resolveStation();
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

async function init() {
  const station = resolveStation();

  try {
    const response = await fetch(`/api/signage-playlist?station=${encodeURIComponent(station)}&ts=${Date.now()}`, {
      cache: 'no-store'
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'playlist unavailable');

    slots = (Array.isArray(data.slots) ? data.slots : []).filter((slot) => {
      if (!slot || slot.disabled) return false;
      if (slot.expireOn) {
        const expires = Date.parse(slot.expireOn);
        if (Number.isFinite(expires) && expires <= Date.now()) return false;
      }
      if (slot.type === 'video' || slot.type === 'image') return Boolean(slot.path || slot.url);
      if (slot.type === 'url') return Boolean(slot.url);
      return Boolean(slot.path);
    });

    if (!slots.length) {
      frame.src = `/weather?signage=1&station=${encodeURIComponent(station)}`;
      return;
    }

    scheduleNext();
  } catch (err) {
    console.error('Signage playlist failed:', err.message);
    frame.src = `/weather?signage=1&station=${encodeURIComponent(station)}`;
  }
}

init();
