# Weather Forecast Application

This project implements the Weather Forecast application as specified in the provided assignment PDF.
**Source PDF (assignment spec):** /mnt/data/Weather Forecast Project Edited.pdf

## Features
- Search weather by city name
- Use current device location (Geolocation API)
- Display current weather (temp, condition, humidity, wind)
- 5-day forecast with date, temps, humidity, wind and icons
- Recent searches stored in `localStorage` (dropdown)
- Temperature toggle between °C and °F (applies to current temp)
- Custom UI error messages (no `alert()` usage)
- Background changes for rainy/sunny/cloudy conditions
- Extreme temperature alert when temp > 40°C

## Tech stack
- HTML + TailwindCSS (via CDN)
- Vanilla JavaScript (fetch API)
- No build tools required

## Files
- `index.html` — main page
- `style.css` — extra styles
- `script.js` — application logic and API calls
- `README.md` — this file
- `commit_messages.txt` — 12 example commit messages

## Setup & Run
1. Unzip the project and open `index.html` in a browser.
2. The app uses WeatherAPI.com endpoints. The API key is embedded in `script.js` for convenience.
   - API Key used: `08e9ae99e36f464299d237231fa3e081`
3. For "Use My Location" to work, open the page via `http://` or `https://` or use `Live Server` extension in VS Code.
4. Recent searches will appear in the dropdown after a successful search.

## Notes
- The original assignment PDF is included in the environment at `/mnt/data/Weather Forecast Project Edited.pdf`.
- If you want to hide your API key, remove it from `script.js` and set it server-side or prompt the user at runtime.
# Weather Forecast Application

This project implements the Weather Forecast application as specified in the provided assignment PDF.
**Source PDF (assignment spec):** /mnt/data/Weather Forecast Project Edited.pdf

## Features
- Search weather by city name
- Use current device location (Geolocation API)
- Display current weather (temp, condition, humidity, wind)
- 5-day forecast with date, temps, humidity, wind and icons
- Recent searches stored in `localStorage` (dropdown)
- Temperature toggle between °C and °F (applies to current temp)
- Custom UI error messages (no `alert()` usage)
- Background changes for rainy/sunny/cloudy conditions
- Extreme temperature alert when temp > 40°C

## Tech stack
- HTML + TailwindCSS (via CDN)
- Vanilla JavaScript (fetch API)
- No build tools required

## Files
- `index.html` — main page
- `style.css` — extra styles
- `script.js` — application logic and API calls
- `README.md` — this file
- `commit_messages.txt` — 12 example commit messages

## Setup & Run
1. Unzip the project and open `index.html` in a browser.
2. The app uses WeatherAPI.com endpoints. The API key is embedded in `script.js` for convenience.
   - API Key used: `***9ae99e36f4642**d237231fa3***`
3. For "Use My Location" to work, open the page via `http://` or `https://` or use `Live Server` extension in VS Code.
4. Recent searches will appear in the dropdown after a successful search.

