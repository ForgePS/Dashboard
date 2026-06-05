const APP_KEY = 'hlfdRmsData';
const SESSION_KEY = 'hlfdRmsSession';
const sections = [
  { id: 'dashboard', icon: 'DB', title: 'Dashboard' },
  { id: 'incidents', icon: 'IN', title: 'Incidents' },
  { id: 'nfirs', icon: 'NF', title: 'NFIRS' },
  { id: 'personnel', icon: 'PE', title: 'Personnel' },
  { id: 'training', icon: 'TR', title: 'Training' },
  { id: 'preplans', icon: 'PP', title: 'Preplans' },
  { id: 'inspections', icon: 'FI', title: 'Inspections' },
  { id: 'hydrants', icon: 'HY', title: 'Hydrants' },
  { id: 'inventory', icon: 'IV', title: 'Inventory' },
  { id: 'maintenance', icon: 'MT', title: 'Maintenance' },
  { id: 'reports', icon: 'RP', title: 'Reports' },
  { id: 'admin', icon: 'AD', title: 'Admin' }
];

const apparatusNames = [
  'Rescue 1', 'Engine 2', 'Engine 3', 'Engine 4', 'Truck 1', 'Truck 3',
  'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'NW1',
  '100', '101', '104', '105', '106', '107',
  'FD 2', 'FD 3', 'FD 4', 'FD 5', 'Water Truck'
];

const serviceItems = [
  'Oil change', 'Fuel filter replacement', 'Air filter inspection', 'Brake inspection',
  'Tire inspection', 'Battery test', 'Fluid level check', 'Pump test',
  'Hose bed inspection', 'Lights and siren check', 'Hydraulic system inspection',
  'Ladder inspection', 'Oxygen system check', 'Radio check', 'Clean and detail'
];

const maintenanceParts = [
  ['Engine oil filter', 'FLT-1001'], ['Fuel filter', 'FLT-1002'], ['Air filter', 'FLT-1003'],
  ['Wiper blades', 'GEN-2401'], ['Brake pads', 'BRK-4100'], ['Scene light bulb', 'ELC-2108'],
  ['Pump packing kit', 'PMP-3302'], ['Battery', 'BAT-31HD'], ['Coolant', 'FLD-5002']
];

const schemas = {
  incidents: [
    ['incidentNumber', 'Incident Number'], ['date', 'Date', 'date'], ['type', 'Incident Type'],
    ['address', 'Address'], ['station', 'Station', 'select', ['Station 1', 'Station 2', 'Station 3']],
    ['apparatus', 'Apparatus'], ['officer', 'Officer'], ['status', 'Status', 'select', ['Open', 'Complete', 'Needs Review']],
    ['notes', 'Narrative', 'textarea']
  ],
  nfirs: [
    ['incidentNumber', 'Incident Number'], ['module', 'NFIRS Module', 'select', ['Basic', 'Fire', 'EMS', 'Hazmat', 'Wildland']],
    ['propertyUse', 'Property Use'], ['actionsTaken', 'Actions Taken'], ['casualties', 'Casualties'],
    ['reviewStatus', 'Review Status', 'select', ['Draft', 'Ready for Review', 'Submitted']],
    ['notes', 'Notes', 'textarea']
  ],
  personnel: [
    ['name', 'Name'], ['rank', 'Rank'], ['employeeId', 'Employee ID'], ['station', 'Station', 'select', ['Station 1', 'Station 2', 'Station 3']],
    ['shift', 'Shift', 'select', ['A Shift', 'B Shift', 'C Shift', 'Day Staff']], ['phone', 'Phone'],
    ['email', 'Email'], ['password', 'Password'], ['status', 'Status', 'select', ['Active', 'Reserve', 'Leave', 'Inactive']],
    ['adminAccess', 'Admin Access', 'select', ['No', 'Yes']],
    ['certifications', 'Certifications', 'textarea']
  ],
  training: [
    ['course', 'Course'], ['date', 'Date', 'date'], ['instructor', 'Instructor'], ['hours', 'Hours', 'number'],
    ['category', 'Category', 'select', ['Fire', 'EMS', 'Driver', 'Officer', 'Hazmat', 'Technical Rescue']],
    ['members', 'Members'], ['status', 'Status', 'select', ['Scheduled', 'Completed', 'Needs Documentation']],
    ['notes', 'Notes', 'textarea']
  ],
  preplans: [
    ['occupancy', 'Occupancy'], ['address', 'Address'], ['contact', 'Contact'], ['phone', 'Phone'],
    ['hazards', 'Hazards', 'textarea'], ['hydrants', 'Hydrants'], ['knoxBox', 'Knox Box'],
    ['lastReviewed', 'Last Reviewed', 'date'], ['status', 'Status', 'select', ['Current', 'Needs Review', 'Draft']]
  ],
  inspections: [
    ['business', 'Business'], ['address', 'Address'], ['inspectionDate', 'Inspection Date', 'date'],
    ['inspector', 'Inspector'], ['type', 'Type', 'select', ['Annual', 'Reinspection', 'Complaint', 'New Business']],
    ['violations', 'Violations', 'textarea'], ['status', 'Status', 'select', ['Passed', 'Corrections Needed', 'Scheduled']],
    ['followUp', 'Follow Up', 'date']
  ],
  hydrants: [
    ['hydrantId', 'Hydrant ID'], ['address', 'Nearest Address'], ['flowGpm', 'Flow GPM', 'number'],
    ['mainSize', 'Main Size'], ['lastService', 'Last Service', 'date'], ['condition', 'Condition', 'select', ['Good', 'Needs Paint', 'Needs Repair', 'Out of Service']],
    ['notes', 'Notes', 'textarea']
  ],
  inventory: [
    ['item', 'Item'], ['category', 'Category', 'select', ['EMS', 'Firefighting', 'PPE', 'Station Supply', 'Tool', 'Radio']],
    ['quantity', 'Quantity', 'number'], ['minimum', 'Minimum Stock', 'number'], ['location', 'Location', 'select', ['Station 1', 'Station 2', 'Station 3', 'Warehouse']],
    ['vendor', 'Vendor'], ['partNumber', 'Part Number'], ['notes', 'Notes', 'textarea']
  ],
  reports: [
    ['name', 'Report Name'], ['type', 'Type', 'select', ['Incident', 'Training', 'Maintenance', 'Inspection', 'Inventory']],
    ['dateRange', 'Date Range'], ['owner', 'Owner'], ['status', 'Status', 'select', ['Draft', 'Ready', 'Archived']],
    ['notes', 'Notes', 'textarea']
  ],
  admin: [
    ['setting', 'Setting'], ['owner', 'Owner'], ['category', 'Category', 'select', ['Users', 'Permissions', 'Workflow', 'Notifications', 'Data']],
    ['status', 'Status', 'select', ['Active', 'Review', 'Disabled']], ['notes', 'Notes', 'textarea']
  ]
};

