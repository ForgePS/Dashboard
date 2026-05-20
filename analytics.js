const CATEGORY_ORDER = [
  'MEDICAL - Medical',
  'FIRE - Fire',
  'NOEMERG - No Emergency',
  'HAZSIT - Hazardous Situation',
  'PUBSERV - Public Service',
  'UNCATEGORIZED - Uncategorized',
  'LAWENFORCE - Law Enforcement Support'
];

const CATEGORY_COLORS = {
  'MEDICAL - Medical': '#2f80ed',
  'FIRE - Fire': '#e74c3c',
  'NOEMERG - No Emergency': '#9aa4b2',
  'HAZSIT - Hazardous Situation': '#f2b84b',
  'PUBSERV - Public Service': '#2eb872',
  'UNCATEGORIZED - Uncategorized': '#8e7cc3',
  'LAWENFORCE - Law Enforcement Support': '#35b7c8'
};

const CATEGORY_LABELS = {
  'MEDICAL - Medical': 'MEDICAL',
  'FIRE - Fire': 'FIRE',
  'NOEMERG - No Emergency': 'NO EMERGENCY',
  'HAZSIT - Hazardous Situation': 'HAZARDOUS SITUATION',
  'PUBSERV - Public Service': 'PUBLIC SERVICE',
  'UNCATEGORIZED - Uncategorized': 'UNCATEGORIZED',
  'LAWENFORCE - Law Enforcement Support': 'LAW ENFORCEMENT SUPPORT'
};

const numberFormat = new Intl.NumberFormat('en-US');
const ACTIVE911_TAKEOVER_DURATION_MS =
  Number(new URLSearchParams(window.location.search).get('takeoverMinutes') || 5) * 60 * 1000;
let dailyChart;
let lastTakeoverAlertId = sessionStorage.getItem('lastTakeoverAlertId') || '';

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setWidth(id, percent) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function formatCount(value) {
  return numberFormat.format(Number(value || 0));
}

function getTypeCount(typeCounts, category) {
  return Number(typeCounts?.[category] || 0);
}

function renderKpis(data) {
  const totals = data.totals || {};
  const oldestLabel = data.dateRange?.oldestLabel
    ? String(data.dateRange.oldestLabel).split(',')[0]
    : 'First alarm date';

  setText('totalCalls', formatCount(totals.total));
  setText('fireCalls', formatCount(totals.fire));
  setText('emsCalls', formatCount(totals.ems));
  setText('otherCalls', formatCount(totals.other));
  setText('firePercent', `${Number(totals.firePercent || 0)}% of calls`);
  setText('emsPercent', `${Number(totals.emsPercent || 0)}% of calls`);
  setText('otherPercent', `${Number(totals.otherPercent || 0)}% of calls`);

  setText('fireSplitValue', `${formatCount(totals.fire)} (${Number(totals.firePercent || 0)}%)`);
  setText('emsSplitValue', `${formatCount(totals.ems)} (${Number(totals.emsPercent || 0)}%)`);
  setText('otherSplitValue', `${formatCount(totals.other)} (${Number(totals.otherPercent || 0)}%)`);
  setWidth('fireSplitBar', Number(totals.firePercent || 0));
  setWidth('emsSplitBar', Number(totals.emsPercent || 0));
  setWidth('otherSplitBar', Number(totals.otherPercent || 0));

  setText('monthlyRange', `${oldestLabel} to Current`);
}

