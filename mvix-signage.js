const params = new URLSearchParams(window.location.search);
const station = String(params.get('station') || '').trim();
const showBadge = params.get('badge') === '1';
const frame = document.getElementById('signageFrame');
const slotBadge = document.getElementById('slotBadge');
const slotTitle = document.getElementById('slotTitle');

let slots = [];
let slotIndex = 0;
let rotationTimer = null;

function resolveStation() {
  if (['1', '2', '3'].includes(station)) return station;

  const path = window.location.pathname.toLowerCase();
  const match = path.match(/station([123])/);
  return match ? match[1] : '';
}

function slotMatchesStation(slot, activeStation) {
  if (!Array.isArray(slot.stations) || !slot.stations.length) return true;
  if (!activeStation) return true;
  return slot.stations.includes(activeStation);
}

function buildSlotUrl(slot, activeStation) {
  const url = new URL(slot.path, window.location.origin);
  url.searchParams.set('mvix', '1');
  if (activeStation) url.searchParams.set('station', activeStation);
  return url.toString();
}

function showSlot(slot) {
  const activeStation = resolveStation();
  frame.src = buildSlotUrl(slot, activeStation);

  if (showBadge && slotTitle && slotBadge) {
    slotTitle.textContent = slot.title || slot.id || 'Signage';
    slotBadge.hidden = false;
  }
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

async function loadSignageConfig() {
  const response = await fetch(`/api/mvix-signage?ts=${Date.now()}`, { cache: 'no-store' });
  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || 'Unable to load signage config');
  }

  const activeStation = resolveStation();
  return (Array.isArray(data.slots) ? data.slots : []).filter((slot) => {
    return slot && slot.path && slot.disabled !== true && slotMatchesStation(slot, activeStation);
  });
}

async function init() {
  try {
    slots = await loadSignageConfig();

    if (!slots.length) {
      if (slotTitle) slotTitle.textContent = 'No signage slots configured';
      if (slotBadge) slotBadge.hidden = !showBadge;
      return;
    }

    scheduleNext();
  } catch (err) {
    if (slotTitle) slotTitle.textContent = 'Signage config error';
    if (slotBadge) slotBadge.hidden = !showBadge;
    console.error('MVIX signage failed to start:', err.message);
  }
}

init();
