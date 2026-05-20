const weatherTemp = document.getElementById('weatherTemp');
const dispatchTime = document.getElementById('dispatchTime');
const countdownTimer = document.getElementById('countdownTimer');
const dispatchType = document.getElementById('dispatchType');
const dispatchPlace = document.getElementById('dispatchPlace');
const dispatchAddress = document.getElementById('dispatchAddress');
const dispatchUnits = document.getElementById('dispatchUnits');
const updatedText = document.getElementById('updatedText');
const weatherSummary = document.getElementById('weatherSummary');
const windText = document.getElementById('windText');
const recentList = document.getElementById('recentList');
const incidentDetails = document.getElementById('incidentDetails');
const specialNotes = document.getElementById('specialNotes');
const streetViewImage = document.getElementById('streetViewImage');
const satelliteImage = document.getElementById('satelliteImage');
const routeImage = document.getElementById('routeImage');
const ACTIVE911_TAKEOVER_DURATION_MS =
  Number(new URLSearchParams(window.location.search).get('durationMinutes') || 5) * 60 * 1000;
const ALERT_SOUND_ENABLED = new URLSearchParams(window.location.search).get('sound') !== '0';
let activeIncidentSent = '';
let lastRenderedAlertKey = '';
let alertAudioContext = null;
let screenWakeLock = null;

const TYPE_LABELS = {
  MEDICAL: 'MEDICAL',
  EMS: 'MEDICAL',
  FIRE: 'FIRE',
  ALARM: 'ALMFIR',
  NOEMERG: 'NO EMERGENCY',
  'NO EMERGENCY': 'NO EMERGENCY',
  HAZSIT: 'HAZSIT',
  HAZMAT: 'HAZSIT',
  'HAZARDOUS SITUATION': 'HAZSIT',
  PUBSERV: 'PUBSERV',
  SERVICE: 'PUBSERV',
  'PUBLIC SERVICE': 'PUBSERV',
  UNCATEGORIZED: 'UNCATEGORIZED',
  OTHER: 'UNCATEGORIZED',
  LAWENFORCE: 'LAWENFORCE',
  'LAW ENFORCEMENT SUPPORT': 'LAWENFORCE'
};

function displayType(value) {
  const key = String(value || '').trim().toUpperCase();
  const code = key.split('-')[0].trim();
  return TYPE_LABELS[key] || TYPE_LABELS[code] || key || 'ALERT';
}

function displayPlaceName(place, units) {
  const value = String(place || '').trim();
  const unitText = String(units || '').trim();

  if (!value) return '';
  if (value.toUpperCase() === unitText.toUpperCase()) return '';
  if (/^(UNIT|ENGINE|TRUCK|RESCUE|BATTALION|SQUAD|MEDIC)\s*\d+/i.test(value)) return '';

  return value;
}

function cleanIncidentDetails(value) {
let text = String(value || '').replace(/\s+/g, ' ').trim();

  text = text
    .replace(/(?:TIME|DATE):?\s*\d{1,2}:\d{2}:\d{2}/gi, ' ')
    .replace(/\d{1,2}:\d{2}:\d{2}/g, ' ')
    .replace(/\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:[T\s]\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)?/g, ' ')
    .replace(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g, ' ')
    .replace(/(?:DATE):?\s*(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/gi, ' ')
    .replace(/(?:^|[\s,;/-])(?:TIME|DATE):?\s*\d{1,2}:\d{2}:\d{2}(?=\D|$)/gi, ' ')
    .replace(/(?:^|[\s,;/-])\d{1,2}:\d{2}:\d{2}(?=\D|$)/g, ' ')
    .replace(/(?:^|[\s,;/-])\d{1,2}\/\d{1,2}\/\d{2,4}\s*\d{1,2}:\d{2}(?::\d{2})?(?=\D|$)/g, ' ')
    .replace(/(?:^|[\s,;/-])DATE:?\s*\d{1,2}\/\d{1,2}\/\d{2,4}(?=\D|$)/gi, ' ')
    .replace(/(?:^|[\s,;/-])\d{1,2}\/\d{1,2}\/\d{2,4}(?=\D|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return 'No incident details provided.';
  return text.length > 520 ? `${text.slice(0, 517)}...` : text;
}

function returnPath() {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo');
  if (returnTo) return returnTo;

  const path = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const station = params.get('station');

  if (path.includes('station2') || station === '2') return '/station2';
  if (path.includes('station3') || station === '3') return '/station3';
  return '/station1';
}

function shouldAutoReturn() {
  return Boolean(new URLSearchParams(window.location.search).get('returnTo'));
}

function isAlertActive(incident) {
  const sentAt = new Date(incident?.sent || '').getTime();
  return Number.isFinite(sentAt) && Date.now() - sentAt <= ACTIVE911_TAKEOVER_DURATION_MS;
}

function countdownText() {
  const sentAt = new Date(activeIncidentSent || '').getTime();
  if (!Number.isFinite(sentAt)) return 'Clears in --';

  const remaining = Math.max(0, ACTIVE911_TAKEOVER_DURATION_MS - (Date.now() - sentAt));
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `Clears in ${minutes}:${seconds}`;
}

function updateCountdown() {
  countdownTimer.textContent = countdownText();
}

async function requestScreenWakeLock() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;

  try {
    screenWakeLock = await navigator.wakeLock.request('screen');
    screenWakeLock.addEventListener('release', () => {
      screenWakeLock = null;
    });
  } catch (err) {
    console.warn('iPad screen wake lock unavailable:', err.message);
  }
}

function keepIpadAwake() {
  requestScreenWakeLock();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      requestScreenWakeLock();
    }
  });

  window.addEventListener('focus', requestScreenWakeLock);
  window.addEventListener('pageshow', requestScreenWakeLock);
  document.addEventListener('touchend', requestScreenWakeLock, { passive: true });
  document.addEventListener('click', requestScreenWakeLock);
}

