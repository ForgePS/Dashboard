function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDocumentDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function cellValue(value) {
  return escapeHtml(value || '') || '--';
}

function renderSection(section) {
  const target = document.getElementById('sectionTable');
  if (!target) return;

  const headers = section?.headers || [];
  const rows = section?.rows || [];
  const layout = window.DISPLAY_CONFIG.layout || {};
  const twoColumnAfter = Number(layout.twoColumnAfter || 0);

  document.body.classList.toggle(
    'two-column-section',
    twoColumnAfter > 0 && rows.length > twoColumnAfter
  );
  document.body.dataset.rowCount = String(rows.length);
  document.body.classList.toggle('packed-section', rows.length >= 40);

  setText('sectionTitle', section?.title || window.DISPLAY_CONFIG.title);

  if (!rows.length) {
    target.innerHTML = '<div class="empty">No entries</div>';
    return;
  }

  target.innerHTML = `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            ${headers.map((header, index) => `<td data-label="${escapeHtml(header)}">${cellValue(row[index])}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderDisplay(data) {
  setText('statusText', data.stale ? 'Showing cached data' : 'Live data connected');
  setText('updatedText', `Last Updated ${data.updatedLabel || '--'}`);
  setText('documentDate', formatDocumentDate(data.updated) || data.updatedLabel || window.DISPLAY_CONFIG.title);
  renderSection(data.section);
}

async function refreshDisplay(force = false) {
  try {
    const response = await fetch(`${window.DISPLAY_CONFIG.apiPath}${force ? '?force=true' : ''}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Display HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Display response failed');

    renderDisplay(data);
  } catch (err) {
    setText('statusText', `Update failed: ${err.message}`);
  }
}

refreshDisplay(true);
setInterval(refreshDisplay, 30000);
