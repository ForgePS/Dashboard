const APP_KEY = 'hlfdRmsData';
const SESSION_KEY = 'hlfdRmsSession';
const RMS_CONFIG_API = '/api/rms-config';
const RMS_DATA_API = '/api/rms-data';
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;
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

const defaultSections = structuredClone(sections);

const pagePermissionOptions = defaultSections.map(section => ({ id: section.id, title: section.title }));
const pageSettingOptions = [
  ['view', 'View Page'],
  ['create', 'Create Records'],
  ['edit', 'Edit Records'],
  ['delete', 'Delete Records'],
  ['reports', 'Reports / Export'],
  ['settings', 'Page Settings']
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

const personnelQualifiers = [
  'Administration', 'Deputy Chief', 'EMS Chief', 'Firefighter', 'Fire Officer',
  'Driver Operator', 'Apparatus Operator', 'Paramedic', 'EMT', 'Inspector', 'Training Instructor'
];

const personnelFileFields = [
  ['firstName', 'First Name', 'text'], ['middleName', 'Middle Name', 'text'], ['lastName', 'Last Name', 'text'],
  ['email', 'Email', 'email'], ['emsProviderLevel', 'EMS Provider Level', 'select', ['None', 'Emergency Medical Responder', 'EMT', 'Advanced EMT', 'Paramedic', 'Critical Care Paramedic']],
  ['address', 'Address', 'text'], ['unitSuite', 'Unit/Suite', 'text'], ['state', 'State', 'select', ['Mississippi', 'Tennessee', 'Arkansas', 'Alabama', 'Virginia']],
  ['city', 'City', 'text'], ['zipCode', 'Zip Code', 'text'], ['phone', 'Phone', 'tel'], ['iaffLocalNumber', 'IAFF Local Number', 'text'],
  ['birthDate', 'Birth Date', 'date'], ['citizenship', 'Citizenship', 'select', ['United States', 'Permanent Resident', 'Other']],
  ['driversLicenseNumber', "Driver's Lic. Number", 'text'], ['driversLicenseState', "Driver's Lic. State", 'select', ['Mississippi', 'Tennessee', 'Arkansas', 'Alabama', 'Virginia']],
  ['driversLicenseClass', "Driver's Lic. Class", 'select', ['A', 'B', 'C', 'D', 'E', 'F']], ['driversLicenseExpiration', "Driver's Lic. Expiration Date", 'date'],
  ['startDate', 'Start Date', 'date'], ['secondaryStartDate', 'Secondary Start Date', 'date'], ['startDateRanking', 'Start Date Ranking', 'date'], ['endOfServiceDate', 'End of Service Date', 'date'],
  ['race', 'Race', 'select', ['--', 'American Indian or Alaska Native', 'Asian', 'Black or African American', 'Native Hawaiian or Other Pacific Islander', 'White', 'Other race']],
  ['ethnicity', 'Ethnicity', 'select', ['--', 'Hispanic or Latino', 'Not Hispanic or Latino']], ['gender', 'Gender', 'select', ['--', 'Female', 'Male', 'Non-binary', 'Prefer not to say']],
  ['maritalStatus', 'Marital Status', 'select', ['--', 'Single', 'Married', 'Divorced', 'Widowed']], ['socialSecurityNumber', 'Social Security Number', 'text'],
  ['badgeNumber', 'Badge Number', 'text'], ['agencyPersonnelId', 'Agency Personnel ID', 'text'], ['apiId', 'API ID', 'text'], ['firefighterId', 'Firefighter ID', 'text'], ['femaId', 'FEMA ID', 'text'],
  ['payrollId', 'Payroll ID', 'text'], ['unit', 'Unit', 'select', ['--', 'Engine 101', 'Engine 102', 'Truck 1', 'Rescue 1', 'Administration']],
  ['division', 'Division', 'select', ['--', 'Emergency Operations', 'Fire Prevention', 'Training', 'Administration']], ['district', 'District', 'select', ['--', 'District 1', 'District 2', 'District 3']],
  ['station', 'Station', 'select', ['--', 'Station 1', 'Station 2', 'Station 3']], ['shift', 'Shift', 'select', ['--', 'A Shift', 'B Shift', 'C Shift', 'Day Staff']],
  ['position', 'Position', 'select', ['--', 'Firefighter', 'Driver Operator', 'Lieutenant', 'Captain', 'Battalion Chief', 'Chief Officer']],
  ['rank', 'Rank', 'select', ['--', 'Firefighter', 'Driver', 'Lieutenant', 'Captain', 'Battalion Chief', 'Deputy Chief', 'Fire Chief']],
  ['group', 'Group', 'select', ['--', 'Operations', 'Administration', 'Prevention', 'Training']], ['employmentStatus', 'Employment Status', 'select', ['Full Time', 'Part Time', 'Volunteer', 'Reserve']],
  ['status', 'Status', 'select', ['Active', 'Reserve', 'Leave', 'Inactive']]
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
    ...personnelFileFields,
    ['employeeId', 'Employee ID / Login ID'], ['password', 'Password'], ['adminAccess', 'Admin Access', 'select', ['No', 'Yes']],
    ['certifications', 'Certifications / Notes', 'textarea']
  ],
  training: [
    ['course', 'Class / Certification Name'], ['date', 'Start Date', 'date'], ['endDate', 'End Date', 'date'],
    ['instructor', 'Instructor'], ['hours', 'Hours', 'number'],
    ['category', 'Category', 'select', ['Fire', 'EMS', 'Driver', 'Officer', 'Hazmat', 'Technical Rescue', 'ISO', 'LMS']],
    ['members', 'Attendees / Assigned Members'], ['completion', 'Completion %', 'number'],
    ['expirationDate', 'Expiration Date', 'date'], ['status', 'Status', 'select', ['Scheduled', 'In Progress', 'Completed', 'Overdue', 'Needs Documentation', 'Expired']],
    ['notes', 'Objectives / Notes', 'textarea']
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

const defaultSchemas = structuredClone(schemas);

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
    { course: 'Hose Drills', date: '2026-06-12', endDate: '2026-06-12', instructor: 'Training Officer', hours: '2', category: 'Fire', members: 'A Shift', completion: '0', expirationDate: '', status: 'Scheduled', notes: 'Company-level hose deployment and advancement.' },
    { course: 'Driver Pump Operator', date: '2026-06-18', endDate: '2026-06-18', instructor: 'Training Officer', hours: '4', category: 'Driver', members: 'Operators', completion: '78', expirationDate: '2027-06-18', status: 'In Progress', notes: 'Pump operations, positioning, and water supply.' },
    { course: 'EMT - Basic', date: '2026-05-20', endDate: '2026-06-30', instructor: 'EMS Chief', hours: '8', category: 'EMS', members: 'EMS personnel', completion: '86', expirationDate: '2028-06-30', status: 'In Progress', notes: 'Continuing education tracking.' },
    { course: 'Fire Officer I', date: '2026-07-01', endDate: '2026-07-01', instructor: 'Command Staff', hours: '3', category: 'Officer', members: 'Company officers', completion: '0', expirationDate: '2028-07-01', status: 'Scheduled', notes: 'Officer development module.' }
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
let adminMode = 'home';
let permissionEditIndex = 0;
let builderPageId = 'incidents';
let builderSyncStatus = 'Local';
let builderMessage = '';
let dataSyncStatus = 'Loading';
let sharedDataReady = false;
let sharedDataSaveTimer = null;
let inactivityTimer = null;
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
const rmsHeader = document.querySelector('.rms-header');
const rmsMain = document.querySelector('.rms-main');
const searchInput = document.getElementById('searchInput');
const addRecordBtn = document.getElementById('addRecordBtn');
const signOutBtn = document.getElementById('signOutBtn');
const currentUserBadge = document.getElementById('currentUserBadge');
const rmsHomeBtn = document.getElementById('rmsHomeBtn');
const modal = document.getElementById('recordModal');
const form = document.getElementById('recordForm');
const modalFields = document.getElementById('modalFields');
const modalTitle = document.getElementById('modalTitle');
const modalSection = document.getElementById('modalSection');
const deleteRecordBtn = document.getElementById('deleteRecordBtn');

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
  if (!saved) return normalizeStoredData();
  try {
    return normalizeStoredData(JSON.parse(saved));
  } catch {
    return normalizeStoredData();
  }
}

function normalizeStoredData(source = {}) {
  const parsed = { ...structuredClone(seed), ...source };
  delete parsed.updated_at;
  const savedMaintenance = parsed.maintenance || [];
  const customNames = savedMaintenance
    .map(item => item?.name)
    .filter(name => name && !apparatusNames.includes(name));
  const fleetNames = Array.isArray(parsed.apparatusList)
    ? parsed.apparatusList
    : [...apparatusNames, ...customNames];
  return {
    ...parsed,
    builder: normalizeBuilder(parsed.builder),
    personnel: mergePersonnel(parsed.personnel),
    apparatusList: [...new Set(fleetNames)],
    maintenance: mergeMaintenance(savedMaintenance, [...new Set(fleetNames)])
  };
}

function normalizeBuilder(builder = {}) {
  const builderSections = Array.isArray(builder.sections) && builder.sections.length ? builder.sections : defaultSections;
  const builderSchemas = builder.schemas && typeof builder.schemas === 'object' ? builder.schemas : defaultSchemas;
  return {
    sections: builderSections.map(section => ({
      id: section.id,
      icon: section.icon || 'PG',
      title: section.title || section.id,
      parentId: section.parentId || ''
    })),
    schemas: Object.fromEntries(Object.entries({ ...defaultSchemas, ...builderSchemas }).map(([key, fields]) => [
      key,
      Array.isArray(fields) ? fields.map(normalizeBuilderField) : []
    ]))
  };
}

function normalizeBuilderField(field = []) {
  if (Array.isArray(field)) return [field[0] || '', field[1] || field[0] || '', field[2] || 'text', Array.isArray(field[3]) ? field[3] : []];
  return [field.key || '', field.label || field.key || '', field.type || 'text', Array.isArray(field.options) ? field.options : []];
}

function mergePersonnel(saved = seed.personnel) {
  const personnel = saved.length ? saved : seed.personnel;
  return personnel.map((member, index) => {
    const merged = {
      firstName: '',
      middleName: '',
      lastName: '',
      name: '',
      rank: '',
      employeeId: '',
      agencyPersonnelId: '',
      station: 'Station 1',
      shift: 'A Shift',
      phone: '',
      email: '',
      password: '',
      status: 'Active',
      employmentStatus: 'Full Time',
      adminAccess: index === 0 ? 'Yes' : 'No',
      certifications: '',
      qualifiers: [],
      pagePermissions: appSections().filter(section => section.id !== 'admin').map(section => section.id),
      pageSettings: {},
      isTrainingInstructor: 'No',
      ...member,
      adminAccess: member.adminAccess || (index === 0 ? 'Yes' : 'No')
    };
    if (!merged.firstName && merged.name) {
      const parts = String(merged.name).trim().split(/\s+/);
      merged.firstName = parts.shift() || '';
      merged.lastName = parts.join(' ');
    }
    if (!merged.name) merged.name = personnelDisplayName(merged);
    if (!merged.employeeId) merged.employeeId = merged.agencyPersonnelId || '';
    if (!merged.agencyPersonnelId) merged.agencyPersonnelId = merged.employeeId || '';
    if (!Array.isArray(merged.qualifiers)) {
      merged.qualifiers = String(merged.qualifiers || merged.certifications || '').split(',').map(item => item.trim()).filter(Boolean);
    }
    if (!Array.isArray(merged.pagePermissions)) {
      merged.pagePermissions = merged.adminAccess === 'Yes'
        ? appSections().map(section => section.id)
        : appSections().filter(section => section.id !== 'admin').map(section => section.id);
    }
    if (merged.adminAccess === 'Yes' && !merged.pagePermissions.includes('admin')) merged.pagePermissions.push('admin');
    merged.pageSettings = normalizePageSettings(merged);
    if (!merged.email && index === 0) merged.email = 'admin@hornlakefire.com';
    if (!merged.password) merged.password = merged.employeeId || '100';
    return merged;
  });
}

function personnelDisplayName(member = {}) {
  return [member.firstName, member.middleName, member.lastName].filter(Boolean).join(' ').trim() || member.name || member.employeeId || 'Personnel';
}

function normalizePageSettings(member = {}) {
  const source = member.pageSettings && typeof member.pageSettings === 'object' ? member.pageSettings : {};
  const viewPages = new Set(member.pagePermissions || []);
  viewPages.add('dashboard');
  if (member.adminAccess === 'Yes') viewPages.add('admin');
  return Object.fromEntries(appSections().map(section => {
    const existing = Array.isArray(source[section.id]) ? source[section.id] : [];
    const settings = new Set(existing);
    if (viewPages.has(section.id)) settings.add('view');
    if (section.id === 'dashboard' || member.adminAccess === 'Yes' && section.id === 'admin') settings.add('view');
    return [section.id, [...settings]];
  }));
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

function appSections() {
  try {
    return data?.builder?.sections || defaultSections;
  } catch {
    return defaultSections;
  }
}

function appSchemas() {
  try {
    return data?.builder?.schemas || defaultSchemas;
  } catch {
    return defaultSchemas;
  }
}

function pageOptions() {
  return appSections().map(section => ({ id: section.id, title: section.title }));
}

function slugifyPageId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function grantPageToAdmins(pageId) {
  data.personnel.forEach(member => {
    if (member.adminAccess !== 'Yes') return;
    member.pagePermissions = Array.isArray(member.pagePermissions) ? member.pagePermissions : [];
    if (!member.pagePermissions.includes(pageId)) member.pagePermissions.push(pageId);
    member.pageSettings = normalizePageSettings(member);
  });
}

function removePageFromPermissions(pageId) {
  data.personnel.forEach(member => {
    member.pagePermissions = (member.pagePermissions || []).filter(id => id !== pageId);
    if (member.pageSettings && typeof member.pageSettings === 'object') delete member.pageSettings[pageId];
  });
}

function topLevelSections() {
  const ids = new Set(appSections().map(section => section.id));
  return appSections().filter(section => !section.parentId || !ids.has(section.parentId));
}

function childSections(parentId) {
  return appSections().filter(section => section.parentId === parentId);
}

function saveData() {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
  scheduleSharedDataSave();
}

async function loadSharedBuilderConfig() {
  try {
    const response = await fetch(RMS_CONFIG_API);
    if (!response.ok) throw new Error(`Config returned ${response.status}`);
    const payload = await response.json();
    if (payload.config?.sections?.length) {
      data.builder = normalizeBuilder(payload.config);
      builderSyncStatus = 'Shared';
      saveData();
      render();
      return;
    }
    builderSyncStatus = 'Local';
  } catch {
    builderSyncStatus = 'Local';
  }
}

async function saveSharedBuilderConfig() {
  try {
    builderSyncStatus = 'Saving';
    const response = await fetch(RMS_CONFIG_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.builder || normalizeBuilder()),
    });
    if (!response.ok) throw new Error(`Config save returned ${response.status}`);
    builderSyncStatus = 'Shared';
    builderMessage = 'Builder saved.';
    return true;
  } catch {
    builderSyncStatus = 'Local';
    builderMessage = 'Builder did not save. Try again.';
    return false;
  }
}