function getAlertAudioContext() {
  if (!alertAudioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    alertAudioContext = new AudioContextClass();
  }

  return alertAudioContext;
}

async function playAlertToneSequence() {
  const context = getAlertAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    await context.resume();
  }

  const start = context.currentTime + 0.04;
  const tones = [
    { at: 0, frequency: 880, length: 0.22 },
    { at: 0.32, frequency: 660, length: 0.22 },
    { at: 0.64, frequency: 880, length: 0.36 }
  ];

  for (const tone of tones) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const toneStart = start + tone.at;
    const toneEnd = toneStart + tone.length;

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(tone.frequency, toneStart);

    gain.gain.setValueAtTime(0.0001, toneStart);
    gain.gain.exponentialRampToValueAtTime(0.34, toneStart + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(toneStart);
    oscillator.stop(toneEnd + 0.03);
  }
}

function alertSoundStorageKey(alertKey) {
  return `active911-alert-sounded:${alertKey}`;
}

function playAlertSound(alertKey) {
  if (!ALERT_SOUND_ENABLED || !alertKey) return;

  const storageKey = alertSoundStorageKey(alertKey);
  if (sessionStorage.getItem(storageKey)) return;

  sessionStorage.setItem(storageKey, 'true');

  playAlertToneSequence().catch((err) => {
    console.warn('Active911 alert sound blocked or unavailable:', err.message);
  });
}

function formatDispatchTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function routeStation() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('station');
  const path = window.location.pathname.toLowerCase();

  if (fromQuery === '2' || fromQuery?.toLowerCase() === 'station2' || path.includes('station2')) return '2';
  if (fromQuery === '3' || fromQuery?.toLowerCase() === 'station3' || path.includes('station3')) return '3';
  return '1';
}

function hasCoordinates(incident) {
  return incident?.latitude && incident?.longitude;
}

function mapQuery(incident) {
  const params = new URLSearchParams();

  if (incident?.latitude && incident?.longitude) {
    params.set('lat', incident.latitude);
    params.set('lon', incident.longitude);
  }

  if (incident?.address) {
    params.set('address', incident.address);
  }

  return params.toString();
}

function imageSize(element) {
  const rect = element.getBoundingClientRect();
  const width = Math.max(360, Math.round(rect.width || 640));
  const height = Math.max(220, Math.round(rect.height || 260));
  return `${width}x${height}`;
}

function renderRecent(items) {
  recentList.innerHTML = '';

  for (const item of items.slice(0, 5)) {
    const card = document.createElement('div');
    card.className = 'recent-item';
    card.innerHTML = `
      <div class="recent-type">${displayType(item.type)}</div>
      <div class="recent-address">${item.address || '--'}</div>
      <div class="recent-time">${formatDispatchTime(item.sent)}</div>
    `;
    recentList.appendChild(card);
  }
}

