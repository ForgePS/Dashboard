function setText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value;
}

function degree(value) {
  return value === null || value === undefined ? '--°' : `${Math.round(Number(value))}°`;
}

function inch(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(2)} in` : '-- in';
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function forecastDayName(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Forecast';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function setWeatherBackground(condition) {
  const value = String(condition || '').toLowerCase();
  let image = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80';

  if (value.includes('clear')) {
    image = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80';
  } else if (value.includes('cloud')) {
    image = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80';
  } else if (value.includes('fog')) {
    image = 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=80';
  } else if (value.includes('rain') || value.includes('drizzle') || value.includes('shower')) {
    image = 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80';
  } else if (value.includes('snow')) {
    image = 'https://images.unsplash.com/photo-1511131341194-24e2eeeebb09?auto=format&fit=crop&w=1920&q=80';
  } else if (value.includes('storm')) {
    image = 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80';
  }

  document.body.style.backgroundImage =
    `linear-gradient(rgba(0,0,0,.60), rgba(0,0,0,.84)), url('${image}')`;
}

function renderForecast(days) {
  const forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = '';

  (days || []).slice(0, 3).forEach((day) => {
    forecastDiv.innerHTML += `
      <div class="forecast-card">
        <h2>${forecastDayName(day.date)}</h2>
        <div class="forecast-temp">${degree(day.high)} / ${degree(day.low)}</div>
        <div class="forecast-detail">${day.condition || '--'}</div>
        <div class="forecast-detail">Rain: ${inch(day.precipitationIn)}</div>
        <div class="forecast-detail">Chance: ${day.precipitationProbability ?? '--'}%</div>
        <div class="forecast-detail">Wind: ${day.windMph ?? '--'} mph</div>
        <div class="forecast-detail">UV Max: ${day.uvIndex ?? '--'}</div>
      </div>
    `;
  });
}

function renderWeather(data) {
  const current = data.current || {};
  setWeatherBackground(current.condition || data.condition);
  setText('temperature', degree(current.temp ?? data.temp));
  setText('condition', current.condition || data.condition || 'Current Weather');
  setText('feelsLike', `Feels like ${degree(current.feelsLike)}`);
  setText('highLow', `${degree(current.high)} / ${degree(current.low)}`);
  setText('sunrise', formatTime(current.sunrise));
  setText('sunset', formatTime(current.sunset));
  setText('windSpeed', `${current.windMph ?? data.windMph ?? '--'} mph`);
  setText('windGust', `${current.windGustMph ?? '--'} mph`);
  setText('windDirection', current.windDir || data.windDir || '--');
  setText('humidity', `${current.humidity ?? '--'}%`);
  setText('dewPoint', degree(current.dewPoint));
  setText('pressure', current.pressureInHg === null || current.pressureInHg === undefined ? '-- inHg' : `${current.pressureInHg} inHg`);
  setText('cloudCover', `${current.cloudCover ?? '--'}%`);
  setText('uvIndex', current.uvIndex ?? '--');
  setText('currentPrecip', inch(current.precipitationIn));
  setText('forecastPrecip', inch(data.forecast?.[0]?.precipitationIn));
  setText('precip12', inch(current.precipitation12In));
  setText('precip24', inch(current.precipitation24In));
  setText('airQuality', current.airQualityLabel || '--');
  renderForecast(data.forecast);
  setText('updated', `Last updated: ${data.updatedLabel || new Date().toLocaleString()}`);
}

async function loadWeather() {
  try {
    const response = await fetch(`/api/weather?ts=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || `Weather HTTP ${response.status}`);
    renderWeather(data);
  } catch (err) {
    setText('updated', 'Weather data failed to load.');
    console.error(err);
  }
}

loadWeather();
setInterval(loadWeather, 5 * 60 * 1000);