function sharedRmsDataPayload() {
  const { builder, updated_at, ...payload } = data;
  return payload;
}

async function loadSharedRmsData() {
  try {
    const response = await fetch(RMS_DATA_API);
    if (!response.ok) throw new Error(`Data returned ${response.status}`);
    const payload = await response.json();
    if (payload.data && Object.keys(payload.data).length) {
      const builder = data.builder;
      data = normalizeStoredData({ ...payload.data, builder });
      dataSyncStatus = 'Shared';
      localStorage.setItem(APP_KEY, JSON.stringify(data));
      sharedDataReady = true;
      render();
      return;
    }
    dataSyncStatus = 'Shared';
    sharedDataReady = true;
    saveSharedRmsData();
  } catch {
    dataSyncStatus = 'Local';
    sharedDataReady = true;
  }
}

function scheduleSharedDataSave() {
  if (!sharedDataReady) return;
  window.clearTimeout(sharedDataSaveTimer);
  sharedDataSaveTimer = window.setTimeout(saveSharedRmsData, 500);
}

async function saveSharedRmsData() {
  if (!sharedDataReady) return;
  try {
    dataSyncStatus = 'Saving';
    const response = await fetch(RMS_DATA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sharedRmsDataPayload()),
    });
    if (!response.ok) throw new Error(`Data save returned ${response.status}`);
    dataSyncStatus = 'Shared';
  } catch {
    dataSyncStatus = 'Local';
  }
}

function currentUser() {
  return data.personnel.find(member => String(member.email || '').toLowerCase() === String(currentUserId || '').toLowerCase()) || null;
}