async function loadWeather(incident) {
  const queryText = mapQuery(incident);
  const query = queryText ? `?${queryText}` : '';

  try {
    const response = await fetch(`/api/weather${query}`, { cache: 'no-store' });
    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Weather unavailable');
    }

    weatherTemp.textContent = `${data.temp}\u00b0F`;
    weatherSummary.textContent = data.condition || 'Current';
    windText.textContent = `Wind: ${data.windMph} mph ${data.windDir || ''}`.trim();
  } catch (err) {
    weatherTemp.textContent = '--';
    weatherSummary.textContent = 'Weather unavailable';
    windText.textContent = 'Wind: --';
  }
}

function setMapImages(incident) {
  const query = mapQuery(incident);

  if (!query) {
    streetViewImage.removeAttribute('src');
    satelliteImage.removeAttribute('src');
    routeImage.removeAttribute('src');
    return;
  }

  const station = encodeURIComponent(routeStation());
  const stamp = Date.now();
  const streetSize = encodeURIComponent(imageSize(streetViewImage));
  const satelliteSize = encodeURIComponent(imageSize(satelliteImage));
  const routeSize = encodeURIComponent(imageSize(routeImage));

  streetViewImage.src = `/api/map/streetview?${query}&size=${streetSize}&fov=120&pitch=-2&radius=1000&ts=${stamp}`;
  satelliteImage.src = `/api/map/satellite?${query}&size=${satelliteSize}&hydrants=18&ts=${stamp}`;
  routeImage.src = `/api/map/route?station=${station}&${query}&size=${routeSize}&ts=${stamp}`;
}

function setWaiting(message = 'Waiting for Active911 alert') {
  dispatchTime.textContent = '--';
  activeIncidentSent = '';
  updateCountdown();
  dispatchType.textContent = 'Waiting';
  dispatchPlace.textContent = '';
  dispatchAddress.textContent = message;
  dispatchUnits.textContent = '--';
  incidentDetails.textContent = 'Waiting for incident information.';
  specialNotes.textContent = '';
  specialNotes.classList.remove('visible');
  weatherTemp.textContent = '--';
  weatherSummary.textContent = 'Live feed';
  windText.textContent = 'Active911 connected';
  setMapImages(null);
}

async function loadLatestAlert() {
  try {
    const response = await fetch(`/api/active911-takeover?ts=${Date.now()}`, { cache: 'no-store' });

    const data = await response.json();
    const recent = Array.isArray(data.recent) ? data.recent : [];
    const latest = recent[0];

    updatedText.textContent = `Last Updated ${data.updatedLabel || '--'}`;
    renderRecent(recent);

    if (!latest) {
      setWaiting(data.error || 'No recent Active911 alerts loaded');
      return;
    }

    const alertKey = `${latest.id || ''}|${latest.sent || ''}|${latest.address || ''}`;
    const isNewRenderedAlert = alertKey !== lastRenderedAlertKey;
    lastRenderedAlertKey = alertKey;

    if (!isAlertActive(latest)) {
      activeIncidentSent = '';
      updateCountdown();

      if (shouldAutoReturn()) {
        window.location.href = returnPath();
        return;
      }

      setWaiting('No active incident. Waiting for next Active911 alert.');
      return;
    }

    activeIncidentSent = latest.sent || '';
    updateCountdown();
    dispatchTime.textContent = formatDispatchTime(latest.sent);
    dispatchType.textContent = displayType(latest.type || latest.normalizedType || latest.rawType || latest.cadCode);
    dispatchPlace.textContent = displayPlaceName(latest.businessName, latest.units);
    dispatchAddress.textContent = latest.address || 'Address unavailable';
    dispatchUnits.textContent = latest.units || 'Units pending';
    incidentDetails.textContent = cleanIncidentDetails(
      latest.details ||
      latest.rawType ||
      latest.cadCode ||
      latest.businessName ||
      'No incident details provided.'
    );
    specialNotes.textContent = latest.specialNotes || '';
    specialNotes.classList.toggle('visible', Boolean(latest.specialNotes));

    await loadWeather(latest);
    if (isNewRenderedAlert) {
      playAlertSound(alertKey);
      setMapImages(latest);
    }
  } catch (err) {
    setWaiting('Unable to reach Active911 feed');
    updatedText.textContent = `Last Updated ${new Date().toLocaleString()}`;
    incidentDetails.textContent = err.message;
    recentList.innerHTML = '';
  }
}

keepIpadAwake();
loadLatestAlert();
setInterval(loadLatestAlert, 15000);
setInterval(updateCountdown, 1000);

