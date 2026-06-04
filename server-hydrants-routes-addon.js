// ======================================================
// HYDRANT / WATER SUPPLY STATUS ROUTES
// Paste this ABOVE app.listen(...)
// Requires: express app, path, fs
// ======================================================

const HYDRANT_CSV_FILE =
  process.env.HYDRANT_CSV_FILE ||
  path.join(__dirname, 'Hydrant Locations.csv');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function normalizeHydrantStatus(value) {
  const s = String(value || '').trim().toLowerCase();

  if (s === 'out of service' || s === 'oos') return 'OOS';
  if (s === 'low flow' || s === 'low-flow') return 'LOW FLOW';
  if (s === 'under repair' || s === 'repair') return 'UNDER REPAIR';
  if (s === 'testing' || s === 'test') return 'TESTING';
  if (s === 'private') return 'PRIVATE';
  if (s === 'available' || s === 'in service' || s === 'active') return 'AVAILABLE';

  return value ? String(value).toUpperCase() : 'AVAILABLE';
}

function normalizeHydrantProvider(value) {
  const p = String(value || '').trim().toLowerCase();

  if (p.includes('horn lake water association')) return 'Horn Lake Water Association';
  if (p.includes('city of horn lake') || p === 'horn lake water' || p === 'horn lake') return 'Horn Lake Water';
  if (p.includes('days') || p.includes('day')) return 'Days Water';
  if (p.includes('walls') || p.includes('wall')) return 'Walls Water Association';

  return value ? String(value).trim() : 'Unknown';
}

function guessProviderFromLocation(row) {
  const text = `${row.location || ''} ${row.location_name || ''} ${row.description || ''}`.toLowerCase();

  if (text.includes('walls')) return 'Walls Water Association';
  if (text.includes('day') || text.includes('days')) return 'Days Water';

  return 'Horn Lake Water';
}



  const raw = fs.readFileSync(HYDRANT_CSV_FILE, 'utf8');
  const lines = raw.split(/\r?\n/).filter(line => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });

    const locationId =
      row.location_id ||
      row.hydrant_id ||
      row.id ||
      `H-${index + 1}`;

    const locationName =
      row.location_name ||
      row.location ||
      row.description ||
      '';

    const provider =
      normalizeHydrantProvider(
        row.provider || row.water_provider || ''
      );

    const providerFinal =
      provider === 'Unknown'
        ? guessProviderFromLocation({ ...row, location: locationName })
        : provider;

    const status =
      normalizeHydrantStatus(row.status || row.hydrant_status || '');

    return {
      location_id: locationId,
      hydrant_id: row.hydrant_id || locationId,
      location: row.location || locationName,
      location_name: locationName,
      description: row.description || '',
      lat: row.lat || row.latitude || '',
      lon: row.lon || row.lng || row.longitude || '',
      provider: providerFinal,
      status,
      flow_gpm: row.flow_gpm || row.gpm || '',
      static_psi: row.static_psi || row.psi || '',
      last_checked: row.last_checked || row.last_inspection || row.inspection_date || '',
      issue: row.issue || '',
      alternate_supply: row.alternate_supply || row.alternate || '',
      notes: row.notes || ''
    };
  });
}

function buildHydrantStatusDashboard() {
  const hydrants = loadHydrantStatusRows();

  const summary = {
    total: hydrants.length,
    available: 0,
    oos: 0,
    lowFlow: 0,
    underRepair: 0,
    testing: 0,
    private: 0,
    unknown: 0
  };

  const byProvider = {
    'Horn Lake Water': { total: 0, available: 0, oos: 0, lowFlow: 0, underRepair: 0, testing: 0 },
    'Horn Lake Water Association': { total: 0, available: 0, oos: 0, lowFlow: 0, underRepair: 0, testing: 0 },
    'Days Water': { total: 0, available: 0, oos: 0, lowFlow: 0, underRepair: 0, testing: 0 },
    'Walls Water Association': { total: 0, available: 0, oos: 0, lowFlow: 0, underRepair: 0, testing: 0 }
  };

  for (const h of hydrants) {
    const provider = h.provider || 'Unknown';

    if (!byProvider[provider]) {
      byProvider[provider] = { total: 0, available: 0, oos: 0, lowFlow: 0, underRepair: 0, testing: 0 };
    }

    byProvider[provider].total++;

    const s = String(h.status || '').toUpperCase();

    if (s === 'OOS') {
      summary.oos++;
      byProvider[provider].oos++;
    } else if (s === 'LOW FLOW') {
      summary.lowFlow++;
      byProvider[provider].lowFlow++;
    } else if (s === 'UNDER REPAIR') {
      summary.underRepair++;
      byProvider[provider].underRepair++;
    } else if (s === 'TESTING') {
      summary.testing++;
      byProvider[provider].testing++;
    } else if (s === 'PRIVATE') {
      summary.private++;
    } else if (s === 'AVAILABLE') {
      summary.available++;
      byProvider[provider].available++;
    } else {
      summary.unknown++;
    }
  }

  const critical = hydrants
    .filter(h => ['OOS', 'LOW FLOW', 'UNDER REPAIR', 'TESTING'].includes(String(h.status || '').toUpperCase()))
    .slice(0, 30);

  const notes = hydrants
    .filter(h => h.issue || h.alternate_supply || h.notes)
    .slice(0, 20);

  const recent = [...hydrants]
    .filter(h => h.last_checked)
    .sort((a, b) => new Date(b.last_checked) - new Date(a.last_checked))
    .slice(0, 20);

  return {
    ok: true,
    updated: new Date().toISOString(),
    file: HYDRANT_CSV_FILE,
    summary,
    byProvider,
    critical,
    notes,
    recent,
    hydrants
  };
}

app.get('/hydrants', (req, res) => {
  res.sendFile(path.join(__dirname, 'hydrants.html'));
});

app.get('/api/hydrants-status', (req, res) => {
  try {
    res.json(buildHydrantStatusDashboard());
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});
