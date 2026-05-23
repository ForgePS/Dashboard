const LAT = 34.9554;
const LON = -90.0348;

const weatherUrl =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,cloud_cover,dew_point_2m,precipitation' +
  '&hourly=precipitation' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,precipitation_probability_max,sunrise,sunset' +
  '&temperature_unit=fahrenheit' +
  '&wind_speed_unit=mph' +
  '&precipitation_unit=inch' +
  '&timezone=America%2FChicago' +
  '&forecast_days=4&past_days=1';

const airUrl =
  `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}` +
  '&current=us_aqi&timezone=America%2FChicago';

function setText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value;
}

function windDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(Number(deg) / 45) % 8] || '--';
}

function pressureToInHg(hPa) {
  return (Number(hPa) * 0.02953).toFixed(2);
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function weatherCode(code) {
  const codes = {
    0: 'Clear',
    1: 'Mostly Clear',
    2: 'Partly Cloudy',
    3: 'Cloudy',
    45: 'Fog',
    48: 'Freezing Fog',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    80: 'Rain Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    95: 'Thunderstorms',
    96: 'Storms w/ Hail',
    99: 'Severe Storms'
  };

  return codes[code] || 'Unknown';
}

function setWeatherBackground(code, isDay) {
  let image = '';

  if ([0].includes(code)) {
    image = isDay
      ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80'
      : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80';
  } else if ([1, 2].includes(code)) {
    image = isDay
      ? 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1920&q=80'
      : 'https://images.unsplash.com/photo-1532978379173-523e16f371f0?auto=format&fit=crop&w=1920&q=80';
  } else if ([3].includes(code)) {
    image = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80';
  } else if ([45, 48].includes(code)) {
    image = 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=80';
  } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    image = 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80';
  } else if ([71, 73, 75].includes(code)) {
    image = 'https://images.unsplash.com/photo-1511131341194-24e2eeeebb09?auto=format&fit=crop&w=1920&q=80';
  } else if ([95, 96, 99].includes(code)) {
    image = 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80';
  } else {
    image = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80';
  }

  document.body.style.backgroundImage =
    `linear-gradient(rgba(0,0,0,.60), rgba(0,0,0,.84)), url('${image}')`;
}

function aqiLabel(aqi) {
  if (!Number.isFinite(Number(aqi))) return '--';
  if (aqi <= 50) return `${aqi} Good`;
  if (aqi <= 100) return `${aqi} Moderate`;
  if (aqi <= 150) return `${aqi} Unhealthy SG`;
  if (aqi <= 200) return `${aqi} Unhealthy`;
  if (aqi <= 300) return `${aqi} Very Unhealthy`;
  return `${aqi} Hazardous`;
}

function sumRecentPrecip(hourly, hoursBack) {
  const now = new Date();
  let total = 0;

  (hourly.time || []).forEach((time, index) => {
    const hourTime = new Date(time);
    const diffHours = (now - hourTime) / 36e5;

    if (diffHours >= 0 && diffHours <= hoursBack) {
      total += hourly.precipitation[index] || 0;
    }
  });

  return total.toFixed(2);
}

function forecastDayName(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Forecast';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

async function loadWeather() {
  try {
    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl, { cache: 'no-store' }),
      fetch(airUrl, { cache: 'no-store' })
    ]);

    if (!weatherRes.ok) throw new Error(`Weather HTTP ${weatherRes.status}`);

    const weather = await weatherRes.json();
    const air = await airRes.json().catch(() => ({}));
    const c = weather.current || {};
    const daily = weather.daily || {};

    const now = new Date();
    const sunriseToday = new Date(daily.sunrise?.[0]);
    const sunsetToday = new Date(daily.sunset?.[0]);
    const isDay = now >= sunriseToday && now <= sunsetToday;

    setWeatherBackground(c.weather_code, isDay);

    setText('temperature', `${Math.round(c.temperature_2m)}°`);
    setText('condition', weatherCode(c.weather_code));
    setText('feelsLike', `Feels like ${Math.round(c.apparent_temperature)}°`);
    setText('highLow', `${Math.round(daily.temperature_2m_max?.[0])}° / ${Math.round(daily.temperature_2m_min?.[0])}°`);
    setText('sunrise', formatTime(daily.sunrise?.[0]));
    setText('sunset', formatTime(daily.sunset?.[0]));
    setText('windSpeed', `${Math.round(c.wind_speed_10m)} mph`);
    setText('windGust', `${Math.round(c.wind_gusts_10m)} mph`);
    setText('windDirection', windDirection(c.wind_direction_10m));
    setText('humidity', `${c.relative_humidity_2m}%`);
    setText('dewPoint', `${Math.round(c.dew_point_2m)}°`);
    setText('pressure', `${pressureToInHg(c.pressure_msl)} inHg`);
    setText('cloudCover', `${c.cloud_cover}%`);
    setText('uvIndex', c.uv_index ?? '--');
    setText('currentPrecip', `${Number(c.precipitation || 0).toFixed(2)} in`);
    setText('forecastPrecip', `${Number(daily.precipitation_sum?.[0] || 0).toFixed(2)} in`);
    setText('precip12', `${sumRecentPrecip(weather.hourly || {}, 12)} in`);
    setText('precip24', `${sumRecentPrecip(weather.hourly || {}, 24)} in`);
    setText('airQuality', air.current?.us_aqi !== undefined ? aqiLabel(air.current.us_aqi) : '--');

    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';

    for (let i = 1; i <= 3; i += 1) {
      forecastDiv.innerHTML += `
        <div class="forecast-card">
          <h2>${forecastDayName(daily.time?.[i])}</h2>
          <div class="forecast-temp">
            ${Math.round(daily.temperature_2m_max?.[i])}° /
            ${Math.round(daily.temperature_2m_min?.[i])}°
          </div>
          <div class="forecast-detail">${weatherCode(daily.weather_code?.[i])}</div>
          <div class="forecast-detail">Rain: ${Number(daily.precipitation_sum?.[i] || 0).toFixed(2)} in</div>
          <div class="forecast-detail">Chance: ${daily.precipitation_probability_max?.[i] ?? '--'}%</div>
          <div class="forecast-detail">Sunrise: ${formatTime(daily.sunrise?.[i])}</div>
          <div class="forecast-detail">Sunset: ${formatTime(daily.sunset?.[i])}</div>
          <div class="forecast-detail">UV Max: ${daily.uv_index_max?.[i] ?? '--'}</div>
        </div>
      `;
    }

    setText('updated', `Last updated: ${new Date().toLocaleString()}`);
  } catch (err) {
    setText('updated', 'Weather data failed to load.');
    console.error(err);
  }
}

loadWeather();
setInterval(loadWeather, 5 * 60 * 1000);