function renderTypeBreakdown(typeCounts) {
  const container = document.getElementById('typeBreakdown');
  if (!container) return;
  container.classList.add('exact-type-list');
  container.dataset.categoryCount = String(CATEGORY_ORDER.length);

  const rows = CATEGORY_ORDER.map((name) => ({
    name,
    label: CATEGORY_LABELS[name] || name,
    value: getTypeCount(typeCounts, name)
  }));
  const max = Math.max(1, ...rows.map((row) => row.value));

  container.innerHTML = rows.map((row) => {
    const percent = Math.round((row.value / max) * 100);
    const color = CATEGORY_COLORS[row.name] || '#2f80ed';

    return `
      <div class="exact-type-row">
        <div class="exact-type-name">${row.label}</div>
        <div class="exact-type-count">${formatCount(row.value)}</div>
        <div class="exact-type-meter">
          <div class="exact-type-fill" style="width:${percent}%; background:${color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecent(recent) {
  const container = document.getElementById('recentList');
  if (!container) return;

  if (!recent?.length) {
    container.innerHTML = '<div class="empty-state">No recent incidents found.</div>';
    return;
  }

  container.innerHTML = recent.map((item) => `
    <div class="recent-item">
      <div>
        <strong>${CATEGORY_LABELS[item.type] || item.type || 'UNCATEGORIZED'}</strong>
        <span>${item.address || item.businessName || '--'}</span>
      </div>
      <small>${item.timeLabel || '--'}</small>
    </div>
  `).join('');
}

function renderHotspots(addresses) {
  const container = document.getElementById('hotspotList');
  if (!container) return;
  container.classList.add('hotspot-card-list');

  if (!addresses?.length) {
    container.innerHTML = '<div class="empty-state">No address activity found.</div>';
    return;
  }

  const max = Math.max(1, ...addresses.map((item) => Number(item.calls || 0)));

  container.innerHTML = addresses.map((item, index) => {
    const calls = Number(item.calls || 0);
    const width = Math.round((calls / max) * 100);

    return `
    <div class="hotspot-card">
      <div class="hotspot-rank">${index + 1}</div>
      <div class="hotspot-main">
        <div class="hotspot-address">${item.address || '--'}</div>
        <div class="hotspot-meter"><div style="width:${width}%"></div></div>
      </div>
      <div class="hotspot-count">
        <strong>${formatCount(calls)}</strong>
        <span>calls</span>
      </div>
    </div>
  `;
  }).join('');
}

function renderDailyChart(daily) {
  const canvas = document.getElementById('dailyChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = (daily || []).map((item) => item.month || item.date);
  const totals = (daily || []).map((item) => Number(item.total || 0));
  const fire = (daily || []).map((item) => Number(item.fire || 0));
  const medical = (daily || []).map((item) => Number(item.ems || 0));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total',
        data: totals,
        borderColor: '#f2b84b',
        backgroundColor: 'rgba(242, 184, 75, 0.14)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Medical',
        data: medical,
        borderColor: '#2f80ed',
        backgroundColor: 'rgba(47, 128, 237, 0.12)',
        tension: 0.3
      },
      {
        label: 'Fire',
        data: fire,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.12)',
        tension: 0.3
      }
    ]
  };

  if (dailyChart) {
    dailyChart.data = chartData;
    dailyChart.update();
    return;
  }

  dailyChart = new Chart(canvas, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#dce4ef'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#a8b3c2' },
          grid: { color: 'rgba(168, 179, 194, 0.15)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#a8b3c2', precision: 0 },
          grid: { color: 'rgba(168, 179, 194, 0.15)' }
        }
      }
    }
  });
}

function renderDashboard(data) {
  setText('statusText', 'Live analytics connected');
  setText('lastUpdated', `Last Updated ${data.updatedLabel || '--'}`);
  renderKpis(data);
  renderDailyChart(data.daily || []);
  renderTypeBreakdown(data.typeCounts || {});
  renderRecent(data.recent || []);
  renderHotspots(data.busiestAddresses || []);
}

async function refreshAnalytics() {
  try {
    const response = await fetch('/api/analytics-dashboard', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Analytics HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Analytics response failed');

    renderDashboard(data);
  } catch (err) {
    setText('statusText', `Analytics update failed: ${err.message}`);
  }
}

function stationTakeoverPath() {
  const path = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const station = params.get('station');

  const duration = new URLSearchParams(window.location.search).get('takeoverMinutes');
  const takeoverParams = new URLSearchParams();
  takeoverParams.set('returnTo', path.includes('station2') || station === '2'
    ? '/station2'
    : path.includes('station3') || station === '3'
      ? '/station3'
      : '/station1');

  if (duration) takeoverParams.set('durationMinutes', duration);

  const suffix = `?${takeoverParams.toString()}`;

  if (path.includes('station2') || station === '2') return `/station2/alert${suffix}`;
  if (path.includes('station3') || station === '3') return `/station3/alert${suffix}`;
  return `/station1/alert${suffix}`;
}

async function checkActive911Takeover() {
  try {
    const response = await fetch('/api/active911-takeover', { cache: 'no-store' });
    const data = await response.json();
    const latest = Array.isArray(data.recent) ? data.recent[0] : null;

    if (!latest?.id || !latest.sent) return;

    const sentAt = new Date(latest.sent).getTime();
    if (!Number.isFinite(sentAt)) return;

    const isActive = Date.now() - sentAt <= ACTIVE911_TAKEOVER_DURATION_MS;
    if (!isActive) return;

    if (latest.id !== lastTakeoverAlertId) {
      lastTakeoverAlertId = latest.id;
      sessionStorage.setItem('lastTakeoverAlertId', latest.id);
    }

    window.location.href = stationTakeoverPath();
  } catch (err) {
    console.warn('Active911 takeover check failed:', err.message);
  }
}

refreshAnalytics();
checkActive911Takeover();
setInterval(refreshAnalytics, 15000);
setInterval(checkActive911Takeover, 15000);
