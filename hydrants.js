let hydrantMap;
let hydrantLayer;
let hydrantMapFramed = false;

const providerNames = [
  'Horn Lake Water',
  'Horn Lake Water Association',
  'Days Water',
  'Walls Water Association'
];

const statusColors = {
  available: '#2f80ed',
  oos: '#050505',
  'low-flow': '#f97316',
  'under-repair': '#f2c94c',
  testing: '#f2c94c',
  private: '#94a3b8',
  unknown: '#94a3b8'
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function fmt(n) {
  return Number(n || 0).toLocaleString('en-US');
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normStatus(value) {
  const s = String(value || '').trim().toLowerCase();

  if (s === 'out of service') return 'oos';
  if (s === 'low flow') return 'low-flow';
  if (s === 'under repair') return 'under-repair';
  if (s === 'available') return 'available';
  if (s === 'testing') return 'testing';
  if (s === 'private') return 'private';
  if (s === 'oos') return 'oos';

  return 'unknown';
}

function labelStatus(value) {
  const s = normStatus(value);
  if (s === 'oos') return 'OUT OF SERVICE';
  if (s === 'low-flow') return 'LOW FLOW';
  if (s === 'under-repair') return 'UNDER REPAIR';
  if (s === 'testing') return 'TESTING';
  if (s === 'private') return 'PRIVATE';
  if (s === 'available') return 'AVAILABLE';
  return 'UNKNOWN';
}

async function loadHydrants() {
  try {
    setText('statusText', 'Updating OOS hydrants...');

    const res = await fetch('/api/hydrants-status?ts=' + Date.now(), {
      cache: 'no-store'
    });

    const data = await res.json();

    if (!data.ok) {
      throw new Error(data.error || 'Hydrant status failed');
    }

    render(data);

    setText('statusText', 'Live OOS hydrant feed connected');
  } catch (err) {
    console.error(err);
    setText('statusText', 'OOS hydrant feed failed');
  }
}

function render(data) {
  const summary = data.summary || {};
  const outOfServiceHydrants = safeArray(data.hydrants).filter(h => normStatus(h.status) === 'oos');

  setText('totalHydrants', fmt(summary.total));
  setText('oosHydrants', fmt(outOfServiceHydrants.length || summary.oos));
  setText('repairHydrants', fmt(summary.underRepair + summary.testing));

  setText(
    'lastUpdated',
    data.updated
      ? 'Last Updated ' + new Date(data.updated).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      : 'Last Updated --'
  );

  renderProviders(data.byProvider || {});
  renderNotes(outOfServiceHydrants);
  renderMap(outOfServiceHydrants);
}

function renderProviders(byProvider) {
  const box = document.getElementById('providerGrid');
  if (!box) return;

  const providers = [
    ...providerNames,
    ...Object.keys(byProvider).filter(provider => !providerNames.includes(provider)).sort()
  ];

  box.innerHTML = providers.map(provider => {
    const p = byProvider[provider] || {
      total: 0,
      oos: 0,
      lowFlow: 0,
      underRepair: 0
    };

    return `
      <div class="provider-card">
        <h3>${provider}</h3>
        <div class="provider-stats">
          <div class="stat-box">
            <span>Total</span>
            <strong>${fmt(p.total)}</strong>
          </div>
          <div class="stat-box">
            <span>OOS</span>
            <strong>${fmt(p.oos)}</strong>
          </div>
          <div class="stat-box">
            <span>Low</span>
            <strong>${fmt(p.lowFlow)}</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderNotes(items) {
  const box = document.getElementById('notesList');
  if (!box) return;

  if (!items.length) {
    box.innerHTML = `
      <div class="note-card">
        <h3>No OOS Hydrants</h3>
        <p>No out of service hydrants are currently listed.</p>
      </div>
    `;
    return;
  }

  box.innerHTML = items.slice(0, 8).map(h => `
    <div class="note-card">
      <h3>${h.hydrant_id || h.location_id || 'HYDRANT'} - ${h.location || h.location_name || 'Address not listed'}</h3>
      <p>Provider: ${h.provider || 'Unknown Provider'}</p>
    </div>
  `).join('');
}

function renderMap(hydrants) {
  if (!hydrantMap) {
    hydrantMap = L.map('hydrantMap', {
      zoomControl: false,
      attributionControl: false
    }).setView([34.955, -90.034], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(hydrantMap);

    hydrantLayer = L.layerGroup().addTo(hydrantMap);
  }

  hydrantLayer.clearLayers();

  const bounds = [];
  let plotted = 0;

  hydrants.forEach(h => {
    const lat = Number(h.lat);
    const lon = Number(h.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    const status = normStatus(h.status);
    const color = statusColors[status] || statusColors.unknown;

    const marker = L.circleMarker([lat, lon], {
      radius: status === 'available' ? 4 : 8,
      color: '#ffffff',
      weight: status === 'available' ? 1 : 2,
      fillColor: color,
      fillOpacity: status === 'available' ? 0.55 : 0.95
    });

    marker.bindPopup(`
      <b>${h.hydrant_id || h.location_id || 'HYDRANT'}</b><br>
      ${h.location || h.location_name || ''}<br>
      ${h.provider || 'Unknown Provider'}<br>
      ${labelStatus(h.status)}
    `);

    marker.addTo(hydrantLayer);
    bounds.push([lat, lon]);
    plotted++;
  });

  setText('mapSummary', `${fmt(plotted)} mapped hydrants`);

  if (bounds.length && !hydrantMapFramed) {
    hydrantMap.fitBounds(bounds, {
      paddingTopLeft: [0, 0],
      paddingBottomRight: [0, 0],
      maxZoom: 16
    });
    hydrantMapFramed = true;
  }

  setTimeout(() => {
    hydrantMap.invalidateSize();
  }, 250);
}

loadHydrants();
setInterval(loadHydrants, 30000);
