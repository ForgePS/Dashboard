const radarImage = document.getElementById('radarImage');
const updatedText = document.getElementById('updatedText');
const RADAR_URL = 'https://radar.weather.gov/ridge/standard/KNQA_loop.gif';
const REFRESH_MS = 120000;

function refreshRadar() {
  if (!radarImage) return;
  radarImage.src = `${RADAR_URL}?ts=${Date.now()}`;
  if (updatedText) {
    updatedText.textContent = `Updated ${new Date().toLocaleString()}`;
  }
}

refreshRadar();
setInterval(refreshRadar, REFRESH_MS);
