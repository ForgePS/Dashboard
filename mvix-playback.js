function pageParams() {
  return new URLSearchParams(window.location.search);
}

function resolveStation() {
  const params = pageParams();
  const fromQuery = String(params.get('station') || '').trim();
  if (['1', '2', '3'].includes(fromQuery)) return fromQuery;

  const path = window.location.pathname.toLowerCase();
  const match = path.match(/station([123])/);
  return match ? match[1] : '1';
}

function signageUrl() {
  const station = resolveStation();
  const params = pageParams();
  const explicit = params.get('signageUrl');
  if (explicit) return explicit;

  const url = new URL(`/station${station}/signage`, window.location.origin);
  url.searchParams.set('station', station);
  url.searchParams.set('monitor', '0');
  return url.toString();
}

function loadPlaylist() {
  const frame = document.getElementById('mvixFrame');
  if (frame) frame.src = signageUrl();
}

loadPlaylist();
