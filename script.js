'use strict';

// ---------------------- Configuration ----------------------
const API_KEY = '08e9ae99e36f464299d237231fa3e081';  // OpenWeatherMap Key

const BASE_CURRENT = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

// ---------------------- Elements ----------------------
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locBtn = document.getElementById('locBtn');
const toggleUnit = document.getElementById('toggleUnit');
const errorBox = document.getElementById('errorBox');

const locationName = document.getElementById('locationName');
const conditionText = document.getElementById('conditionText');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const weatherIcon = document.getElementById('weatherIcon');
const alertBox = document.getElementById('alertBox');

const recentDropdown = document.getElementById('recentDropdown');
const forecastContainer = document.getElementById('forecastContainer');

let unit = 'C'; // C or F
toggleUnit.textContent = '°C';

// ---------------------- Error UI ----------------------
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
  setTimeout(() => errorBox.classList.add('hidden'), 4000);
}

// ---------------------- Background Control ----------------------
function setBackgroundByCondition(text) {
  text = text.toLowerCase();
  const app = document.getElementById('app');

  app.classList.remove('rainy');

  if (text.includes('rain')) {
    app.classList.add('rainy');
  } else if (text.includes('cloud')) {
    document.body.style.background =
      'linear-gradient(to bottom, #dbeafe, #f1f5f9)';
  } else if (text.includes('clear') || text.includes('sun')) {
    document.body.style.background =
      'linear-gradient(to bottom, #fff7ed, #fffbea)';
  } else {
    document.body.style.background = '';
  }
}

// ---------------------- Local Storage (Recent Cities) ----------------------
function loadRecent() {
  try {
    const raw = localStorage.getItem('recentCities');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveRecent(city) {
  let arr = loadRecent();
  arr = arr.filter((c) => c.toLowerCase() !== city.toLowerCase());
  arr.unshift(city);
  if (arr.length > 6) arr.pop();
  localStorage.setItem('recentCities', JSON.stringify(arr));
  renderRecentDropdown();
}

function renderRecentDropdown() {
  const arr = loadRecent();
  if (!arr.length) {
    recentDropdown.classList.add('hidden');
    return;
  }
  recentDropdown.classList.remove('hidden');
  recentDropdown.innerHTML = '';
  arr.forEach((city) => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    recentDropdown.appendChild(opt);
  });
}

// ---------------------- Fetch Weather by City ----------------------
async function fetchWeatherByCity(city) {
  try {
    if (!city) return showError("Please enter a city name");

    const curUrl = `${BASE_CURRENT}?q=${city}&appid=${API_KEY}&units=metric`;
    const fUrl = `${BASE_FORECAST}?q=${city}&appid=${API_KEY}&units=metric`;

    const [curRes, fRes] = await Promise.all([fetch(curUrl), fetch(fUrl)]);

    if (!curRes.ok || !fRes.ok) throw new Error();

    const cur = await curRes.json();
    const f = await fRes.json();

    updateCurrentOWM(cur);
    updateForecastOWM(f);

    saveRecent(city);

  } catch {
    showError("Unable to fetch weather. Check city name or API key.");
  }
}

// ---------------------- Fetch Weather by Coordinates ----------------------
async function fetchWeatherByCoords(lat, lon) {
  try {
    const curUrl = `${BASE_CURRENT}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const fUrl = `${BASE_FORECAST}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const [curRes, fRes] = await Promise.all([fetch(curUrl), fetch(fUrl)]);

    if (!curRes.ok || !fRes.ok) throw new Error();

    const cur = await curRes.json();
    const f = await fRes.json();

    updateCurrentOWM(cur);
    updateForecastOWM(f);

    saveRecent(cur.name);

  } catch {
    showError("Unable to fetch location weather.");
  }
}

// ---------------------- Update Current Weather (OWM) ----------------------
function updateCurrentOWM(data) {
  locationName.textContent = data.name;
  conditionText.textContent = data.weather[0].description;

  const tempC = data.main.temp;
  const tempF = (tempC * 9/5 + 32).toFixed(2);

  temperatureEl.dataset.c = tempC;
  temperatureEl.dataset.f = tempF;

  temperatureEl.textContent = unit === 'C' ? `${tempC}°C` : `${tempF}°F`;

  humidityEl.textContent = data.main.humidity;
  windEl.textContent = data.wind.speed;

  weatherIcon.innerHTML = `
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
  `;

  setBackgroundByCondition(data.weather[0].description);

  alertBox.innerHTML = "";
  if (tempC > 40) {
    alertBox.innerHTML =
      '<div class="mt-3 p-2 rounded bg-red-100 text-red-800">Extreme temperature! Stay hydrated.</div>';
  }
}

// ---------------------- Update Forecast (OWM) ----------------------
function updateForecastOWM(data) {
  forecastContainer.innerHTML = "";

  const daily = data.list.filter((_, idx) => idx % 8 === 0);

  daily.forEach((day) => {
    const date = new Date(day.dt * 1000);

    const card = document.createElement('div');
    card.className = 'p-3 rounded-lg border flex items-center justify-between';

    card.innerHTML = `
      <div>
        <div class="font-semibold">${date.toDateString()}</div>
        <div class="text-sm">${day.weather[0].description}</div>
      </div>

      <div class="text-right">
        <div>Temp: ${day.main.temp}°C</div>
        <div>Humidity: ${day.main.humidity}%</div>
        <div>Wind: ${day.wind.speed} m/s</div>
      </div>

      <div class="ml-3">
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
      </div>
    `;

    forecastContainer.appendChild(card);
  });
}

// ---------------------- Events ----------------------
searchBtn.addEventListener('click', () => fetchWeatherByCity(cityInput.value.trim()));

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchWeatherByCity(cityInput.value.trim());
});

locBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError("Geolocation not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Permission denied or unavailable")
  );
});

toggleUnit.addEventListener('click', () => {
  unit = unit === 'C' ? 'F' : 'C';
  toggleUnit.textContent = unit === 'C' ? '°C' : '°F';

  if (temperatureEl.dataset.c) {
    temperatureEl.textContent =
      unit === 'C'
        ? `${temperatureEl.dataset.c}°C`
        : `${temperatureEl.dataset.f}°F`;
  }
});

recentDropdown.addEventListener('change', () => {
  fetchWeatherByCity(recentDropdown.value);
});

// ---------------------- Init ----------------------
renderRecentDropdown();