const seed = {
  apparatusList: apparatusNames,
  incidents: [
    { incidentNumber: 'HL-260604-001', date: '2026-06-04', type: 'Medical Assist', address: 'Goodman Rd W', station: 'Station 1', apparatus: 'Rescue 1', officer: 'Battalion 100', status: 'Open', notes: 'Initial record awaiting final narrative.' }
  ],
  nfirs: [
    { incidentNumber: 'HL-260604-001', module: 'EMS', propertyUse: 'Street', actionsTaken: 'Patient care', casualties: '0', reviewStatus: 'Draft', notes: '' }
  ],
  personnel: [
    { name: 'Battalion 100', rank: 'Battalion Chief', employeeId: '100', station: 'Station 1', shift: 'Day Staff', phone: '', email: 'admin@hornlakefire.com', password: '100', status: 'Active', adminAccess: 'Yes', certifications: 'Command, Fire Officer' }
  ],
  training: [
    { course: 'Driver Operator Review', date: '2026-06-04', instructor: 'Training Officer', hours: '2', category: 'Driver', members: 'Engine companies', status: 'Scheduled', notes: '' }
  ],
  preplans: [],
  inspections: [],
  hydrants: [],
  inventory: [
    { item: 'Nitrile Gloves', category: 'EMS', quantity: '24', minimum: '12', location: 'Station 1', vendor: 'Medical Supply', partNumber: 'EMS-GLV-L', notes: '' }
  ],
  reports: [],
  admin: [],
  maintenance: apparatusNames.map(name => blankApparatus(name))
};

let data = loadData();
let currentUserId = localStorage.getItem(SESSION_KEY) || '';
let activeSection = initialSection();
let maintenanceMode = 'fleet';
let editing = null;

const signinScreen = document.getElementById('signinScreen');
const signinForm = document.getElementById('signinForm');
const signinEmail = document.getElementById('signinEmail');
const signinPassword = document.getElementById('signinPassword');
const signinMessage = document.getElementById('signinMessage');
const nav = document.getElementById('sectionNav');
const title = document.getElementById('sectionTitle');
const statsGrid = document.getElementById('statsGrid');
const workspace = document.getElementById('workspace');
const searchInput = document.getElementById('searchInput');
const addRecordBtn = document.getElementById('addRecordBtn');
const signOutBtn = document.getElementById('signOutBtn');
const currentUserBadge = document.getElementById('currentUserBadge');
const modal = document.getElementById('recordModal');
const form = document.getElementById('recordForm');
const modalFields = document.getElementById('modalFields');
const modalTitle = document.getElementById('modalTitle');
const modalSection = document.getElementById('modalSection');

function apparatusType(name) {
  if (name.startsWith('Engine')) return 'Pumper';
  if (name.startsWith('Truck')) return 'Ladder Truck';
  if (name.startsWith('Rescue')) return 'Ambulance';
  if (name === 'Water Truck') return 'Support Vehicle';
  if (name.startsWith('Unit') || name === 'NW1') return 'Support Vehicle';
  return 'Fleet';
}

function blankApparatus(name, options = {}) {
  return {
    name,
    type: options.type || apparatusType(name),
    status: options.status || 'Needs Data',
    location: options.location || 'Station 1',
    make: '',
    model: '',
    year: '',
    vin: '',
    mileage: '',
    engineHours: '',
    serviceLogs: [],
    fuelLogs: [],
    runLogs: [],
    parts: maintenanceParts.map(([part, number]) => ({ part, number })),
    selectedServiceItems: [],
    operatingHours: 0,
    failures: 0,
    repairHours: 0,
    downtime: 0,
    testCycles: 0,
    notes: ''
  };
}

function loadData() {
  const saved = localStorage.getItem(APP_KEY);
  if (!saved) return structuredClone(seed);
  try {
    const parsed = JSON.parse(saved);
    const savedMaintenance = parsed.maintenance || [];
    const customNames = savedMaintenance
      .map(item => item?.name)
      .filter(name => name && !apparatusNames.includes(name));
    const fleetNames = Array.isArray(parsed.apparatusList)
      ? parsed.apparatusList
      : [...apparatusNames, ...customNames];
    return {
      ...structuredClone(seed),
      ...parsed,
      personnel: mergePersonnel(parsed.personnel),
      apparatusList: [...new Set(fleetNames)],
      maintenance: mergeMaintenance(savedMaintenance, [...new Set(fleetNames)])
    };
  } catch {
    return structuredClone(seed);
  }
}

function mergePersonnel(saved = seed.personnel) {
  const personnel = saved.length ? saved : seed.personnel;
  return personnel.map((member, index) => {
    const merged = {
    name: '',
    rank: '',
    employeeId: '',
    station: 'Station 1',
    shift: 'A Shift',
    phone: '',
    email: '',
    password: '',
    status: 'Active',
    adminAccess: index === 0 ? 'Yes' : 'No',
    certifications: '',
    ...member,
    adminAccess: member.adminAccess || (index === 0 ? 'Yes' : 'No')
    };
    if (!merged.email && index === 0) merged.email = 'admin@hornlakefire.com';
    if (!merged.password) merged.password = merged.employeeId || '100';
    return merged;
  });
}

