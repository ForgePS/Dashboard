const numberFormat = new Intl.NumberFormat('en-US');

function displayCategory(value) {
  const clean = String(value || '').trim();
  return clean.toUpperCase() === 'DEPARTMENT EVENT' ? '' : clean;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function eventMonthMatches(event) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return event.monthKey === currentMonth;
}

function eventCard(event) {
  const category = displayCategory(event.category);
  const details = [
    ['Date', event.dateLabel],
    ['Time', event.time],
    ['Location', event.location],
    ['Contact', event.owner]
  ].filter(([, value]) => value && value !== '--');

  return `
    <article class="event-card">
      <div class="event-card-top">
        <div class="event-date">${category}</div>
        <div class="event-status">${event.status || 'Scheduled'}</div>
      </div>
      <h3>${event.title || 'Untitled Event'}</h3>
      <div class="event-details">
        ${details.map(([label, value]) => `
          <div class="event-line"><span>${label}</span><strong>${value}</strong></div>
        `).join('')}
        ${event.notes ? `<div class="event-line notes"><span>Notes</span><strong>${event.notes}</strong></div>` : ''}
      </div>
    </article>
  `;
}

function renderEvents(data) {
  const events = data.events || [];
  const list = document.getElementById('eventList');

  setText('statusText', data.connected ? 'Live events feed connected' : 'Events page ready');
  setText('updatedText', `Last Updated ${data.updatedLabel || '--'}`);
  setText('upcomingCount', numberFormat.format(events.length));
  setText('monthCount', numberFormat.format(events.filter(eventMonthMatches).length));
  setText('nextEventDate', events[0]?.dateLabel || '--');

  if (!list) return;
  list.innerHTML = events.length
    ? events.slice(0, 9).map(eventCard).join('')
    : '<article class="event-card"><h3>No Events Listed</h3><p>Connect a Google Sheet feed to show live events.</p></article>';
}

async function refreshEvents() {
  try {
    const response = await fetch('/api/events?ts=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Events HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Events response failed');

    renderEvents(data);
  } catch (err) {
    setText('statusText', `Events update failed: ${err.message}`);
  }
}

refreshEvents();
setInterval(refreshEvents, 30000);
