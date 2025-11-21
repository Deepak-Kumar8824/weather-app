'use strict';
// ---------------------- Configuration ----------------------
const API_KEY = '08e9ae99e36f464299d237231fa3e081'; // User-provided key
const BASE_CURRENT = 'https://api.weatherapi.com/v1/current.json';
const BASE_FORECAST = 'https://api.weatherapi.com/v1/forecast.json';

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

let unit = 'C'; // 'C' or 'F'
toggleUnit.textContent = '°C';

// ---------------------- Utils ----------------------
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
  setTimeout(()=>{ errorBox.classList.add('hidden'); }, 5000);
}

function setBackgroundByCondition(text) {
  const app = document.getElementById('app');
  const t = text.toLowerCase();
  app.classList.remove('rainy');
  if (t.includes('rain')) {
    app.classList.add('rainy');
  } else if (t.includes('cloud')) {
    document.body.style.background = 'linear-gradient(to bottom, #dbeafe, #f1f5f9)';
  } else if (t.includes('sun') || t.includes('clear')) {
    document.body.style.background = 'linear-gradient(to bottom, #fff7ed, #fffbea)';
  } else {
    document.body.style.background = '';
  }
}

// ---------------------- Recent Cities (localStorage) ----------------------
function loadRecent() {
  try {
    const raw = localStorage.getItem('recentCities');
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    return [];
  }
}
function saveRecent(city) {
  if(!city) return;
  let arr = loadRecent();
  arr = arr.filter(c=>c.toLowerCase() !== city.toLowerCase());
  arr.unshift(city);
  if (arr.length > 6) arr.pop();
  localStorage.setItem('recentCities', JSON.stringify(arr));
  renderRecentDropdown();
}
function renderRecentDropdown(){
  const arr = loadRecent();
  if (!arr || arr.length === 0) {
    recentDropdown.classList.add('hidden');
    return;
  }
  recentDropdown.classList.remove('hidden');
  recentDropdown.innerHTML = '';
  arr.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    recentDropdown.appendChild(opt);
  });
}

// ---------------------- Fetching ----------------------
async function fetchWeatherByCity(city) {
  try {
    if(!city) { showError('Please enter a city name'); return; }
    const curUrl = `${BASE_CURRENT}?key=${API_KEY}&q=${encodeURIComponent(city)}`;
    const fUrl = `${BASE_FORECAST}?key=${API_KEY}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no`;
    const [curRes, fRes] = await Promise.all([fetch(curUrl), fetch(fUrl)]);
    if (!curRes.ok || !fRes.ok) {
      const errText = await curRes.text();
      throw new Error('Location not found or API error');
    }
    const cur = await curRes.json();
    const f = await fRes.json();
    updateCurrent(cur);
    updateForecast(f);
    saveRecent(cur.location.name);
  } catch(err) {
    showError('Unable to fetch weather. Check city name or API key.');
    console.error(err);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const q = `${lat},${lon}`;
    const curUrl = `${BASE_CURRENT}?key=${API_KEY}&q=${encodeURIComponent(q)}`;
    const fUrl = `${BASE_FORECAST}?key=${API_KEY}&q=${encodeURIComponent(q)}&days=5&aqi=no&alerts=no`;
    const [curRes, fRes] = await Promise.all([fetch(curUrl), fetch(fUrl)]);
    if (!curRes.ok || !fRes.ok) throw new Error('API error');
    const cur = await curRes.json();
    const f = await fRes.json();
    updateCurrent(cur);
    updateForecast(f);
    saveRecent(cur.location.name);
  } catch(err) {
    showError('Unable to fetch location weather.');
    console.error(err);
  }
}

// ---------------------- UI Update ----------------------
function updateCurrent(data) {
  if (!data || !data.current) { showError('Invalid data'); return; }
  const loc = data.location.name + ', ' + data.location.country;
  locationName.textContent = loc;
  conditionText.textContent = data.current.condition.text;
  const cTempC = data.current.temp_c;
  const cTempF = data.current.temp_f;
  temperatureEl.dataset.c = cTempC;
  temperatureEl.dataset.f = cTempF;
  temperatureEl.textContent = (unit === 'C') ? `${cTempC}°C` : `${cTempF}°F`;
  humidityEl.textContent = data.current.humidity;
  windEl.textContent = data.current.wind_kph;
  weatherIcon.innerHTML = `<img src="${data.current.condition.icon}" alt="icon" />`;
  setBackgroundByCondition(data.current.condition.text);

  // Alert for extreme temp
  alertBox.innerHTML = '';
  if (cTempC > 40) {
    alertBox.innerHTML = '<div class="mt-3 p-2 rounded bg-red-100 text-red-800">Extreme temperature! Stay hydrated.</div>';
  }
}

function updateForecast(data) {
  if (!data || !data.forecast) return;
  const days = data.forecast.forecastday;
  forecastContainer.innerHTML = '';
  days.forEach(day=>{
    const d = new Date(day.date);
    const card = document.createElement('div');
    card.className = 'p-3 rounded-lg border flex items-center justify-between';
    card.innerHTML = `
      <div>
        <div class="font-semibold">${d.toDateString()}</div>
        <div class="text-sm">${day.day.condition.text}</div>
      </div>
      <div class="text-right">
        <div>Max: ${day.day.maxtemp_c}°C</div>
        <div>Min: ${day.day.mintemp_c}°C</div>
        <div>Humidity: ${day.day.avghumidity}%</div>
        <div>Wind: ${day.day.maxwind_kph} kph</div>
      </div>
      <div class="ml-3"><img src="${day.day.condition.icon}" alt="icon"/></div>
    `;
    forecastContainer.appendChild(card);
  });
}

// ---------------------- Event Listeners ----------------------
searchBtn.addEventListener('click', ()=> fetchWeatherByCity(cityInput.value.trim()));
cityInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') fetchWeatherByCity(cityInput.value.trim()); });
locBtn.addEventListener('click', ()=> {
  if (!navigator.geolocation) { showError('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  }, err=>{
    showError('Permission denied or unavailable');
  });
});
toggleUnit.addEventListener('click', ()=>{
  unit = (unit === 'C') ? 'F' : 'C';
  toggleUnit.textContent = (unit === 'C') ? '°C' : '°F';
  // update displayed temperature
  if (temperatureEl.dataset.c) {
    temperatureEl.textContent = (unit === 'C') ? `${temperatureEl.dataset.c}°C` : `${temperatureEl.dataset.f}°F`;
  }
});

recentDropdown.addEventListener('change', ()=>{
  const v = recentDropdown.value;
  if (v) fetchWeatherByCity(v);
});

// On load
renderRecentDropdown();