function mergeMaintenance(saved = [], fleetNames = apparatusNames) {
  return fleetNames.map(name => {
    const found = saved.find(item => item.name === name) || {};
    const seeded = seed.maintenance.find(item => item.name === name) || blankApparatus(name);
    return { ...seeded, ...found };
  });
}

function getApparatusNames() {
  return data.maintenance.map(item => item.name);
}

function saveData() {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

function currentUser() {
  return data.personnel.find(member => String(member.email || '').toLowerCase() === String(currentUserId || '').toLowerCase()) || null;
}

function isAdminUser() {
  return currentUser()?.adminAccess === 'Yes';
}

function visibleSections() {
  return sections.filter(section => section.id !== 'admin' || isAdminUser());
}

function refreshSigninOptions() {
  signinEmail.value = signinEmail.value || '';
}

function showSignin(message = '') {
  refreshSigninOptions();
  signinMessage.textContent = message;
  signinScreen.classList.remove('hidden');
}

function finishSignin(email) {
  currentUserId = email;
  localStorage.setItem(SESSION_KEY, currentUserId);
  signinScreen.classList.add('hidden');
  if (activeSection === 'admin' && !isAdminUser()) activeSection = 'dashboard';
  render();
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString([], { style: 'currency', currency: 'USD' });
}

function calc95(item) {
  const runHours = apparatusRunHours(item);
  const totalOperatingHours = Number(item.operatingHours || 0) + runHours;
  const mtbf = item.failures > 0 ? totalOperatingHours / Number(item.failures || 1) : totalOperatingHours;
  const mttr = item.failures > 0 ? Number(item.repairHours || 0) / Number(item.failures || 1) : 0;
  const availability = (totalOperatingHours + Number(item.downtime || 0)) > 0
    ? (totalOperatingHours / (totalOperatingHours + Number(item.downtime || 0))) * 100
    : 0;
  const required = Math.ceil(Math.log(1 - .95) / Math.log(.95));
  const passes = Number(item.testCycles || 0) >= required && Number(item.failures || 0) === 0 && availability >= 95;
  return { mtbf, mttr, availability, required, passes, runHours, totalOperatingHours };
}

function apparatusRunHours(item) {
  return (item.runLogs || []).reduce((sum, log) => sum + (Number(log.callMinutes || 0) / 60), 0);
}

function apparatusRunMinutes(item) {
  return (item.runLogs || []).reduce((sum, log) => sum + Number(log.callMinutes || 0), 0);
}

function serviceCost(item) {
  return (item.serviceLogs || []).reduce((sum, log) => sum + Number(log.cost || 0), 0);
}

function fuelCost(item) {
  return (item.fuelLogs || []).reduce((sum, log) => sum + Number(log.cost || 0), 0);
}

function renderNav() {
  nav.innerHTML = visibleSections().map(section => `
    <button class="nav-button ${section.id === activeSection ? 'active' : ''}" data-section="${section.id}" type="button">
      <span class="nav-icon">${section.icon}</span>
      <span>${section.title}</span>
    </button>
  `).join('');
}

function setSection(id) {
  if (id === 'admin' && !isAdminUser()) id = 'dashboard';
  activeSection = id;
  title.textContent = sections.find(section => section.id === id)?.title || 'RMS';
  searchInput.value = '';
  const url = new URL(window.location.href);
  if (id === 'dashboard') url.searchParams.delete('section');
  else url.searchParams.set('section', id);
  window.history.replaceState({}, '', url);
  render();
}

function initialSection() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('section');
  return sections.some(section => section.id === requested) ? requested : 'dashboard';
}

function renderStats(cards) {
  statsGrid.innerHTML = cards.map(card => `
    <article class="stat-card"><span>${esc(card.label)}</span><strong>${esc(card.value)}</strong></article>
  `).join('');
}

function render() {
  if (!currentUser()) {
    showSignin();
    return;
  }
  signinScreen.classList.add('hidden');
  if (activeSection === 'admin' && !isAdminUser()) activeSection = 'dashboard';
  title.textContent = sections.find(section => section.id === activeSection)?.title || 'RMS';
  currentUserBadge.textContent = `${currentUser().name || currentUser().employeeId}${isAdminUser() ? ' | Admin' : ''}`;
  renderNav();
  addRecordBtn.style.display = activeSection === 'dashboard' || activeSection === 'maintenance' || activeSection === 'admin' || activeSection === 'personnel' ? 'none' : '';
  if (activeSection === 'dashboard') return renderDashboard();
  if (activeSection === 'personnel') return renderPersonnel();
  if (activeSection === 'hydrants') return renderHydrants();
  if (activeSection === 'maintenance') return renderMaintenance();
  if (activeSection === 'admin') return renderAdmin();
  renderRecords(activeSection);
}

function renderDashboard() {
  const openIncidents = data.incidents.filter(item => item.status !== 'Complete').length;
  const maintenanceSpend = data.maintenance.reduce((sum, item) => sum + serviceCost(item) + fuelCost(item), 0);
  renderStats([
    { label: 'Open Incidents', value: openIncidents },
    { label: 'Apparatus', value: data.maintenance.length },
    { label: 'Personnel', value: data.personnel.length },
    { label: 'Fleet Expense', value: money(maintenanceSpend) }
  ]);

  const latestLogs = data.maintenance.flatMap(item => (item.serviceLogs || []).map(log => ({ ...log, apparatus: item.name })))
    .sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);

  workspace.innerHTML = `
    <div class="dashboard-grid">
      <section class="panel">
        <h2>Department Work Queue</h2>
        <div class="queue-list">
          ${queueItem('Incidents needing review', `${openIncidents} open`)}
          ${queueItem('NFIRS drafts', `${data.nfirs.filter(item => item.reviewStatus !== 'Submitted').length} records`)}
          ${queueItem('Fire inspections', `${data.inspections.filter(item => item.status !== 'Passed').length} pending`)}
          ${queueItem('Maintenance logs', `${latestLogs.length} recent entries`)}
          ${queueItem('Inventory below minimum', `${lowInventory().length} items`)}
        </div>
      </section>
      <section class="panel">
        <h2>Recent Maintenance</h2>
        <div class="queue-list">
          ${latestLogs.length ? latestLogs.map(log => queueItem(`${log.apparatus} - ${log.items?.join(', ') || 'Service'}`, `${log.date || 'No date'} by ${log.by || 'Not listed'}`)).join('') : '<p class="muted">No service logs yet.</p>'}
        </div>
      </section>
      <section class="panel wide-card">
        <h2>Apparatus Use Metrics</h2>
        <p class="muted">Log total call time by apparatus and feed those run hours into Maintenance 95/95 reports.</p>
        ${isAdminUser() ? '<button class="primary" data-jump-section="admin" type="button">Open Admin Use Metrics</button>' : '<span class="pill amber">Admin access required</span>'}
      </section>
    </div>
  `;
}

