function text(value, fallback = '--') {
  const clean = String(value || '').trim();
  return clean || fallback;
}

function displayPosition(value) {
  const clean = text(value);
  return clean.toUpperCase() === 'EMT DRIVER' ? 'EMT/Driver' : clean;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function seatMarkup(person, className = '') {
  const isPlaceholder = person?.isPlaceholder;
  const isVacant = person?.isVacant;
  const name = isPlaceholder ? 'Available' : isVacant ? 'Vacant' : text(person?.name);
  const position = isPlaceholder ? '1/2 Shift / Trade' : displayPosition(person?.position);
  const classes = ['seat', className, isVacant ? 'vacant' : '', isPlaceholder ? 'trade' : '']
    .filter(Boolean)
    .join(' ');

  return `
    <div class="${classes}">
      <div class="seat-name">${name}</div>
      <div class="seat-position">${position}</div>
    </div>
  `;
}

function apparatusMarkup(apparatus, unit = false) {
  if (!apparatus) return '<div class="station-card empty"></div>';

  const personnel = apparatus.personnel || [];
  const support = (apparatus.supportRows || []).filter((person) => !person.isPlaceholder);

  return `
    <section class="apparatus">
      <div class="apparatus-head">
        <h3>${text(apparatus.name)}</h3>
        <span class="shift">${text(apparatus.shift, '')}</span>
      </div>
      <div class="seat-grid">
        ${personnel.map((person) => seatMarkup(person)).join('')}
      </div>
      ${support.length ? `
        <div class="support-title">1/2 Shifts & Trades</div>
        <div class="support-grid">
          ${support.map((person) => seatMarkup(person, 'trade')).join('')}
        </div>
      ` : ''}
    </section>
  `;
}

function rowTitle(row) {
  if (row.station !== 'Battalion') return text(row.station);

  const shift = row.left?.[0]?.shift || '';
  return shift ? shift.replace(/\s*\|\s*/g, ' ') : 'Battalion';
}

function stationMarkup(row) {
  const hideLeftShift = row.station === 'Battalion';

  return `
    <section class="station-row">
      <div class="station-card">
        <div class="station-title">
          <h2>${rowTitle(row)}</h2>
        </div>
        ${(row.left || []).map((apparatus) => apparatusMarkup({
          ...apparatus,
          shift: hideLeftShift ? '' : apparatus.shift
        })).join('')}
      </div>
      <div class="unit-card ${row.right ? '' : 'empty'}">
        ${row.right ? `
          ${apparatusMarkup(row.right, true)}
        ` : ''}
      </div>
    </section>
  `;
}

function renderRoster(data) {
  const grid = document.getElementById('rosterGrid');
  if (!grid) return;

  setText('rosterDate', data.dateLabel || 'Daily roster');
  setText('updatedText', `Last Updated ${data.updatedLabel || '--'}`);
  setText('statusText', data.stale ? 'Showing cached Slate roster' : 'Live Slate roster connected');

  grid.innerHTML = (data.rows || []).map(stationMarkup).join('');
}

async function refreshRoster(force = false) {
  try {
    const response = await fetch(`/api/daily-roster${force ? '?force=true' : ''}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Roster HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Roster response failed');

    renderRoster(data);
  } catch (err) {
    const grid = document.getElementById('rosterGrid');
    setText('statusText', 'Roster update failed');
    if (grid) {
      grid.innerHTML = `<div class="error">${err.message}</div>`;
    }
  }
}

refreshRoster(true);
setInterval(refreshRoster, 30000);