function isAdminUser() {
  return currentUser()?.adminAccess === 'Yes';
}

function canViewSection(sectionId) {
  if (sectionId === 'dashboard') return true;
  const user = currentUser();
  if (!user) return false;
  if (sectionId === 'admin') return isAdminUser();
  return !Array.isArray(user.pagePermissions) || user.pagePermissions.includes(sectionId);
}

function visibleSections() {
  return appSections().filter(section => canViewSection(section.id));
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
  activeSection = 'hub';
  resetInactivityTimer();
  render();
}

function signOut(message = '') {
  localStorage.removeItem(SESSION_KEY);
  currentUserId = '';
  activeSection = 'hub';
  window.clearTimeout(inactivityTimer);
  showSignin(message);
}

function resetInactivityTimer() {
  if (!currentUserId) return;
  window.clearTimeout(inactivityTimer);
  inactivityTimer = window.setTimeout(() => {
    signOut('Signed out after 15 minutes of inactivity.');
  }, INACTIVITY_LIMIT_MS);
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
  const visibleIds = new Set(visibleSections().map(section => section.id));
  const hubButton = `
    <button class="nav-button ${activeSection === 'hub' ? 'active' : ''}" data-section="hub" type="button">
      <span class="nav-icon">MH</span>
      <span>Main Hub</span>
    </button>
  `;
  nav.innerHTML = hubButton + topLevelSections().filter(section => visibleIds.has(section.id)).map(section => `
    <button class="nav-button ${section.id === activeSection ? 'active' : ''}" data-section="${section.id}" type="button">
      <span class="nav-icon">${section.icon}</span>
      <span>${section.title}</span>
    </button>
    ${childSections(section.id).filter(child => visibleIds.has(child.id)).map(child => `
      <button class="nav-button nav-sub-button ${child.id === activeSection ? 'active' : ''}" data-section="${child.id}" type="button">
        <span class="nav-icon">${child.icon}</span>
        <span>${child.title}</span>
      </button>
    `).join('')}
  `).join('');
}

function setSection(id) {
  if (id === 'hub') {
    activeSection = 'hub';
    searchInput.value = '';
    const url = new URL(window.location.href);
    url.searchParams.delete('section');
    window.history.replaceState({}, '', url);
    render();
    return;
  }
  if (!canViewSection(id)) id = 'dashboard';
  if (id === 'admin' && activeSection !== 'admin') adminMode = 'home';
  activeSection = id;
  title.textContent = appSections().find(section => section.id === id)?.title || 'Application';
  searchInput.value = '';
  const url = new URL(window.location.href);
  url.searchParams.set('section', id);
  window.history.replaceState({}, '', url);
  render();
}

function initialSection() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('section');
  return appSections().some(section => section.id === requested) ? requested : 'hub';
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
  if (activeSection !== 'hub' && !canViewSection(activeSection)) activeSection = 'hub';
  title.textContent = appSections().find(section => section.id === activeSection)?.title || 'Application';
  currentUserBadge.textContent = `Welcome ${personnelDisplayName(currentUser())}${isAdminUser() ? ' | Admin' : ''}`;
  document.querySelector('.rms-shell').classList.toggle('rms-shell-hub', activeSection === 'hub');
  rmsHeader.classList.toggle('hidden', activeSection === 'hydrants' || activeSection === 'hub');
  rmsMain.classList.toggle('rms-main-full', activeSection === 'hydrants');
  rmsMain.classList.toggle('rms-main-hub', activeSection === 'hub');
  statsGrid.classList.toggle('hidden', activeSection === 'hydrants' || activeSection === 'hub');
  workspace.classList.toggle('workspace-full', activeSection === 'hydrants');
  workspace.classList.toggle('workspace-hub', activeSection === 'hub');
  renderNav();
  if (activeSection === 'hub') return renderRmsHub();
  addRecordBtn.style.display = activeSection === 'dashboard' || activeSection === 'maintenance' || activeSection === 'admin' || activeSection === 'personnel' ? 'none' : '';
  if (activeSection === 'dashboard') return renderDashboard();
  if (activeSection === 'personnel') return renderPersonnel();
  if (activeSection === 'training') return renderTraining();
  if (activeSection === 'hydrants') return renderHydrants();
  if (activeSection === 'maintenance') return renderMaintenance();
  if (activeSection === 'admin') return renderAdmin();
  renderRecords(activeSection);
}

function renderRmsHub() {
  const currentPages = topLevelSections().filter(section => canViewSection(section.id));
  const userLabel = `Welcome ${personnelDisplayName(currentUser())}`;
  const futurePages = [
    { id: 'dispatch', icon: 'DS', title: 'Dispatch', detail: 'CAD and unit status workspace' },
    { id: 'documents', icon: 'DC', title: 'Documents', detail: 'Policies, files, and attachments' },
    { id: 'scheduling', icon: 'SC', title: 'Scheduling', detail: 'Shift calendar and staffing view' },
    { id: 'assets', icon: 'AS', title: 'Assets', detail: 'Equipment tracking beyond apparatus' }
  ];
  workspace.innerHTML = `
    <section class="rms-hub">
      <header class="rms-hub-head">
        <img src="/horn-lake-logo.png" alt="Horn Lake Fire Department" />
        <div>
          <p class="kicker">Horn Lake Fire Department</p>
          <h1>Main Hub</h1>
          <p class="muted">Choose a workspace to open.</p>
        </div>
        <div class="hub-actions">
          <span class="user-badge">${esc(userLabel)}</span>
          <button class="secondary" id="hubSignOutBtn" type="button">Sign Out</button>
        </div>
      </header>
      <div class="hub-card-grid">
        ${currentPages.map(section => hubPageCard(section, false)).join('')}
        ${futurePages.map(section => hubPageCard(section, true)).join('')}
      </div>
    </section>
  `;
}

function hubPageCard(section, future = false) {
  return `
    <button class="hub-card ${future ? 'future' : ''}" type="button" ${future ? 'disabled' : `data-section="${esc(section.id)}"`}>
      <span class="nav-icon">${esc(section.icon)}</span>
      <strong>${esc(section.title)}</strong>
      <small>${esc(future ? section.detail : `${childSections(section.id).length} subpages`)}</small>
      <em>${future ? 'Future' : 'Open'}</em>
    </button>
  `;
}

function renderDashboard() {
  renderStats(dashboardStats());
  workspace.innerHTML = dashboardOverviewHtml();
}

function dashboardStats() {
  const openIncidents = data.incidents.filter(item => item.status !== 'Complete').length;
  const maintenanceSpend = data.maintenance.reduce((sum, item) => sum + serviceCost(item) + fuelCost(item), 0);
  return [
    { label: 'Open Incidents', value: openIncidents },
    { label: 'Apparatus', value: data.maintenance.length },
    { label: 'Personnel', value: data.personnel.length },
    { label: 'Fleet Expense', value: money(maintenanceSpend) }
  ];
}

