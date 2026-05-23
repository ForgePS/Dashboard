const fields = {
  statusText: document.getElementById('statusText'),
  updatedText: document.getElementById('updatedText'),
  currentTemp: document.getElementById('currentTemp'),
  highLow: document.getElementById('highLow'),
  conditionText: document.getElementById('conditionText'),
  feelsLike: document.getElementById('feelsLike'),
  sunrise: document.getElementById('sunrise'),
  sunset: document.getElementById('sunset'),
  windSpeed: document.getElementById('windSpeed'),
  windGust: document.getElementById('windGust'),
  windDirection: document.getElementById('windDirection'),
  humidity: document.getElementById('humidity'),
  pressure: document.getElementById('pressure'),
  cloudCover: document.getElementById('cloudCover'),
  precipCurrent: document.getElementById('precipCurrent'),
  precipForecast: document.getElementById('precipForecast'),
  precipChance: document.getElementById('precipChance'),
  uvIndex: document.getElementById('uvIndex'),
  forecastGrid: document.getElementById('forecastGrid')
};

function setText(key, value) {
  if (fields[key]) fields[key].textContent = value;
}

function dash(value) {
  return value === null || value === undefined || value === '' ? '--' : value;
}

function degree(value) {
  return value === null || value === undefined ? '--°' : `${Math.round(Number(value))}°`;
}

function inch(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(2)} in` : '-- in';
}

function formatTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatForecastDay(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Forecast';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function renderForecast(forecast) {
  const rows = Array.isArray(forecast) ? forecast : [];

  fields.forecastGrid.innerHTML = rows.map((day) => `
    <article class="forecast-card">
      <h2>${formatForecastDay(day.date)}</h2>
      <div class="forecast-condition">${dash(day.condition)}</div>
      <span>High / Low</span><strong>${degree(day.high)} / ${degree(day.low)}</strong>
      <span>Rain</span><strong>${inch(day.precipitationIn)}</strong>
      <span>Chance</span><strong>${dash(day.precipitationProbability)}%</strong>
      <span>Wind</span><strong>${dash(day.windMph)} mph</strong>
    </article>
  `).join('');
}

function renderWeather(data) {
  const current = data.current || {};
  setText('statusText', 'Live weather connected');
  setText('updatedText', `Last Updated ${data.updatedLabel || '--'}`);
  setText('currentTemp', degree(current.temp ?? data.temp));
  setText('highLow', `${degree(current.high)} / ${degree(current.low)}`);
  setText('conditionText', current.condition || data.condition || 'Current Weather');
  setText('feelsLike', `Feels like ${degree(current.feelsLike)}`);
  setText('sunrise', formatTime(current.sunrise));
  setText('sunset', formatTime(current.sunset));
  setText('windSpeed', `${dash(current.windMph ?? data.windMph)} mph`);
  setText('windGust', `${dash(current.windGustMph)} mph`);
  setText('windDirection', current.windDir || data.windDir || '--');
  setText('humidity', `${dash(current.humidity)}%`);
  setText('pressure', current.pressure === null || current.pressure === undefined ? '-- hPa' : `${Math.round(current.pressure)} hPa`);
  setText('cloudCover', `${dash(current.cloudCover)}%`);
  setText('precipCurrent', inch(current.precipitationIn));
  setText('precipForecast', inch(data.forecast?.[0]?.precipitationIn));
  setText('precipChance', `${dash(data.forecast?.[0]?.precipitationProbability)}%`);
  setText('uvIndex', current.uvIndex === null || current.uvIndex === undefined ? '--' : String(Math.round(Number(current.uvIndex))));
  renderForecast(data.forecast);
}

async function refreshWeather() {
  try {
    const response = await fetch(`/api/weather?ts=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || `Weather HTTP ${response.status}`);
    renderWeather(data);
  } catch (err) {
    setText('statusText', 'Weather update failed');
    setText('conditionText', 'Weather unavailable');
  }
}

refreshWeather();
setInterval(refreshWeather, 60000);