function queueItem(name, detail) {
  return `<div class="queue-item"><div><strong>${esc(name)}</strong><br><small>${esc(detail)}</small></div><span class="pill blue">Open</span></div>`;
}

function lowInventory() {
  return data.inventory.filter(item => Number(item.quantity || 0) <= Number(item.minimum || 0));
}

function renderHydrants() {
  renderStats([
    { label: 'Hydrant Dashboard', value: 'Live' },
    { label: 'Status Feed', value: 'OOS' },
    { label: 'Map', value: 'Enabled' },
    { label: 'Source', value: 'Built Page' }
  ]);

  workspace.innerHTML = `
    <section class="panel hydrant-rms-panel">
      <div class="panel-headline">
        <div>
          <h2>Out of Service Hydrants</h2>
          <p class="muted">Live hydrant dashboard pulled into the RMS.</p>
        </div>
        <a class="primary link-button" href="/hydrants/" target="_blank" rel="noopener">Open Full Page</a>
      </div>
      <iframe class="hydrant-frame" src="/hydrants/" title="Out of Service Hydrants"></iframe>
    </section>
  `;
}

function renderPersonnel() {
  const roster = filterRecords(data.personnel);
  renderStats([
    { label: 'Personnel', value: roster.length },
    { label: 'Active', value: roster.filter(member => member.status === 'Active').length },
    { label: 'Admin Assigned', value: data.personnel.filter(member => member.adminAccess === 'Yes').length },
    { label: 'View Only', value: 'Yes' }
  ]);

  workspace.innerHTML = `
    <section class="record-grid">
      ${roster.map(member => `
        <article class="record-card">
          <header>
            <div><strong>${esc(member.name || 'Personnel')}</strong><small>${esc(member.rank || '')}</small></div>
            <span class="pill ${member.status === 'Active' ? 'green' : 'amber'}">${esc(member.status || 'Active')}</span>
          </header>
          <div class="info-list">
            <div class="info-line"><span>Employee ID</span><b>${esc(member.employeeId || '--')}</b></div>
            <div class="info-line"><span>Station</span><b>${esc(member.station || '--')}</b></div>
            <div class="info-line"><span>Shift</span><b>${esc(member.shift || '--')}</b></div>
            <div class="info-line"><span>Admin</span><b>${member.adminAccess === 'Yes' ? 'Yes' : 'No'}</b></div>
          </div>
          <p class="muted">${esc(member.certifications || 'No certifications entered.')}</p>
        </article>
      `).join('') || emptyPanel('personnel')}
    </section>
  `;
}

function renderRecords(sectionId) {
  const records = filterRecords(data[sectionId] || []);
  renderStats([
    { label: 'Records', value: records.length },
    { label: 'Open', value: records.filter(item => !['Complete', 'Submitted', 'Passed', 'Current', 'Archived'].includes(item.status || item.reviewStatus)).length },
    { label: 'This Section', value: sections.find(section => section.id === sectionId).title },
    { label: 'Saved In Browser', value: 'Yes' }
  ]);

  workspace.innerHTML = `
    <section class="record-grid">
      ${records.map((record, index) => recordCard(sectionId, record, index)).join('') || emptyPanel(sectionId)}
    </section>
  `;
}

function filterRecords(records) {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return records;
  return records.filter(record => Object.values(record).join(' ').toLowerCase().includes(q));
}

function recordCard(sectionId, record, index) {
  const primary = record.incidentNumber || record.name || record.course || record.occupancy || record.business || record.hydrantId || record.item || record.setting || record.address || 'Record';
  const secondary = record.date || record.inspectionDate || record.lastReviewed || record.lastService || record.station || record.category || '';
  const status = record.status || record.reviewStatus || record.condition || 'Draft';
  const statusClass = /complete|submitted|passed|current|good|active/i.test(status) ? 'green' : /needed|out|draft|review/i.test(status) ? 'amber' : 'blue';
  return `
    <article class="record-card">
      <header>
        <div><strong>${esc(primary)}</strong><small>${esc(secondary)}</small></div>
        <span class="pill ${statusClass}">${esc(status)}</span>
      </header>
      <p class="muted">${esc(record.address || record.notes || record.certifications || record.violations || 'No additional notes entered.')}</p>
      <div class="pill-row">
        ${Object.entries(record).slice(0, 4).map(([key, value]) => value ? `<span class="pill">${esc(key)}: ${esc(value)}</span>` : '').join('')}
      </div>
      <button class="small-button" type="button" data-edit-section="${sectionId}" data-edit-index="${index}">Edit</button>
    </article>
  `;
}

function emptyPanel(sectionId) {
  return `<article class="panel wide-card"><h2>No Records Yet</h2><p class="muted">${esc(sections.find(section => section.id === sectionId).title)} records will appear here when they are added.</p></article>`;
}