function dashboardOverviewHtml(showAdminJump = true) {
  const openIncidents = data.incidents.filter(item => item.status !== 'Complete').length;
  const latestLogs = data.maintenance.flatMap(item => (item.serviceLogs || []).map(log => ({ ...log, apparatus: item.name })))
    .sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);

  return `
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
        ${showAdminJump ? (isAdminUser() ? '<button class="primary" data-jump-section="admin" type="button">Open Admin Use Metrics</button>' : '<span class="pill amber">Admin access required</span>') : '<span class="pill blue">Admin Overview</span>'}
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
  workspace.innerHTML = `
    <iframe
      class="external-app-frame"
      src="/hydrants/"
      title="Editable Hydrants App"
      onload="window.syncHydrantsFrame && window.syncHydrantsFrame(this)"
    ></iframe>
  `;
}

window.syncHydrantsFrame = function syncHydrantsFrame(frame) {
  try {
    const doc = frame.contentDocument;
    if (!doc || doc.getElementById('rmsHydrantChromeStyle')) return;
    const style = doc.createElement('style');
    style.id = 'rmsHydrantChromeStyle';
    style.textContent = `
      html,
      body,
      #root {
        width: 100% !important;
        max-width: none !important;
        min-height: 100vh !important;
        overflow-x: hidden !important;
        background: #071019 !important;
      }
      .app-shell {
        display: block !important;
        grid-template-columns: 1fr !important;
        padding: 0 !important;
        background: #071019 !important;
        min-height: 100vh !important;
      }
      .side-nav,
      .fire-quick-tabs,
      .ipad-tabs,
      main > header {
        display: none !important;
      }
      .main-stage {
        width: 100% !important;
        max-width: none !important;
        min-height: 100vh !important;
        background: #071019 !important;
        border-radius: 0 !important;
        border: 0 !important;
        box-shadow: none !important;
        overflow: visible !important;
      }
      .hydrant-work-tabs {
        margin: 0 !important;
        border-top: 0 !important;
        padding-top: 8px !important;
      }
      .page-body {
        padding: 0 10px 10px !important;
        min-height: calc(100vh - 58px) !important;
      }
      .dashboard-grid {
        width: 100% !important;
        max-width: none !important;
      }
    `;
    doc.head.appendChild(style);
  } catch {}
};

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
            <div><strong>${esc(personnelDisplayName(member))}</strong><small>${esc(member.rank || member.position || '')}</small></div>
            <span class="pill ${member.status === 'Active' ? 'green' : 'amber'}">${esc(member.status || 'Active')}</span>
          </header>
          <div class="info-list">
            <div class="info-line"><span>Agency ID</span><b>${esc(member.agencyPersonnelId || member.employeeId || '--')}</b></div>
            <div class="info-line"><span>Station</span><b>${esc(member.station || '--')}</b></div>
            <div class="info-line"><span>Shift</span><b>${esc(member.shift || '--')}</b></div>
            <div class="info-line"><span>EMS Level</span><b>${esc(member.emsProviderLevel || '--')}</b></div>
            <div class="info-line"><span>Phone</span><b>${esc(member.phone || '--')}</b></div>
            <div class="info-line"><span>Employment</span><b>${esc(member.employmentStatus || '--')}</b></div>
          </div>
          <div class="pill-row">
            ${(member.qualifiers || []).slice(0, 4).map(item => `<span class="pill blue">${esc(item)}</span>`).join('')}
            <span class="pill">${esc((member.pagePermissions || []).length)} Pages</span>
            ${member.adminAccess === 'Yes' ? '<span class="pill red">Admin</span>' : ''}
          </div>
          <p class="muted">${esc(member.certifications || 'No notes entered.')}</p>
        </article>
      `).join('') || emptyPanel('personnel')}
    </section>
  `;
}

function renderTraining() {
  const records = filterRecords(data.training || []);
  const overdue = records.filter(item => trainingStatus(item) === 'Overdue').length;
  const inProgress = records.filter(item => trainingStatus(item) === 'In Progress').length;
  const completedHours = records
    .filter(item => trainingStatus(item) === 'Completed')
    .reduce((sum, item) => sum + Number(item.hours || 0), 0);
  const averageCompletion = records.length
    ? Math.round(records.reduce((sum, item) => sum + trainingCompletion(item), 0) / records.length)
    : 0;

  renderStats([
    { label: 'Training Records', value: records.length },
    { label: 'In Progress', value: inProgress },
    { label: 'Overdue', value: overdue },
    { label: 'Completed Hours', value: completedHours }
  ]);

  const upcomingClasses = records
    .filter(item => ['Scheduled', 'Overdue', 'Needs Documentation'].includes(trainingStatus(item)))
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
    .slice(0, 6);
  const activeCerts = records
    .filter(item => item.expirationDate || ['In Progress', 'Completed', 'Expired'].includes(trainingStatus(item)))
    .sort((a, b) => trainingCompletion(b) - trainingCompletion(a))
    .slice(0, 6);
  const certProgress = records
    .filter(item => trainingStatus(item) === 'In Progress')
    .sort((a, b) => String(a.endDate || '').localeCompare(String(b.endDate || '')))
    .slice(0, 6);
  const complianceQueue = records
    .filter(item => ['Overdue', 'Needs Documentation', 'Expired'].includes(trainingStatus(item)))
    .sort((a, b) => String(a.endDate || a.expirationDate || '').localeCompare(String(b.endDate || b.expirationDate || '')))
    .slice(0, 6);

  workspace.innerHTML = `
    <section class="training-hero panel">
      <div>
        <span>Training Hub</span>
        <h2>Department Training Dashboard</h2>
        <p class="muted">Manage upcoming classes, certifications, compliance items, and completion progress from one page.</p>
      </div>
      <div class="training-hero-actions">
        <div class="training-score">
          <small>Average Completion</small>
          <strong>${averageCompletion}%</strong>
        </div>
        <button class="primary" type="button" data-add-training>Add Training</button>
      </div>
    </section>
    <section class="training-dashboard-grid">
      ${trainingTableCard('Active And Upcoming Classes', upcomingClasses, ['Class Name', 'Status', 'Start Date', 'Completion', 'Actions'], item => `
        <td><strong>${esc(item.course || 'Training')}</strong><small>${esc(item.category || '')}</small></td>
        <td>${trainingStatusPill(item)}</td>
        <td>${esc(formatDate(item.date))}</td>
        <td>${trainingProgress(item)}</td>
        <td>${trainingActionButton(item)}</td>
      `)}
      ${trainingTableCard('My Active Certifications', activeCerts, ['Certification Name', 'Progress', 'Expiration Date', 'Actions'], item => `
        <td><strong>${esc(item.course || 'Certification')}</strong><small>${esc(item.instructor || '')}</small></td>
        <td>${trainingProgress(item)}</td>
        <td>${esc(formatDate(item.expirationDate))}</td>
        <td>${trainingActionButton(item)}</td>
      `)}
      ${trainingTableCard('Certifications In Progress', certProgress, ['Class Name', 'End Date', 'Attendee(s)', 'Actions'], item => `
        <td><strong>${esc(item.course || 'Class')}</strong><small>${esc(item.category || '')}</small></td>
        <td>${esc(formatDate(item.endDate))}</td>
        <td>${esc(item.members || '--')}</td>
        <td>${trainingActionButton(item)}</td>
      `)}
      ${trainingTableCard('Compliance And Documentation Queue', complianceQueue, ['Class Name', 'Status', 'Due Date', 'Actions'], item => `
        <td><strong>${esc(item.course || 'Requirement')}</strong><small>${esc(item.members || '')}</small></td>
        <td>${trainingStatusPill(item)}</td>
        <td>${esc(formatDate(item.endDate || item.expirationDate || item.date))}</td>
        <td>${trainingActionButton(item)}</td>
      `)}
    </section>
  `;
}

function trainingTableCard(titleText, rows, headings, rowHtml) {
  return `
    <article class="training-card">
      <header>
        <h3>${esc(titleText)}</h3>
        <button class="icon-button" type="button" data-add-training title="Add training record">+</button>
      </header>
      <div class="training-table-wrap">
        <table class="training-table">
          <thead><tr>${headings.map(heading => `<th>${esc(heading)}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map((item) => `<tr>${rowHtml(item)}</tr>`).join('') || `<tr><td colspan="${headings.length}"><p class="muted">No records to show.</p></td></tr>`}
          </tbody>
        </table>
      </div>
      <footer><span>Show:</span><button type="button">20</button><button type="button">50</button><button type="button">All</button></footer>
    </article>
  `;
}

function trainingCompletion(item) {
  if (item.status === 'Completed') return 100;
  return Math.max(0, Math.min(100, Number(item.completion || 0)));
}

function trainingStatus(item) {
  const status = item.status || 'Scheduled';
  const today = new Date().toISOString().slice(0, 10);
  if (status === 'Completed') return 'Completed';
  if (status === 'Expired') return 'Expired';
  if ((item.endDate && item.endDate < today || item.expirationDate && item.expirationDate < today) && status !== 'Completed') return 'Overdue';
  return status;
}

function trainingStatusPill(item) {
  const status = trainingStatus(item);
  const color = /complete/i.test(status) ? 'green' : /overdue|expired|needs/i.test(status) ? 'red' : /progress/i.test(status) ? 'amber' : 'blue';
  return `<span class="pill ${color}">${esc(status)}</span>`;
}

function trainingProgress(item) {
  const value = trainingCompletion(item);
  return `
    <div class="training-progress">
      <span><i style="width:${value}%"></i></span>
      <small>${value}%</small>
    </div>
  `;
}

function trainingActionButton(item) {
  const index = data.training.indexOf(item);
  return `<button class="small-button training-go-button" type="button" data-edit-section="training" data-edit-index="${index}">Go to Class</button>`;
}

function formatDate(value) {
  if (!value) return '--';
  const parts = String(value).split('-');
  if (parts.length !== 3) return value;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function renderRecords(sectionId) {
  const records = filterRecords(data[sectionId] || []);
  renderStats([
    { label: 'Records', value: records.length },
    { label: 'Open', value: records.filter(item => !['Complete', 'Submitted', 'Passed', 'Current', 'Archived'].includes(item.status || item.reviewStatus)).length },
    { label: 'This Section', value: appSections().find(section => section.id === sectionId)?.title || sectionId },
    { label: 'Data Sync', value: dataSyncStatus }
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
  return `<article class="panel wide-card"><h2>No Records Yet</h2><p class="muted">${esc(appSections().find(section => section.id === sectionId)?.title || sectionId)} records will appear here when they are added.</p></article>`;
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

  const context = { totalRuns, totalMinutes, recentRuns };
  if (adminMode !== 'home') {
    workspace.innerHTML = adminPage(adminMode, context);
    return;
  }

  workspace.innerHTML = `
    <section class="admin-overview">
      <header class="admin-card-head">
        <div><span>Overview</span><h2>Dashboard Summary</h2></div>
        <b>DB</b>
      </header>
      <div class="admin-page-body">${dashboardOverviewHtml(false)}</div>
    </section>
    <div class="admin-launch-grid">
      ${adminLaunchCard('rms-builder', 'Builder', 'Page Builder', appSections().length, 'Add pages, edit menu labels, reorder pages, and build page fields without code.')}
      ${adminLaunchCard('personnel-file', 'Personnel', 'Personnel File', data.personnel.length, 'Create and edit full personnel files, login access, page permissions, and qualifiers.')}
      ${adminLaunchCard('apparatus-setup', 'Fleet', 'Apparatus Setup', '+', 'Add new apparatus to the fleet and assign default details.')}
      ${adminLaunchCard('apparatus-list', 'Fleet', 'Current Apparatus', data.maintenance.length, 'Review and remove apparatus from the fleet list.')}
      ${adminLaunchCard('apparatus-use', 'Metrics', 'Apparatus Use', totalRuns, 'Log run time, mileage, call type, and station by apparatus.')}
      ${adminLaunchCard('readiness', 'Readiness', '95/95 Summary', `${(totalMinutes / 60).toFixed(1)}h`, 'Review imported run hours and readiness calculations.')}
      ${adminLaunchCard('recent-runs', 'Activity', 'Recent Apparatus Runs', recentRuns.length, 'See the latest apparatus run metrics entered into Admin.')}
    </div>
    <details class="admin-settings-panel">
      <summary class="admin-card-head">
        <div><span>Settings</span><h2>Page Settings Tree</h2></div>
        <b>${appSections().length}</b>
      </summary>
      <div class="admin-page-body">${adminSettingsTree()}</div>
    </details>
  `;
}

function adminLaunchCard(mode, label, titleText, count, detail) {
  return `
    <button class="admin-launch-card" data-admin-mode="${mode}" type="button">
      <span>${esc(label)}</span>
      <strong>${esc(titleText)}</strong>
      <em>${esc(detail)}</em>
      <b>${esc(count)}</b>
    </button>
  `;
}

function adminPage(mode, context) {
  const pages = {
    'rms-builder': ['Builder', 'Page Builder', appSections().length, adminBuilderPage()],
    'personnel-file': ['Personnel', 'Personnel File', data.personnel.length, adminPersonnelFile()],
    'apparatus-setup': ['Fleet', 'Apparatus Setup', '+', adminApparatusSetup()],
    'apparatus-list': ['Fleet', 'Current Apparatus', data.maintenance.length, adminApparatusList()],
    'apparatus-use': ['Metrics', 'Apparatus Use', context.totalRuns, adminApparatusUse()],
    readiness: ['Readiness', '95/95 Summary', `${(context.totalMinutes / 60).toFixed(1)}h`, adminReadinessSummary()],
    'recent-runs': ['Activity', 'Recent Apparatus Runs', context.recentRuns.length, adminRecentRuns(context.recentRuns)]
  };
  const page = pages[mode] || pages['personnel-file'];
  return `
    <section class="admin-page">
      <header class="admin-page-head">
        <button class="secondary" data-admin-mode="home" type="button">Back to Admin</button>
        <div><span>${esc(page[0])}</span><h2>${esc(page[1])}</h2></div>
        <b>${esc(page[2])}</b>
      </header>
      <div class="admin-page-body">${page[3]}</div>
    </section>
  `;
}

function adminSettingsTree() {
  const renderSettingsNode = (section) => `
    <details class="admin-settings-node">
      <summary>
        <span class="nav-icon">${esc(section.icon)}</span>
        <strong>${esc(section.title)}</strong>
        <em>${section.id === 'admin' ? 'Access controls' : childSections(section.id).length ? `${childSections(section.id).length} subpages` : 'Page settings'}</em>
      </summary>
      ${section.id === 'admin' ? `
        <div class="admin-settings-children">
          <details class="admin-settings-node nested">
            <summary>
              <span class="nav-icon">PG</span>
              <strong>Page Permissions</strong>
              <em>Select personnel, edit access, save</em>
            </summary>
            <div class="admin-settings-content">${adminPermissionsPage()}</div>
          </details>
          ${childSections(section.id).map(child => renderSettingsNode(child)).join('')}
        </div>
      ` : `
        <div class="admin-settings-content">
          <p class="muted">${esc(section.title)} settings can be added here as this module grows.</p>
          ${childSections(section.id).length ? `<div class="admin-settings-children">${childSections(section.id).map(child => renderSettingsNode(child)).join('')}</div>` : ''}
        </div>
      `}
    </details>
  `;
  return `
    <div class="admin-settings-tree">
      ${topLevelSections().map(section => renderSettingsNode(section)).join('')}
    </div>
  `;
}

function adminBuilderPage() {
  if (!appSections().some(section => section.id === builderPageId)) builderPageId = appSections().find(section => section.id !== 'dashboard' && section.id !== 'admin')?.id || 'incidents';
  const selectedSection = appSections().find(section => section.id === builderPageId) || appSections()[0];
  const fields = appSchemas()[selectedSection.id] || [];
  const canDeleteSelectedPage = !['dashboard', 'admin'].includes(selectedSection.id);
  const parentOptions = [{ label: 'No Parent / Main Page', value: '' }, ...appSections()
    .filter(section => section.id !== selectedSection.id)
    .map(section => ({ label: section.title, value: section.id }))];
  return `
    <div class="builder-grid">
      <section class="builder-panel">
        <h3>Page Menu <span class="pill blue">${esc(builderSyncStatus)}</span></h3>
        ${builderMessage ? `<p class="form-message">${esc(builderMessage)}</p>` : ''}
        <div class="builder-page-list">
          ${appSections().map((section, index) => {
            const canDeletePage = !['dashboard', 'admin'].includes(section.id);
            return `
            <div class="builder-row ${section.id === builderPageId ? 'active' : ''}">
              <button class="small-button" data-builder-select-page="${esc(section.id)}" type="button">${esc(section.icon)} ${esc(section.title)}</button>
              <div class="builder-row-actions">
                <button class="small-button" data-builder-move-page="${index}" data-builder-direction="-1" type="button">Up</button>
                <button class="small-button" data-builder-move-page="${index}" data-builder-direction="1" type="button">Down</button>
                ${canDeletePage ? `<button class="danger-button" data-builder-delete-page="${esc(section.id)}" type="button">Delete</button>` : ''}
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </section>
      <section class="builder-panel">
        <h3>Edit Selected Page</h3>
        <form id="builderPageForm" class="run-log-form">
          <input type="hidden" name="builderPageId" value="${esc(selectedSection.id)}" />
          ${fieldHtml('builderPageTitle', 'Page Name', 'text', [], selectedSection.title)}
          ${fieldHtml('builderPageIcon', 'Menu Icon / Initials', 'text', [], selectedSection.icon)}
          ${fieldHtml('builderPageParent', 'Parent Page', 'select', parentOptions, selectedSection.parentId || '')}
          <div class="form-field full builder-button-row">
            <button class="primary" type="submit">Save Page & Sync</button>
            ${canDeleteSelectedPage ? `<button class="danger-button" data-builder-delete-page="${esc(selectedSection.id)}" type="button">Delete Page</button>` : '<span class="pill amber">Core page</span>'}
          </div>
        </form>
        <h3>Add New Page</h3>
        <form id="builderAddPageForm" class="run-log-form">
          ${fieldHtml('newBuilderPageTitle', 'Page Name')}
          ${fieldHtml('newBuilderPageId', 'Page ID, optional')}
          ${fieldHtml('newBuilderPageIcon', 'Icon / Initials')}
          ${fieldHtml('newBuilderPageParent', 'Parent Page', 'select', [{ label: 'No Parent / Main Page', value: '' }, ...appSections().map(section => ({ label: section.title, value: section.id }))])}
          <div class="form-field full"><button class="primary" type="submit">Add Page & Sync</button></div>
        </form>
      </section>
      <section class="builder-panel builder-panel-wide">
        <h3>${esc(selectedSection.title)} Fields</h3>
        <form id="builderFieldsEditForm" class="builder-field-list">
          ${fields.map((field, index) => `
            <div class="builder-field-row">
              <div class="builder-field-edit-grid">
                ${fieldHtml(`fieldKey_${index}`, 'Key', 'text', [], field[0])}
                ${fieldHtml(`fieldLabel_${index}`, 'Label', 'text', [], field[1])}
                ${fieldHtml(`fieldType_${index}`, 'Type', 'select', ['text', 'number', 'date', 'email', 'tel', 'select', 'textarea'], field[2] || 'text')}
                ${fieldHtml(`fieldOptions_${index}`, 'Options', 'text', [], field[3]?.join(', ') || '')}
              </div>
              <button class="danger-button" data-builder-remove-field="${index}" type="button">Remove</button>
            </div>
          `).join('') || '<p class="muted">No fields yet.</p>'}
          ${fields.length ? '<button class="secondary" type="submit">Save Field Edits & Sync</button>' : ''}
        </form>
        <form id="builderFieldForm" class="run-log-form">
          ${fieldHtml('builderFieldKey', 'Field Key')}
          ${fieldHtml('builderFieldLabel', 'Field Label')}
          ${fieldHtml('builderFieldType', 'Field Type', 'select', ['text', 'number', 'date', 'email', 'tel', 'select', 'textarea'])}
          ${fieldHtml('builderFieldOptions', 'Dropdown Options, comma separated')}
          <div class="form-field full"><button class="primary" type="submit">Add Field & Sync</button></div>
        </form>
      </section>
    </div>
  `;
}

function adminPersonnelFile() {
  return `
    <form id="personnelAdminForm" class="personnel-file-form">
      ${personnelFileFields.map(([key, label, type = 'text', options = []]) => fieldHtml(`personnel_${key}`, label, type, options)).join('')}
      ${fieldHtml('personnel_employeeId', 'Employee ID / Login ID')}
      ${fieldHtml('personnel_password', 'Password')}
      ${fieldHtml('personnel_adminAccess', 'Admin Access', 'select', ['No', 'Yes'])}
      <div class="form-field full"><label>Page Permissions</label><div class="check-grid permission-grid">${pageOptions().map(page => `<label><input type="checkbox" name="personnel_pagePermissions" value="${esc(page.id)}">${esc(page.title)}</label>`).join('')}</div></div>
      <div class="form-field full"><label>Qualifiers</label><div class="check-grid qualifier-grid">${personnelQualifiers.map(qualifier => `<label><input type="checkbox" name="personnel_qualifiers" value="${esc(qualifier)}">${esc(qualifier)}</label>`).join('')}</div></div>
      <div class="form-field"><label for="personnel_isTrainingInstructor">Is Training Instructor</label><select id="personnel_isTrainingInstructor" name="personnel_isTrainingInstructor"><option>No</option><option>Yes</option></select></div>
      ${fieldHtml('personnel_certifications', 'Certifications / Notes', 'textarea')}
      <input type="hidden" id="personnelEditIndex" name="personnelEditIndex" value="" />
      <p id="personnelSaveMessage" class="form-message full"></p>
      <div class="form-field full">
        <button class="primary" type="submit">Save Personnel</button>
        <button class="secondary" id="clearPersonnelForm" type="button">Clear Form</button>
      </div>
    </form>
  `;
}

function adminPersonnelList() {
  return `<div class="queue-list">${data.personnel.map((member, index) => `<div class="queue-item"><div><strong>${esc(member.name || member.employeeId)}</strong><br><small>${esc(member.email || 'No email')} | ${esc(member.rank || '')} | Pages: ${(member.pagePermissions || []).length} | Admin: ${member.adminAccess === 'Yes' ? 'Yes' : 'No'}</small></div><button class="small-button" data-edit-personnel="${index}" type="button">Edit</button></div>`).join('')}</div>`;
}

function adminPermissionsPage() {
  if (!data.personnel[permissionEditIndex]) permissionEditIndex = 0;
  const member = data.personnel[permissionEditIndex] || {};
  const settings = normalizePageSettings(member);
  return `
    <form id="permissionsForm" class="permission-editor-card">
      <div class="permission-editor-top">
        ${fieldHtml('permissionPersonIndex', 'Personnel Name', 'select', data.personnel.map((person, index) => ({ label: personnelDisplayName(person), value: String(index) })), String(permissionEditIndex))}
        <div class="permission-editor-summary">
          <strong>${esc(personnelDisplayName(member))}</strong>
          <small>${esc(member.email || member.employeeId || 'No login listed')}</small>
          <span class="pill ${member.adminAccess === 'Yes' ? 'red' : 'blue'}">${member.adminAccess === 'Yes' ? 'Admin' : 'User'}</span>
        </div>
      </div>
      <div class="permission-tree">
        ${appSections().map((section, index) => {
          const pageSettings = settings[section.id] || [];
          const lockedView = section.id === 'dashboard' || member.adminAccess === 'Yes' && section.id === 'admin';
          return `
            <details class="permission-tree-item">
              <summary>
                <span class="nav-icon">${esc(section.icon)}</span>
                <strong>${esc(section.title)}</strong>
                <em>${pageSettings.includes('view') ? 'Visible' : 'Hidden'}</em>
              </summary>
              <div class="check-grid permission-settings-grid">
                ${pageSettingOptions.map(([setting, label]) => {
                  const checked = pageSettings.includes(setting) || setting === 'view' && lockedView;
                  const disabled = setting === 'view' && lockedView;
                  return `<label><input type="checkbox" name="pageSetting_${esc(section.id)}" value="${esc(setting)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>${esc(label)}</label>`;
                }).join('')}
              </div>
            </details>
          `;
        }).join('')}
      </div>
      <p id="permissionsSaveMessage" class="form-message full"></p>
      <div class="form-field full">
        <button class="primary" type="submit">Save Page Permissions</button>
      </div>
    </form>
  `;
}

function adminApparatusSetup() {
  return `
    <form id="apparatusSetupForm" class="run-log-form">
      ${fieldHtml('newApparatusName', 'Apparatus Name')}
      ${fieldHtml('newApparatusType', 'Apparatus Type', 'select', ['Pumper', 'Ladder Truck', 'Brush Truck', 'Ambulance', 'Fleet', 'Support Vehicle'])}
      ${fieldHtml('newApparatusStatus', 'Status', 'select', ['Needs Data', 'In Service', 'Reserve', 'In Shop', 'Out of Service', 'Needs Inspection'])}
      ${fieldHtml('newApparatusLocation', 'Location', 'select', ['Station 1', 'Station 2', 'Station 3'])}
      <div class="form-field full"><button class="primary" type="submit">Add Apparatus</button></div>
    </form>
  `;
}

function adminApparatusList() {
  return `<div class="queue-list">${data.maintenance.map((item, index) => `<div class="queue-item"><div><strong>${esc(item.name)}</strong><br><small>${esc(item.type)} | ${esc(item.location)} | ${esc(item.status)}</small></div><button class="danger-button" data-remove-apparatus="${index}" type="button">Remove</button></div>`).join('')}</div>`;
}

function adminApparatusUse() {
  return `
    <form id="runLogForm" class="run-log-form">
      ${fieldHtml('runApparatus', 'Apparatus', 'select', getApparatusNames())}
      ${fieldHtml('runIncident', 'Incident Number')}
      ${fieldHtml('runDate', 'Run Date', 'date', [], new Date().toISOString().slice(0, 10))}
      ${fieldHtml('runType', 'Call Type')}
      ${fieldHtml('runMinutes', 'Total Call Time Minutes', 'number')}
      ${fieldHtml('runMiles', 'Run Miles', 'number')}
      ${fieldHtml('runStation', 'Station', 'select', ['Station 1', 'Station 2', 'Station 3'])}
      ${fieldHtml('runNotes', 'Run Notes', 'textarea')}
      <div class="form-field full"><button class="primary" type="submit">Log Apparatus Run</button></div>
    </form>
  `;
}

function adminReadinessSummary() {
  return `<div class="queue-list">${data.maintenance.map(item => {
    const metric = calc95(item);
    return `<div class="queue-item"><div><strong>${esc(item.name)}</strong><br><small>${(metric.runHours || 0).toFixed(2)} imported run hours | ${(metric.totalOperatingHours || 0).toFixed(2)} total operating hours</small></div><span class="pill ${metric.passes ? 'green' : 'amber'}">${metric.availability.toFixed(1)}%</span></div>`;
  }).join('')}</div>`;
}

function adminRecentRuns(recentRuns) {
  return `<div class="queue-list">${recentRuns.length ? recentRuns.map(log => `<div class="queue-item"><div><strong>${esc(log.apparatus)} - ${esc(log.incident || 'Run')}</strong><br><small>${esc(log.date || 'No date')} | ${esc(log.callType || 'Call')} | ${esc(log.callMinutes || 0)} minutes | ${esc(log.station || '')}</small></div><span class="pill blue">${esc(log.miles || 0)} mi</span></div>`).join('') : '<p class="muted">No apparatus run metrics logged yet.</p>'}</div>`;
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
  const schema = appSchemas()[sectionId] || [];
  const record = index === null ? {} : data[sectionId][index];
  modalSection.textContent = appSections().find(section => section.id === sectionId)?.title || sectionId;
  modalTitle.textContent = index === null ? 'Add Record' : 'Edit Record';
  deleteRecordBtn.style.display = index === null ? 'none' : '';
  modalFields.innerHTML = schema.map(([key, label, type = 'text', options = []]) => fieldHtml(key, label, type, options, record[key])).join('');
  modal.showModal();
}

function openMaintenanceModal(index) {
  const item = data.maintenance[index];
  editing = { sectionId: 'maintenance', index };
  modalSection.textContent = 'Maintenance';
  modalTitle.textContent = `${item.name}`;
  deleteRecordBtn.style.display = 'none';
  modalFields.innerHTML = maintenanceFields(item);
  modal.showModal();
}

function fieldHtml(key, label, type = 'text', options = [], value = '') {
  if (type === 'textarea') {
    return `<div class="form-field full"><label for="${key}">${label}</label><textarea id="${key}" name="${key}">${esc(value)}</textarea></div>`;
  }
  if (type === 'select') {
    return `<div class="form-field"><label for="${key}">${label}</label><select id="${key}" name="${key}">${options.map(option => {
      const optionValue = typeof option === 'object' ? option.value : option;
      const optionLabel = typeof option === 'object' ? option.label : option;
      return `<option value="${esc(optionValue)}" ${String(optionValue) === String(value) ? 'selected' : ''}>${esc(optionLabel)}</option>`;
    }).join('')}</select></div>`;
  }
  return `<div class="form-field"><label for="${key}">${label}</label><input id="${key}" name="${key}" type="${type}" value="${esc(value)}" /></div>`;
}

function setPersonnelForm(member = {}) {
  const fields = [...personnelFileFields.map(([key]) => key), 'employeeId', 'password', 'adminAccess', 'isTrainingInstructor', 'certifications'];
  fields.forEach(key => {
    const input = document.getElementById(`personnel_${key}`);
    if (input) input.value = member[key] || '';
  });
  document.getElementById('personnel_employeeId').value = member.employeeId || member.agencyPersonnelId || '';
  document.getElementById('personnel_password').value = member.password || '';
  document.getElementById('personnel_adminAccess').value = member.adminAccess || 'No';
  document.getElementById('personnel_isTrainingInstructor').value = member.isTrainingInstructor || 'No';
  document.querySelectorAll('[name="personnel_qualifiers"]').forEach(input => {
    input.checked = (member.qualifiers || []).includes(input.value);
  });
  document.querySelectorAll('[name="personnel_pagePermissions"]').forEach(input => {
    input.checked = (member.pagePermissions || []).includes(input.value);
  });
}

function personnelRecordFromForm(formData, existingRecord = {}) {
  const record = {};
  personnelFileFields.forEach(([key]) => {
    record[key] = formData.get(`personnel_${key}`) || '';
  });
  record.email = String(record.email || '').trim().toLowerCase();
  record.employeeId = String(formData.get('personnel_employeeId') || record.agencyPersonnelId || existingRecord.employeeId || '').trim();
  record.agencyPersonnelId = String(record.agencyPersonnelId || record.employeeId || '').trim();
  record.password = String(formData.get('personnel_password') || existingRecord.password || '').trim();
  record.adminAccess = formData.get('personnel_adminAccess') || 'No';
  record.qualifiers = formData.getAll('personnel_qualifiers');
  record.pagePermissions = formData.getAll('personnel_pagePermissions');
  if (!record.pagePermissions.includes('dashboard')) record.pagePermissions.unshift('dashboard');
  if (record.adminAccess === 'Yes' && !record.pagePermissions.includes('admin')) record.pagePermissions.push('admin');
  if (record.adminAccess !== 'Yes') record.pagePermissions = record.pagePermissions.filter(page => page !== 'admin');
  record.isTrainingInstructor = formData.get('personnel_isTrainingInstructor') || 'No';
  record.certifications = formData.get('personnel_certifications') || '';
  record.name = personnelDisplayName(record);
  record.phone = record.phone || '';
  record.pageSettings = normalizePageSettings(record);
  return record;
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
  const schema = appSchemas()[sectionId] || [];
  const record = {};
  schema.forEach(([key]) => record[key] = formData.get(key) || '');
  data[sectionId] = data[sectionId] || [];
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
  const sectionButton = event.target.closest('[data-section]');
  if (sectionButton) return setSection(sectionButton.dataset.section);
  const jumpButton = event.target.closest('[data-jump-section]');
  if (jumpButton) return setSection(jumpButton.dataset.jumpSection);
  const hubSignOutButton = event.target.closest('#hubSignOutBtn');
  if (hubSignOutButton) return signOut();
  const addTrainingButton = event.target.closest('[data-add-training]');
  if (addTrainingButton) return openGenericModal('training');
  const adminModeButton = event.target.closest('[data-admin-mode]');
  if (adminModeButton) {
    adminMode = adminModeButton.dataset.adminMode;
    renderAdmin();
    return;
  }
  const personnelButton = event.target.closest('[data-edit-personnel]');
  if (personnelButton) {
    const member = data.personnel[Number(personnelButton.dataset.editPersonnel)];
    if (!member) return;
    adminMode = 'personnel-file';
    renderAdmin();
    setPersonnelForm(member);
    document.getElementById('personnelEditIndex').value = personnelButton.dataset.editPersonnel;
    document.getElementById('personnelSaveMessage').textContent = `Editing ${personnelDisplayName(member)}`;
    return;
  }
  const builderSelectPage = event.target.closest('[data-builder-select-page]');
  if (builderSelectPage) {
    builderPageId = builderSelectPage.dataset.builderSelectPage;
    renderAdmin();
    return;
  }
  const builderMovePage = event.target.closest('[data-builder-move-page]');
  if (builderMovePage) {
    const index = Number(builderMovePage.dataset.builderMovePage);
    const direction = Number(builderMovePage.dataset.builderDirection);
    const nextIndex = index + direction;
    const pages = data.builder.sections;
    if (nextIndex < 0 || nextIndex >= pages.length) return;
    const [page] = pages.splice(index, 1);
    pages.splice(nextIndex, 0, page);
    saveData();
    saveSharedBuilderConfig().then(() => {
      renderAdmin();
      renderNav();
    });
    renderAdmin();
    renderNav();
    return;
  }
  const builderRemoveField = event.target.closest('[data-builder-remove-field]');
  if (builderRemoveField) {
    const fields = data.builder.schemas[builderPageId] || [];
    fields.splice(Number(builderRemoveField.dataset.builderRemoveField), 1);
    data.builder.schemas[builderPageId] = fields;
    saveData();
    saveSharedBuilderConfig().then(renderAdmin);
    renderAdmin();
    return;
  }
  const builderDeletePage = event.target.closest('[data-builder-delete-page]');
  if (builderDeletePage) {
    const pageId = builderDeletePage.dataset.builderDeletePage;
    const page = data.builder.sections.find(section => section.id === pageId);
    if (!page || ['dashboard', 'admin'].includes(pageId)) return;
    const ok = window.confirm(`Delete ${page.title} from the menu? Records on that page will also be removed.`);
    if (!ok) return;
    data.builder.sections = data.builder.sections
      .filter(section => section.id !== pageId)
      .map(section => section.parentId === pageId ? { ...section, parentId: '' } : section);
    delete data.builder.schemas[pageId];
    delete data[pageId];
    removePageFromPermissions(pageId);
    builderPageId = data.builder.sections.find(section => section.id !== 'dashboard' && section.id !== 'admin')?.id || 'dashboard';
    saveData();
    saveSharedBuilderConfig().then(() => {
      renderAdmin();
      renderNav();
    });
    renderAdmin();
    renderNav();
    return;
  }
  const permissionInput = event.target.closest('[data-permission-person]');
  if (permissionInput) {
    const member = data.personnel[Number(permissionInput.dataset.permissionPerson)];
    const page = permissionInput.dataset.permissionPage;
    if (!member || !page) return;
    const permissions = new Set(member.pagePermissions || []);
    permissions.add('dashboard');
    if (permissionInput.checked) permissions.add(page);
    else permissions.delete(page);
    if (member.adminAccess === 'Yes') permissions.add('admin');
    else permissions.delete('admin');
    member.pagePermissions = [...permissions];
    saveData();
    renderAdmin();
    return;
  }
  const clearPersonnelButton = event.target.closest('#clearPersonnelForm');
  if (clearPersonnelButton) {
    document.getElementById('personnelAdminForm').reset();
    document.getElementById('personnelEditIndex').value = '';
    document.getElementById('personnelSaveMessage').textContent = '';
    return;
  }
  const removeButton = event.target.closest('[data-remove-apparatus]');
  if (removeButton) {
    const index = Number(removeButton.dataset.removeApparatus);
    const item = data.maintenance[index];
    if (!item) return;
    const ok = window.confirm(`Remove ${item.name} from the apparatus list?`);
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

workspace.addEventListener('change', event => {
  if (event.target.id === 'permissionPersonIndex') {
    permissionEditIndex = Number(event.target.value || 0);
    renderAdmin();
  }
});

workspace.addEventListener('submit', event => {
  if (event.target.id === 'builderPageForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const pageId = String(formData.get('builderPageId') || '');
    const page = data.builder.sections.find(section => section.id === pageId);
    if (!page) return;
    page.title = String(formData.get('builderPageTitle') || page.title).trim() || page.title;
    page.icon = String(formData.get('builderPageIcon') || page.icon).trim().slice(0, 3).toUpperCase() || page.icon;
    page.parentId = String(formData.get('builderPageParent') || '');
    saveData();
    saveSharedBuilderConfig().then(() => {
      renderAdmin();
      renderNav();
    });
    renderAdmin();
    renderNav();
    return;
  }
  if (event.target.id === 'builderAddPageForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const titleText = String(formData.get('newBuilderPageTitle') || '').trim();
    let id = slugifyPageId(formData.get('newBuilderPageId') || titleText);
    const icon = String(formData.get('newBuilderPageIcon') || id.slice(0, 2) || 'PG').trim().slice(0, 3).toUpperCase();
    const parentId = String(formData.get('newBuilderPageParent') || '');
    if (!titleText) {
      builderMessage = 'Enter a page name first.';
      renderAdmin();
      return;
    }
    if (!id) id = slugifyPageId(titleText);
    if (data.builder.sections.some(section => section.id === id)) {
      builderMessage = 'That page already exists.';
      renderAdmin();
      return;
    }
    data.builder.sections.splice(Math.max(data.builder.sections.length - 1, 0), 0, { id, title: titleText, icon, parentId });
    data.builder.schemas[id] = [];
    data[id] = data[id] || [];
    grantPageToAdmins(id);
    builderPageId = id;
    saveData();
    saveSharedBuilderConfig().then(() => {
      renderAdmin();
      renderNav();
    });
    renderAdmin();
    renderNav();
    return;
  }
  if (event.target.id === 'builderFieldForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const key = String(formData.get('builderFieldKey') || '').trim().replace(/[^a-zA-Z0-9]/g, '');
    const label = String(formData.get('builderFieldLabel') || '').trim();
    const type = String(formData.get('builderFieldType') || 'text');
    const options = String(formData.get('builderFieldOptions') || '').split(',').map(item => item.trim()).filter(Boolean);
    if (!key || !label) return;
    data.builder.schemas[builderPageId] = data.builder.schemas[builderPageId] || [];
    data.builder.schemas[builderPageId].push([key, label, type, type === 'select' ? options : []]);
    saveData();
    saveSharedBuilderConfig().then(renderAdmin);
    renderAdmin();
    return;
  }
  if (event.target.id === 'builderFieldsEditForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const fields = data.builder.schemas[builderPageId] || [];
    data.builder.schemas[builderPageId] = fields.map((field, index) => {
      const key = String(formData.get(`fieldKey_${index}`) || field[0] || '').trim().replace(/[^a-zA-Z0-9]/g, '');
      const label = String(formData.get(`fieldLabel_${index}`) || field[1] || key).trim();
      const type = String(formData.get(`fieldType_${index}`) || field[2] || 'text');
      const options = String(formData.get(`fieldOptions_${index}`) || '').split(',').map(item => item.trim()).filter(Boolean);
      return [key, label, type, type === 'select' ? options : []];
    }).filter(field => field[0] && field[1]);
    saveData();
    saveSharedBuilderConfig().then(renderAdmin);
    renderAdmin();
    return;
  }
  if (event.target.id === 'permissionsForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const member = data.personnel[permissionEditIndex];
    const message = document.getElementById('permissionsSaveMessage');
    if (!member) return;
    const pageSettings = {};
    const pagePermissions = new Set(['dashboard']);
    appSections().forEach(section => {
      const values = formData.getAll(`pageSetting_${section.id}`);
      const settings = new Set(values);
      if (section.id === 'dashboard') settings.add('view');
      if (member.adminAccess === 'Yes' && section.id === 'admin') settings.add('view');
      pageSettings[section.id] = [...settings];
      if (settings.has('view')) pagePermissions.add(section.id);
    });
    if (member.adminAccess === 'Yes') pagePermissions.add('admin');
    else pagePermissions.delete('admin');
    member.pageSettings = pageSettings;
    member.pagePermissions = [...pagePermissions];
    saveData();
    if (message) message.textContent = 'Page permissions saved.';
    renderNav();
    return;
  }
  if (event.target.id === 'personnelAdminForm') {
    event.preventDefault();
    const formData = new FormData(event.target);
    const indexValue = formData.get('personnelEditIndex');
    const message = document.getElementById('personnelSaveMessage');
    const existingRecord = indexValue === '' ? null : data.personnel[Number(indexValue)];
    const record = personnelRecordFromForm(formData, existingRecord || {});
    const employeeId = record.employeeId;
    const email = record.email;
    const password = record.password;

    if (!record.firstName || !record.lastName || !email) {
      message.textContent = 'First name, last name, and email are required.';
      return;
    }
    if (!employeeId) {
      message.textContent = 'Employee ID / Login ID is required.';
      return;
    }
    if (!password) {
      message.textContent = 'Password is required for new personnel.';
      return;
    }
    const existingIndex = data.personnel.findIndex((member, index) => member.employeeId === employeeId && String(index) !== String(indexValue));
    if (existingIndex >= 0) {
      message.textContent = `${employeeId} is already assigned to another personnel record.`;
      return;
    }
    const existingEmailIndex = data.personnel.findIndex((member, index) => String(member.email || '').toLowerCase() === email && String(index) !== String(indexValue));
    if (existingEmailIndex >= 0) {
      message.textContent = `${email} is already assigned to another personnel record.`;
      return;
    }
    const priorEmail = existingRecord?.email || '';
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
    setTimeout(() => {
      const savedMessage = document.getElementById('personnelSaveMessage');
      if (savedMessage) savedMessage.textContent = 'Personnel saved.';
    }, 0);
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
rmsHomeBtn.addEventListener('click', () => setSection('hub'));
signOutBtn.addEventListener('click', () => signOut());
['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(eventName => {
  window.addEventListener(eventName, resetInactivityTimer, { passive: true });
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
  if (!['save', 'delete'].includes(event.submitter?.value)) return;
  event.preventDefault();
  if (event.submitter?.value === 'delete') {
    if (editing?.index === null || editing?.index === undefined || editing?.sectionId === 'maintenance') return;
    const ok = window.confirm('Delete this record?');
    if (!ok) return;
    data[editing.sectionId].splice(editing.index, 1);
    saveData();
    modal.close();
    render();
    return;
  }
  const formData = new FormData(form);
  if (editing.sectionId === 'maintenance') saveMaintenanceRecord(formData);
  else saveGenericRecord(formData);
  saveData();
  modal.close();
  render();
});

async function initializeRms() {
  render();
  await loadSharedBuilderConfig();
  await loadSharedRmsData();
}

initializeRms();
