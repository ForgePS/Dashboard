const numberFormat = new Intl.NumberFormat('en-US');

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function eventMonthMatches(dateText) {
  if (!dateText) return false;

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function eventCard(event) {
  const meta = [event.location, event.owner].filter((value) => value && value !== '--').join(' | ');

  return `
    <article class="event-card">
      <div class="event-card-top">
        <div class="event-date">${event.dateLabel || '--'} ${event.time || ''}</div>
        <div class="event-status">${event.status || 'Scheduled'}</div>
      </div>
      <h3>${event.title || 'Untitled Event'}</h3>
      ${meta ? `<p>${meta}</p>` : ''}
      ${event.notes ? `<p>${event.notes}</p>` : ''}
    </article>
  `;
}

function renderHero(event) {
  const container = document.getElementById('heroEvent');
  if (!container) return;

  if (!event) {
    container.innerHTML = `
      <div class="event-tag">Ready</div>
      <h2>No Events Listed</h2>
      <div class="hero-meta"><span>Waiting on the events feed</span></div>
    `;
    return;
  }

  const meta = [
    event.dateLabel && event.dateLabel !== '--' ? event.dateLabel : '',
    event.time && event.time !== '--' ? event.time : '',
    event.location && event.location !== '--' ? event.location : ''
  ].filter(Boolean);

  container.innerHTML = `
    <div class="event-tag">${event.category || 'Event'}</div>
    <h2>${event.title || 'Untitled Event'}</h2>
    ${meta.length ? `<div class="hero-meta">${meta.map((item) => `<span>${item}</span>`).join('')}</div>` : ''}
    ${event.notes ? `<div class="hero-notes">${event.notes}</div>` : ''}
  `;
}

function renderEvents(data) {
  const events = data.events || [];
  const list = document.getElementById('eventList');

  setText('statusText', data.connected ? 'Live events feed connected' : 'Events page ready');
  setText('updatedText', `Last Updated ${data.updatedLabel || '--'}`);
  setText('upcomingCount', numberFormat.format(events.length));
  setText('monthCount', numberFormat.format(events.filter((event) => eventMonthMatches(event.date)).length));
  setText('nextEventDate', events[0]?.dateLabel || '--');

  renderHero(events[0]);

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
