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

function statusClass(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('in service')) return 'status-pill status-in';
  if (text.includes('reserve')) return 'status-pill status-reserve';
  if (text.includes('out') || text.includes('oos') || text.includes('repair')) return 'status-pill status-oos';
  return value ? 'status-pill' : '';
}

function cellValue(value, header) {
  const clean = escapeHtml(value || '');
  if (String(header || '').toLowerCase() === 'status' && clean) {
    return `<span class="${statusClass(clean)}">${clean}</span>`;
  }
  return clean || '--';
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

function renderTable(targetId, section) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const headers = section?.headers || [];
  const rows = section?.rows || [];

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
            ${headers.map((header, index) => `<td data-label="${escapeHtml(header)}">${cellValue(row[index], header)}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderDocument(data) {
  const sections = data.sections || {};

  setText('statusText', data.stale ? 'Showing cached data' : 'Live data connected');
  setText('updatedText', `Last Updated ${data.updatedLabel || '--'}`);
  setText('documentDate', formatDocumentDate(data.updated || data.updatedAt) || data.updatedLabel || 'Live document');
  setText('unitStatusTitle', sections.unitStatus?.title || 'Unit Status');
  setText('oosTitle', sections.oosEquipment?.title || 'OOS Equipment');

  renderTable('unitStatusTable', sections.unitStatus);
  renderTable('oosTable', sections.oosEquipment);
}

async function refreshDocument(force = false) {
  try {
    const response = await fetch(`/api/live-document${force ? '?force=true' : ''}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Document HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Document response failed');

    renderDocument(data);
  } catch (err) {
    setText('statusText', `Live document update failed: ${err.message}`);
  }
}

refreshDocument(true);
setInterval(refreshDocument, 30000);