function renderMaintenance() {
  const fleet = filterRecords(data.maintenance);
  const expenses = data.maintenance.reduce((sum, item) => sum + serviceCost(item) + fuelCost(item), 0);
  const passing = data.maintenance.filter(item => calc95(item).passes).length;
  renderStats([
    { label: 'Apparatus', value: data.maintenance.length },
    { label: '95/95 Passing', value: passing },
    { label: 'Service Expense', value: money(data.maintenance.reduce((sum, item) => sum + serviceCost(item), 0)) },
    { label: 'Fuel Expense', value: money(expenses - data.maintenance.reduce((sum, item) => sum + serviceCost(item), 0)) }
  ]);

  workspace.innerHTML = `
    <section class="panel">
      <div class="tabs">
        ${['fleet', 'service', 'fuel', 'parts'].map(mode => `<button class="tab-button ${maintenanceMode === mode ? 'active' : ''}" data-maint-mode="${mode}" type="button">${modeTitle(mode)}</button>`).join('')}
      </div>
    </section>
    <section class="maintenance-grid">
      ${fleet.map((item, index) => apparatusCard(item, index)).join('')}
    </section>
  `;
}

function renderAdmin() {
  const totalRuns = data.maintenance.reduce((sum, item) => sum + (item.runLogs || []).length, 0);
  const totalMinutes = data.maintenance.reduce((sum, item) => sum + apparatusRunMinutes(item), 0);
  const busiest = [...data.maintenance].sort((a, b) => apparatusRunMinutes(b) - apparatusRunMinutes(a))[0];
  renderStats([
    { label: 'Run Logs', value: totalRuns },
    { label: 'Call Time', value: `${(totalMinutes / 60).toFixed(1)} hrs` },
    { label: 'Busiest Apparatus', value: busiest?.name || '--' },
    { label: 'Feeds 95/95', value: 'Yes' }
  ]);

  const recentRuns = data.maintenance
    .flatMap(item => (item.runLogs || []).map(log => ({ ...log, apparatus: item.name })))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 12);

  workspace.innerHTML = `
    <div class="dashboard-grid">
      <section class="panel">
        <h2>Personnel Management</h2>
        <form id="personnelAdminForm" class="run-log-form">
          ${fieldHtml('personnelName', 'Name')}
          ${fieldHtml('personnelRank', 'Rank')}
          ${fieldHtml('personnelEmployeeId', 'Employee ID')}
          ${fieldHtml('personnelEmail', 'Email', 'email')}
          ${fieldHtml('personnelPassword', 'Password')}
          ${fieldHtml('personnelStation', 'Station', 'select', ['Station 1', 'Station 2', 'Station 3'])}
          ${fieldHtml('personnelShift', 'Shift', 'select', ['A Shift', 'B Shift', 'C Shift', 'Day Staff'])}
          ${fieldHtml('personnelStatus', 'Status', 'select', ['Active', 'Reserve', 'Leave', 'Inactive'])}
          ${fieldHtml('personnelAdminAccess', 'Admin Access', 'select', ['No', 'Yes'])}
          ${fieldHtml('personnelCertifications', 'Certifications', 'textarea')}
          <input type="hidden" id="personnelEditIndex" name="personnelEditIndex" value="" />
          <div class="form-field full">
            <button class="primary" type="submit">Save Personnel</button>
          </div>
        </form>
      </section>
      <section class="panel">
        <h2>Editable Personnel</h2>
        <div class="queue-list">
          ${data.personnel.map((member, index) => `<div class="queue-item"><div><strong>${esc(member.name || member.employeeId)}</strong><br><small>${esc(member.email || 'No email')} | ${esc(member.rank || '')} | Admin: ${member.adminAccess === 'Yes' ? 'Yes' : 'No'}</small></div><button class="small-button" data-edit-personnel="${index}" type="button">Edit</button></div>`).join('')}
        </div>
      </section>
      <section class="panel">
        <h2>Apparatus Setup</h2>
        <form id="apparatusSetupForm" class="run-log-form">
          ${fieldHtml('newApparatusName', 'Apparatus Name')}
          ${fieldHtml('newApparatusType', 'Apparatus Type', 'select', ['Pumper', 'Ladder Truck', 'Brush Truck', 'Ambulance', 'Fleet', 'Support Vehicle'])}
          ${fieldHtml('newApparatusStatus', 'Status', 'select', ['Needs Data', 'In Service', 'Reserve', 'In Shop', 'Out of Service', 'Needs Inspection'])}
          ${fieldHtml('newApparatusLocation', 'Location', 'select', ['Station 1', 'Station 2', 'Station 3'])}
          <div class="form-field full">
            <button class="primary" type="submit">Add Apparatus</button>
          </div>
        </form>
      </section>
      <section class="panel">
        <h2>Current Apparatus</h2>
        <div class="queue-list">
          ${data.maintenance.map((item, index) => `<div class="queue-item"><div><strong>${esc(item.name)}</strong><br><small>${esc(item.type)} | ${esc(item.location)} | ${esc(item.status)}</small></div><button class="danger-button" data-remove-apparatus="${index}" type="button">Remove</button></div>`).join('')}
        </div>
      </section>
      <section class="panel">
        <h2>Apparatus Use Metrics</h2>
        <form id="runLogForm" class="run-log-form">
          ${fieldHtml('runApparatus', 'Apparatus', 'select', getApparatusNames())}
          ${fieldHtml('runIncident', 'Incident Number')}
          ${fieldHtml('runDate', 'Run Date', 'date', [], new Date().toISOString().slice(0, 10))}
          ${fieldHtml('runType', 'Call Type')}
          ${fieldHtml('runMinutes', 'Total Call Time Minutes', 'number')}
          ${fieldHtml('runMiles', 'Run Miles', 'number')}
          ${fieldHtml('runStation', 'Station', 'select', ['Station 1', 'Station 2', 'Station 3'])}
          ${fieldHtml('runNotes', 'Run Notes', 'textarea')}
          <div class="form-field full">
            <button class="primary" type="submit">Log Apparatus Run</button>
          </div>
        </form>
      </section>
      <section class="panel">
        <h2>95/95 Import Summary</h2>
        <div class="queue-list">
          ${data.maintenance.map(item => {
            const metric = calc95(item);
            return `<div class="queue-item"><div><strong>${esc(item.name)}</strong><br><small>${(metric.runHours || 0).toFixed(2)} imported run hours | ${(metric.totalOperatingHours || 0).toFixed(2)} total operating hours</small></div><span class="pill ${metric.passes ? 'green' : 'amber'}">${metric.availability.toFixed(1)}%</span></div>`;
          }).join('')}
        </div>
      </section>
    </div>
    <section class="panel">
      <h2>Recent Apparatus Runs</h2>
      <div class="queue-list">
        ${recentRuns.length ? recentRuns.map(log => `<div class="queue-item"><div><strong>${esc(log.apparatus)} - ${esc(log.incident || 'Run')}</strong><br><small>${esc(log.date || 'No date')} | ${esc(log.callType || 'Call')} | ${esc(log.callMinutes || 0)} minutes | ${esc(log.station || '')}</small></div><span class="pill blue">${esc(log.miles || 0)} mi</span></div>`).join('') : '<p class="muted">No apparatus run metrics logged yet.</p>'}
      </div>
    </section>
  `;
}

