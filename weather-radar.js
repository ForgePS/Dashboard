const radarFrame = document.getElementById('radarFrame');
const radarFallback = document.getElementById('radarFallback');
const updatedText = document.getElementById('updatedText');
const radarShell = document.getElementById('radarShell');
const FALLBACK_RADAR_URL = 'https://radar.weather.gov/ridge/standard/KNQA_loop.gif';
const REFRESH_MS = 300000;
const params = new URLSearchParams(window.location.search);

function isSignageMode() {
  const signage = params.get('signage');
  const mode = params.get('mode');
  return signage === '1' || mode === 'signage' || params.has('mvix');
}

function windyRadarUrl() {
  const signageMode = isSignageMode();
  const params = new URLSearchParams({
    lat: '34.9554',
    lon: '-90.0348',
    detailLat: '34.9554',
    detailLon: '-90.0348',
    width: '1920',
    height: '1080',
    zoom: '8',
    level: 'surface',
    overlay: 'radar',
    product: 'radar',
    menu: signageMode ? '' : 'true',
    message: '',
    marker: '',
    calendar: 'now',
    pressure: '',
    type: 'map',
    location: 'coordinates',
    detail: 'false',
    metricWind: 'mph',
    metricTemp: 'F'
  });
  return `https://embed.windy.com/embed2.html?${params.toString()}`;
}

function showFallback() {
  if (!radarFallback || !radarFrame) return;
  radarFallback.src = `${FALLBACK_RADAR_URL}?ts=${Date.now()}`;
  radarFallback.classList.remove('radar-fallback-hidden');
  radarFrame.classList.add('radar-fallback-hidden');
  if (updatedText) {
    updatedText.textContent = `Windy unavailable, NOAA fallback ${new Date().toLocaleString()}`;
  }
}

function refreshRadar() {
  if (!radarFrame) return;
  radarFrame.src = windyRadarUrl();
  radarFrame.classList.remove('radar-fallback-hidden');
  if (radarFallback) {
    radarFallback.classList.add('radar-fallback-hidden');
  }
  if (updatedText) {
    updatedText.textContent = `Windy radar updated ${new Date().toLocaleString()}`;
  }
}

refreshRadar();
setInterval(refreshRadar, REFRESH_MS);

if (radarFrame) {
  radarFrame.addEventListener('error', showFallback);
}

if (radarShell && isSignageMode()) {
  radarShell.classList.add('signage-mode');
}
