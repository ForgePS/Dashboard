const weatherTemp = document.getElementById('weatherTemp');
const dispatchTime = document.getElementById('dispatchTime');
const dispatchType = document.getElementById('dispatchType');
const dispatchAddress = document.getElementById('dispatchAddress');
const dispatchUnits = document.getElementById('dispatchUnits');
const updatedText = document.getElementById('updatedText');
const weatherSummary = document.getElementById('weatherSummary');
const windText = document.getElementById('windText');
const recentList = document.getElementById('recentList');
const incidentDetails = document.getElementById('incidentDetails');
const streetViewFrame = document.getElementById('streetViewFrame');
const satelliteImage = document.getElementById('satelliteImage');
const routeImage = document.getElementById('routeImage');

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
  return TYPE_LABELS[key] || key || 'ALERT';
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
  const query = hasCoordinates(incident)
    ? `?lat=${encodeURIComponent(incident.latitude)}&lon=${encodeURIComponent(incident.longitude)}`
    : '';

  try {
    const response = await fetch(`/api/weather${query}`, { cache: 'no-store' });
    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Weather unavailable');
    }

    weatherTemp.textContent = `${data.temp}°F`;
    weatherSummary.textContent = data.condition || 'Current';
    windText.textContent = `Wind: ${data.windMph} mph ${data.windDir || ''}`.trim();
  } catch (err) {
    weatherTemp.textContent = '--';
    weatherSummary.textContent = 'Weather unavailable';
    windText.textContent = 'Wind: --';
  }
}

function setMapImages(incident) {
  if (!hasCoordinates(incident)) {
    streetViewFrame.removeAttribute('src');
    satelliteImage.removeAttribute('src');
    routeImage.removeAttribute('src');
    return;
  }

  const lat = encodeURIComponent(incident.latitude);
  const lon = encodeURIComponent(incident.longitude);
  const station = encodeURIComponent(routeStation());
  const stamp = Date.now();

  streetViewFrame.src = `/api/map/streetview?lat=${lat}&lon=${lon}&size=640x260&fov=120&pitch=-2&radius=1000&ts=${stamp}`;
  satelliteImage.src = `/api/map/satellite?lat=${lat}&lon=${lon}&size=640x260&hydrants=18&ts=${stamp}`;
  routeImage.src = `/api/map/route?station=${station}&lat=${lat}&lon=${lon}&size=640x260&ts=${stamp}`;
}

function setWaiting(message = 'Waiting for Active911 alert') {
  dispatchTime.textContent = '--';
  dispatchType.textContent = 'Waiting';
  dispatchAddress.textContent = message;
  dispatchUnits.textContent = '--';
  incidentDetails.textContent = 'Waiting for incident information.';
  weatherTemp.textContent = '--';
  weatherSummary.textContent = 'Live feed';
  windText.textContent = 'Active911 connected';
  setMapImages(null);
}

async function loadLatestAlert() {
  try {
    const response = await fetch(`/api/latest?ts=${Date.now()}`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Feed returned ${response.status}`);
    }

    const data = await response.json();
    const recent = Array.isArray(data.recent) ? data.recent : [];
    const latest = recent[0];

    updatedText.textContent = `Last Updated ${data.updatedLabel || '--'}`;
    renderRecent(recent);

    if (!latest) {
      setWaiting('No recent incident loaded');
      return;
    }

    dispatchTime.textContent = formatDispatchTime(latest.sent);
    dispatchType.textContent = displayType(latest.type || latest.rawType || latest.cadCode);
    dispatchAddress.textContent = latest.address || 'Address unavailable';
    dispatchUnits.textContent = latest.units || 'Units pending';
    incidentDetails.textContent =
      latest.details ||
      latest.rawType ||
      latest.cadCode ||
      latest.businessName ||
      'No incident details provided.';

    await loadWeather(latest);
    setMapImages(latest);
  } catch (err) {
    setWaiting('Unable to reach Active911 feed');
    updatedText.textContent = `Last Updated ${new Date().toLocaleString()}`;
    incidentDetails.textContent = err.message;
    recentList.innerHTML = '';
  }
}

loadLatestAlert();
setInterval(loadLatestAlert, 15000);
