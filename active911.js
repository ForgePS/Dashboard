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
const satelliteFrame = document.getElementById('satelliteFrame');
const routeFrame = document.getElementById('routeFrame');

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

function mapQuery(incident) {
  if (incident.latitude && incident.longitude) {
    return `${incident.latitude},${incident.longitude}`;
  }

  return `${incident.address || 'Horn Lake, MS'} Horn Lake MS`;
}

function setMapFrames(incident) {
  const query = encodeURIComponent(mapQuery(incident));

  streetViewFrame.src = `https://maps.google.com/maps?q=${query}&layer=c&output=svembed`;
  satelliteFrame.src = `https://maps.google.com/maps?q=${query}&t=k&z=17&output=embed`;
  routeFrame.src = `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
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

function setWaiting(message = 'Waiting for Active911 alert') {
  dispatchTime.textContent = '--';
  dispatchType.textContent = 'Waiting';
  dispatchAddress.textContent = message;
  dispatchUnits.textContent = '--';
  incidentDetails.textContent = 'Waiting for incident information.';
  weatherSummary.textContent = 'Live feed';
  windText.textContent = 'Active911 connected';
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
    weatherSummary.textContent = 'Clear';
    windText.textContent = data.active911?.lastPollError ? 'Feed warning' : 'Active911 connected';
    setMapFrames(latest);
  } catch (err) {
    setWaiting('Unable to reach Active911 feed');
    updatedText.textContent = `Last Updated ${new Date().toLocaleString()}`;
    incidentDetails.textContent = err.message;
    recentList.innerHTML = '';
  }
}

loadLatestAlert();
setInterval(loadLatestAlert, 15000);
