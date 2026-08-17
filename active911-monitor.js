(function initActive911Monitor(global) {
  if (new URLSearchParams(global.location.search).get('monitor') === '0') {
    return;
  }

  const config = global.ACTIVE911_CONFIG || { takeoverMinutes: 5, takeoverMs: 5 * 60 * 1000 };
  const TAKEOVER_MINUTES = config.takeoverMinutes;
  const TAKEOVER_MS = config.takeoverMs;
  const POLL_MS = 5000;
  const LAST_TAKEOVER_KEY = 'active911-monitor-last-takeover-id';
  let takeoverInProgress = false;
  let badge = null;

  function pageParams() {
    return new URLSearchParams(global.location.search);
  }

  function resolveStation() {
    const params = pageParams();
    const fromQuery = String(params.get('station') || '').trim();
    if (['1', '2', '3'].includes(fromQuery)) return fromQuery;

    const path = global.location.pathname.toLowerCase();
    const match = path.match(/station([123])/);
    return match ? match[1] : '1';
  }

  function applyBadgeLayout(el) {
    el.style.setProperty('top', 'auto', 'important');
    el.style.setProperty('left', 'auto', 'important');
    el.style.setProperty('right', '18px', 'important');
    el.style.setProperty('bottom', '18px', 'important');
    el.style.setProperty('padding', '6px 12px', 'important');
    el.style.setProperty('font-size', '12px', 'important');
    el.style.setProperty('border-width', '1px', 'important');
    el.style.setProperty('letter-spacing', '0.5px', 'important');
    el.style.setProperty('box-shadow', '0 6px 18px rgba(0, 0, 0, 0.4)', 'important');
  }

  function ensureBadge() {
    if (badge) {
      applyBadgeLayout(badge);
      return badge;
    }

    badge = global.document.getElementById('active911StatusBadge');
    if (!badge) {
      badge = global.document.createElement('div');
      badge.id = 'active911StatusBadge';
      badge.className = 'active911-status-badge is-connecting';
      badge.textContent = 'Active911 connecting...';
      global.document.body.appendChild(badge);
    }

    applyBadgeLayout(badge);
    return badge;
  }

  function setBadgeState(state, text) {
    const el = ensureBadge();
    el.removeAttribute('hidden');
    el.style.display = 'block';
    el.textContent = text;
    el.classList.remove('is-connecting', 'is-armed', 'is-warning', 'is-alert');
    if (state) el.classList.add(state);
  }

  function armedText(station) {
    return `Active911 enabled · Station ${station}`;
  }

  function alertPath(station) {
    const returnTo = encodeURIComponent(`${global.location.pathname}${global.location.search}`);
    const duration = encodeURIComponent(String(TAKEOVER_MINUTES));
    return `/station${station}/alert?returnTo=${returnTo}&durationMinutes=${duration}&station=${station}`;
  }

  function alreadyHandledAlert(alertId) {
    try {
      return global.sessionStorage.getItem(LAST_TAKEOVER_KEY) === String(alertId);
    } catch (err) {
      return false;
    }
  }

  function markHandledAlert(alertId) {
    try {
      global.sessionStorage.setItem(LAST_TAKEOVER_KEY, String(alertId));
    } catch (err) {
      // Ignore storage failures on locked-down kiosk browsers.
    }
  }

  function isEligibleActiveAlert(latest) {
    if (!latest?.id || !latest?.sent) return false;
    const sentAt = new Date(latest.sent).getTime();
    if (!Number.isFinite(sentAt)) return false;
    const age = Date.now() - sentAt;
    if (age < -2 * 60 * 1000) return false;
    return age <= TAKEOVER_MS;
  }

  async function checkForActiveCall() {
    if (takeoverInProgress) return;

    const station = resolveStation();

    try {
      const response = await fetch(`/api/active911-takeover?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setBadgeState('is-warning', 'Active911 monitor warning');
        return;
      }

      const latest = Array.isArray(data.recent) ? data.recent[0] : null;
      if (!isEligibleActiveAlert(latest)) {
        setBadgeState('is-armed', armedText(station));
        return;
      }

      if (alreadyHandledAlert(latest.id)) {
        setBadgeState('is-armed', armedText(station));
        return;
      }

      markHandledAlert(latest.id);
      takeoverInProgress = true;
      setBadgeState('is-alert', 'Active911 alert — taking over');
      global.location.replace(alertPath(station));
    } catch (err) {
      setBadgeState('is-warning', 'Active911 monitor warning');
    }
  }

  ensureBadge();
  checkForActiveCall();
  global.setInterval(checkForActiveCall, POLL_MS);

  global.Active911Monitor = {
    checkForActiveCall,
    resolveStation
  };
})(window);