function modeTitle(mode) {
  return ({ fleet: 'Fleet', service: 'Maintenance Logs', fuel: 'Fuel Logs', parts: 'Parts' })[mode];
}

function apparatusCard(item, index) {
  const metric = calc95(item);
  const lastService = (item.serviceLogs || []).slice(-1)[0];
  const lastFuel = (item.fuelLogs || []).slice(-1)[0];
  let detail = `${item.make || 'Make not set'} ${item.model || ''}`.trim();
  if (maintenanceMode === 'service') detail = `${(item.serviceLogs || []).length} service logs, ${money(serviceCost(item))}`;
  if (maintenanceMode === 'fuel') detail = `${(item.fuelLogs || []).length} fuel entries, ${money(fuelCost(item))}`;
  if (maintenanceMode === 'parts') detail = `${(item.parts || []).length} normal maintenance parts`;
  return `
    <article class="apparatus-card" data-apparatus-index="${index}">
      <header>
        <div><strong>${esc(item.name)}</strong><small>${esc(detail || item.type)}</small></div>
        <span class="pill ${item.status === 'In Service' ? 'green' : item.status === 'Reserve' ? 'blue' : 'amber'}">${esc(item.status)}</span>
      </header>
      <div class="pill-row">
        <span class="pill">${esc(item.type)}</span>
        <span class="pill">${esc(item.location)}</span>
        ${item.vin ? `<span class="pill">VIN: ${esc(item.vin)}</span>` : ''}
      </div>
      <div class="metric-box">
        <span>95/95 Apparatus Report</span>
        <b>${metric.passes ? 'Meets' : 'Tracking'}</b>
        <small>${metric.availability.toFixed(1)}% availability | ${item.testCycles || 0}/${metric.required} cycles</small>
        <small>${metric.runHours.toFixed(2)} run hours imported from Admin</small>
      </div>
      <small>${esc(lastService ? `Last service ${lastService.date || ''} by ${lastService.by || 'not listed'}` : lastFuel ? `Last fuel ${lastFuel.date || ''}` : 'Click to update this apparatus.')}</small>
    </article>
  `;
}

function openGenericModal(sectionId, index = null) {
  editing = { sectionId, index };
  const schema = schemas[sectionId];
  const record = index === null ? {} : data[sectionId][index];
  modalSection.textContent = sections.find(section => section.id === sectionId).title;
  modalTitle.textContent = index === null ? 'Add Record' : 'Edit Record';
  modalFields.innerHTML = schema.map(([key, label, type = 'text', options = []]) => fieldHtml(key, label, type, options, record[key])).join('');
  modal.showModal();
}

function openMaintenanceModal(index) {
  const item = data.maintenance[index];
  editing = { sectionId: 'maintenance', index };
  modalSection.textContent = 'Maintenance';
  modalTitle.textContent = `${item.name}`;
  modalFields.innerHTML = maintenanceFields(item);
  modal.showModal();
}

