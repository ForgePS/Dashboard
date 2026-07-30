function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderItems(items) {
  const list = document.getElementById('itemList');
  const empty = document.getElementById('emptyState');
  if (!list || !empty) return;

  const active = Array.isArray(items) ? items.slice(0, 4) : [];

  list.classList.toggle('single', active.length === 1);
  list.classList.toggle('dense', active.length >= 3);

  if (!active.length) {
    list.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  list.innerHTML = active.map((item) => `
    <article class="congrats-item">
      <h2 class="congrats-name">${escapeHtml(item.name || 'Honoree')}</h2>
      ${item.info ? `<p class="congrats-info">${escapeHtml(item.info)}</p>` : ''}
    </article>
  `).join('');
}

async function refreshCongratulations(force = false) {
  try {
    const params = new URLSearchParams({ ts: String(Date.now()) });
    if (force) params.set('force', 'true');
    const response = await fetch(`/api/congratulations?${params}`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Congratulations HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Congratulations response failed');

    const wallpaper = document.getElementById('wallpaper');
    if (wallpaper && data.wallpaper && wallpaper.getAttribute('src') !== data.wallpaper) {
      wallpaper.src = data.wallpaper;
    }

    renderItems(data.items || []);
  } catch (err) {
    const empty = document.getElementById('emptyState');
    if (empty) {
      empty.hidden = false;
      empty.textContent = `Update failed: ${err.message}`;
    }
  }
}

refreshCongratulations(true);
setInterval(() => refreshCongratulations(false), 30000);