function fieldHtml(key, label, type = 'text', options = [], value = '') {
  if (type === 'textarea') {
    return `<div class="form-field full"><label for="${key}">${label}</label><textarea id="${key}" name="${key}">${esc(value)}</textarea></div>`;
  }
  if (type === 'select') {
    return `<div class="form-field"><label for="${key}">${label}</label><select id="${key}" name="${key}">${options.map(option => `<option ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></div>`;
  }
  return `<div class="form-field"><label for="${key}">${label}</label><input id="${key}" name="${key}" type="${type}" value="${esc(value)}" /></div>`;
}

function maintenanceFields(item) {
  if (maintenanceMode === 'service') return serviceFields(item);
  if (maintenanceMode === 'fuel') return fuelFields(item);
  if (maintenanceMode === 'parts') return partsFields(item);
  return `
    ${fieldHtml('name', 'Apparatus', 'text', [], item.name)}
    ${fieldHtml('type', 'Apparatus Type', 'select', ['Pumper', 'Ladder Truck', 'Brush Truck', 'Ambulance', 'Fleet', 'Support Vehicle'], item.type)}
    ${fieldHtml('status', 'Status', 'select', ['Needs Data', 'In Service', 'Reserve', 'In Shop', 'Out of Service', 'Needs Inspection'], item.status)}
    ${fieldHtml('location', 'Location', 'select', ['Station 1', 'Station 2', 'Station 3'], item.location)}
    ${fieldHtml('make', 'Make', 'text', [], item.make)}
    ${fieldHtml('model', 'Model', 'text', [], item.model)}
    ${fieldHtml('year', 'Year', 'number', [], item.year)}
    ${fieldHtml('vin', 'VIN', 'text', [], item.vin)}
    ${fieldHtml('mileage', 'Mileage', 'number', [], item.mileage)}
    ${fieldHtml('engineHours', 'Engine Hours', 'number', [], item.engineHours)}
    ${fieldHtml('operatingHours', 'Operating Hours', 'number', [], item.operatingHours)}
    <div class="form-field"><label>Imported Run Hours</label><input type="text" value="${apparatusRunHours(item).toFixed(2)}" disabled /></div>
    ${fieldHtml('failures', 'Failures', 'number', [], item.failures)}
    ${fieldHtml('repairHours', 'Repair Hours', 'number', [], item.repairHours)}
    ${fieldHtml('downtime', 'Downtime Hours', 'number', [], item.downtime)}
    ${fieldHtml('testCycles', 'Successful Test Cycles', 'number', [], item.testCycles)}
    <div class="form-field full"><label>Standard Service Items</label><div class="check-grid">${serviceItems.map(service => `<label><input type="checkbox" name="selectedServiceItems" value="${esc(service)}" ${item.selectedServiceItems?.includes(service) ? 'checked' : ''}>${esc(service)}</label>`).join('')}</div></div>
    ${fieldHtml('notes', 'Notes', 'textarea', [], item.notes)}
  `;
}

function serviceFields(item) {
  const history = (item.serviceLogs || []).slice().reverse().map(log => `<div class="queue-item"><div><strong>${esc(log.date || 'No date')} - ${esc(log.items?.join(', ') || 'Service')}</strong><br><small>${esc(log.by || 'Not listed')} | ${money(log.cost)} | Invoice: ${esc(log.invoice || 'None')}</small></div></div>`).join('');
  return `
    ${fieldHtml('serviceDate', 'Service Date', 'date', [], new Date().toISOString().slice(0, 10))}
    ${fieldHtml('serviceBy', 'Completed By')}
    ${fieldHtml('serviceCost', 'Cost', 'number')}
    ${fieldHtml('serviceInvoice', 'Invoice File Name')}
    <div class="form-field full"><label>Service Items</label><div class="check-grid">${serviceItems.map(service => `<label><input type="checkbox" name="serviceItems" value="${esc(service)}">${esc(service)}</label>`).join('')}</div></div>
    ${fieldHtml('serviceNotes', 'Service Notes', 'textarea')}
    <div class="form-field full"><label>Summary Log</label><div class="queue-list">${history || '<p class="muted">No service logs yet.</p>'}</div></div>
  `;
}

function fuelFields(item) {
  const history = (item.fuelLogs || []).slice().reverse().map(log => `<div class="queue-item"><div><strong>${esc(log.date || 'No date')} - ${esc(log.gallons || 0)} gallons</strong><br><small>${money(log.cost)} | ${esc(log.vendor || 'No vendor')} | ${esc(log.by || 'Not listed')}</small></div></div>`).join('');
  return `
    ${fieldHtml('fuelDate', 'Fuel Date', 'date', [], new Date().toISOString().slice(0, 10))}
    ${fieldHtml('fuelGallons', 'Gallons', 'number')}
    ${fieldHtml('fuelCost', 'Cost', 'number')}
    ${fieldHtml('fuelOdometer', 'Odometer', 'number')}
    ${fieldHtml('fuelVendor', 'Vendor')}
    ${fieldHtml('fuelBy', 'Entered By')}
    <div class="form-field full"><label>Fuel History</label><div class="queue-list">${history || '<p class="muted">No fuel logs yet.</p>'}</div></div>
  `;
}

function partsFields(item) {
  const rows = (item.parts || []).map((part, index) => `
    <div class="queue-item">
      <input name="partName${index}" value="${esc(part.part)}" />
      <input name="partNumber${index}" value="${esc(part.number)}" />
    </div>
  `).join('');
  return `
    <div class="form-field full"><label>Normally Purchased Maintenance Parts</label><div class="queue-list" id="partsRows">${rows}</div></div>
    ${fieldHtml('newPartName', 'Add Part Name')}
    ${fieldHtml('newPartNumber', 'Add Part Number')}
  `;
}

function saveGenericRecord(formData) {
  const { sectionId, index } = editing;
  const schema = schemas[sectionId];
  const record = {};
  schema.forEach(([key]) => record[key] = formData.get(key) || '');
  if (index === null) data[sectionId].push(record);
  else data[sectionId][index] = record;
}

function saveMaintenanceRecord(formData) {
  const item = data.maintenance[editing.index];
  if (maintenanceMode === 'service') {
    item.serviceLogs = item.serviceLogs || [];
    item.serviceLogs.push({
      date: formData.get('serviceDate'),
      by: formData.get('serviceBy'),
      cost: formData.get('serviceCost'),
      invoice: formData.get('serviceInvoice'),
      items: formData.getAll('serviceItems'),
      notes: formData.get('serviceNotes')
    });
    item.testCycles = Number(item.testCycles || 0) + 1;
    return;
  }
  if (maintenanceMode === 'fuel') {
    item.fuelLogs = item.fuelLogs || [];
    item.fuelLogs.push({
      date: formData.get('fuelDate'),
      gallons: formData.get('fuelGallons'),
      cost: formData.get('fuelCost'),
      odometer: formData.get('fuelOdometer'),
      vendor: formData.get('fuelVendor'),
      by: formData.get('fuelBy')
    });
    return;
  }
  if (maintenanceMode === 'parts') {
    const parts = [];
    (item.parts || []).forEach((part, index) => {
      const name = formData.get(`partName${index}`);
      const number = formData.get(`partNumber${index}`);
      if (name || number) parts.push({ part: name, number });
    });
    if (formData.get('newPartName') || formData.get('newPartNumber')) {
      parts.push({ part: formData.get('newPartName'), number: formData.get('newPartNumber') });
    }
    item.parts = parts;
    return;
  }
  ['name', 'type', 'status', 'location', 'make', 'model', 'year', 'vin', 'mileage', 'engineHours', 'operatingHours', 'failures', 'repairHours', 'downtime', 'testCycles', 'notes'].forEach(key => {
    item[key] = formData.get(key) || '';
  });
  item.selectedServiceItems = formData.getAll('selectedServiceItems');
}

nav.addEventListener('click', event => {
  const button = event.target.closest('[data-section]');
  if (button) setSection(button.dataset.section);
});

workspace.addEventListener('click', event => {
  const jumpButton = event.target.closest('[data-jump-section]');
  if (jumpButton) return setSection(jumpButton.dataset.jumpSection);
  const personnelButton = event.target.closest('[data-edit-personnel]');
  if (personnelButton) {
    const member = data.personnel[Number(personnelButton.dataset.editPersonnel)];
    if (!member) return;
    document.getElementById('personnelName').value = member.name || '';
    document.getElementById('personnelRank').value = member.rank || '';
    document.getElementById('personnelEmployeeId').value = member.employeeId || '';
    document.getElementById('personnelEmail').value = member.email || '';
    document.getElementById('personnelPassword').value = member.password || '';
    document.getElementById('personnelStation').value = member.station || 'Station 1';
    document.getElementById('personnelShift').value = member.shift || 'A Shift';
    document.getElementById('personnelStatus').value = member.status || 'Active';
    document.getElementById('personnelAdminAccess').value = member.adminAccess || 'No';
    document.getElementById('personnelCertifications').value = member.certifications || '';
    document.getElementById('personnelEditIndex').value = personnelButton.dataset.editPersonnel;
    return;
  }
  const removeButton = event.target.closest('[data-remove-apparatus]');
  if (removeButton) {
    const index = Number(removeButton.dataset.removeApparatus);
    const item = data.maintenance[index];
    if (!item) return;
    const ok = window.confirm(`Remove ${item.name} from the RMS apparatus list?`);
    if (!ok) return;
    data.maintenance.splice(index, 1);
    data.apparatusList = data.maintenance.map(apparatus => apparatus.name);
    saveData();
    renderAdmin();
    return;
  }
  const editButton = event.target.closest('[data-edit-section]');
  if (editButton) return openGenericModal(editButton.dataset.editSection, Number(editButton.dataset.editIndex));
  const modeButton = event.target.closest('[data-maint-mode]');
  if (modeButton) {
    maintenanceMode = modeButton.dataset.maintMode;
    renderMaintenance();
    return;
  }
  const apparatus = event.target.closest('[data-apparatus-index]');
  if (apparatus) openMaintenanceModal(Number(apparatus.dataset.apparatusIndex));
});

workspace.addEventListener('submit', event => {
  if (event.target.id === 'personnelAdminForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const employeeId = String(formData.get('personnelEmployeeId') || '').trim();
    const email = String(formData.get('personnelEmail') || '').trim().toLowerCase();
    const password = String(formData.get('personnelPassword') || '').trim();
    if (!employeeId || !email || !password) return;
    const indexValue = formData.get('personnelEditIndex');
    const existingIndex = data.personnel.findIndex((member, index) => member.employeeId === employeeId && String(index) !== String(indexValue));
    if (existingIndex >= 0) {
      window.alert(`${employeeId} is already assigned to another personnel record.`);
      return;
    }
    const existingEmailIndex = data.personnel.findIndex((member, index) => String(member.email || '').toLowerCase() === email && String(index) !== String(indexValue));
    if (existingEmailIndex >= 0) {
      window.alert(`${email} is already assigned to another personnel record.`);
      return;
    }
    const priorEmail = indexValue === '' ? '' : data.personnel[Number(indexValue)]?.email || '';
    const record = {
      name: formData.get('personnelName'),
      rank: formData.get('personnelRank'),
      employeeId,
      email,
      password,
      station: formData.get('personnelStation'),
      shift: formData.get('personnelShift'),
      phone: '',
      status: formData.get('personnelStatus'),
      adminAccess: formData.get('personnelAdminAccess'),
      certifications: formData.get('personnelCertifications')
    };
    if (indexValue === '') data.personnel.push(record);
    else data.personnel[Number(indexValue)] = { ...data.personnel[Number(indexValue)], ...record };
    saveData();
    refreshSigninOptions();
    if (priorEmail && String(currentUserId).toLowerCase() === String(priorEmail).toLowerCase()) {
      currentUserId = email;
      localStorage.setItem(SESSION_KEY, currentUserId);
    }
    if (String(currentUserId).toLowerCase() === email && record.adminAccess !== 'Yes') activeSection = 'dashboard';
    renderAdmin();
    return;
  }
  if (event.target.id === 'apparatusSetupForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = String(formData.get('newApparatusName') || '').trim();
    if (!name) return;
    const exists = data.maintenance.some(item => item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      window.alert(`${name} is already in the apparatus list.`);
      return;
    }
    data.maintenance.push(blankApparatus(name, {
      type: formData.get('newApparatusType'),
      status: formData.get('newApparatusStatus'),
      location: formData.get('newApparatusLocation')
    }));
    data.apparatusList = data.maintenance.map(apparatus => apparatus.name);
    saveData();
    renderAdmin();
    return;
  }
  if (event.target.id !== 'runLogForm') return;
  event.preventDefault();
  const formData = new FormData(event.target);
  const apparatus = data.maintenance.find(item => item.name === formData.get('runApparatus'));
  if (!apparatus) return;
  apparatus.runLogs = apparatus.runLogs || [];
  apparatus.runLogs.push({
    incident: formData.get('runIncident'),
    date: formData.get('runDate'),
    callType: formData.get('runType'),
    callMinutes: formData.get('runMinutes'),
    miles: formData.get('runMiles'),
    station: formData.get('runStation'),
    notes: formData.get('runNotes')
  });
  saveData();
  renderAdmin();
});

addRecordBtn.addEventListener('click', () => openGenericModal(activeSection));
searchInput.addEventListener('input', render);
signOutBtn.addEventListener('click', () => {
  localStorage.removeItem(SESSION_KEY);
  currentUserId = '';
  activeSection = 'dashboard';
  showSignin();
});

signinForm.addEventListener('submit', event => {
  event.preventDefault();
  const email = signinEmail.value.trim().toLowerCase();
  const password = signinPassword.value.trim();
  const member = data.personnel.find(person => String(person.email || '').toLowerCase() === email && person.status !== 'Inactive');
  if (!member || String(member.password || '') !== password) {
    showSignin('Email or password is incorrect.');
    return;
  }
  signinPassword.value = '';
  finishSignin(email);
});

form.addEventListener('submit', event => {
  if (event.submitter?.value !== 'save') return;
  event.preventDefault();
  const formData = new FormData(form);
  if (editing.sectionId === 'maintenance') saveMaintenanceRecord(formData);
  else saveGenericRecord(formData);
  saveData();
  modal.close();
  render();
});

render();
