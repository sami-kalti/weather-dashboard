import { getWeatherIconUrl } from './api.js';
import { isFavorite, getUnits } from './storage.js';

// Show loading spinner
export function showLoading() {
    const loadingEl = document.getElementById('loading');
    const currentWeatherEl = document.getElementById('current-weather');
    const forecastEl = document.getElementById('forecast');
    const errorEl = document.getElementById('error');
    
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (currentWeatherEl) currentWeatherEl.classList.add('hidden');
    if (forecastEl) forecastEl.classList.add('hidden');
    if (errorEl) errorEl.classList.add('hidden');
}

// Hide loading spinner
export function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.classList.add('hidden');
}

// Show error message
export function showError(message) {
    hideLoading();
    const errorEl = document.getElementById('error');
    const errorMessageEl = document.getElementById('error-message');
    
    if (errorEl && errorMessageEl) {
        errorMessageEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

// Clear error message
export function clearError() {
    const errorEl = document.getElementById('error');
    if (errorEl) errorEl.classList.add('hidden');
}

// Display current weather
export function displayCurrentWeather(weatherData) {
    hideLoading();
    clearError();
    
    const currentWeatherEl = document.getElementById('current-weather');
    const units = getUnits();
    const tempUnit = units === 'metric' ? '°C' : '°F';
    const windUnit = units === 'metric' ? 'm/s' : 'mph';
    const favorite = isFavorite(weatherData.city);
    
    const html = `
        <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800">${weatherData.city}, ${weatherData.country}</h2>
                    <p class="text-gray-500 text-sm mt-1">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <button id="favorite-btn" class="text-3xl focus:outline-none transition-transform hover:scale-110" aria-label="Add to favorites">
                    ${favorite ? '⭐' : '☆'}
                </button>
            </div>
            
            <div class="flex items-center justify-between flex-wrap gap-6">
                <div class="flex items-center">
                    <img src="${getWeatherIconUrl(weatherData.icon)}" alt="${weatherData.description}" class="w-24 h-24 md:w-32 md:h-32">
                    <div>
                        <div class="text-5xl md:text-6xl font-bold text-gray-800">${weatherData.temperature}${tempUnit}</div>
                        <p class="text-gray-600 capitalize text-lg">${weatherData.description}</p>
                        <p class="text-gray-500 text-sm">Feels like ${weatherData.feelsLike}${tempUnit}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="bg-blue-50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs uppercase">Humidity</p>
                        <p class="text-2xl font-bold text-blue-600">${weatherData.humidity}%</p>
                    </div>
                    <div class="bg-green-50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs uppercase">Wind</p>
                        <p class="text-2xl font-bold text-green-600">${weatherData.windSpeed}</p>
                        <p class="text-xs text-gray-500">${windUnit}</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-3">
                        <p class="text-gray-500 text-xs uppercase">Pressure</p>
                        <p class="text-2xl font-bold text-purple-600">${weatherData.pressure}</p>
                        <p class="text-xs text-gray-500">hPa</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    currentWeatherEl.innerHTML = html;
    currentWeatherEl.classList.remove('hidden');
    
    // Update background based on weather
    updateBackground(weatherData.icon);
}

// Display 5-day forecast
export function displayForecast(forecastData) {
    const forecastEl = document.getElementById('forecast');
    const units = getUnits();
    const tempUnit = units === 'metric' ? '°C' : '°F';
    
    const cards = forecastData.map(day => {
        const date = new Date(day.date * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `
            <div class="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                <p class="font-semibold text-gray-800">${dayName}</p>
                <p class="text-xs text-gray-500 mb-2">${dateStr}</p>
                <img src="${getWeatherIconUrl(day.icon)}" alt="${day.description}" class="w-16 h-16 mx-auto">
                <p class="text-2xl font-bold text-gray-800 mt-2">${day.temperature}${tempUnit}</p>
                <p class="text-xs text-gray-500 capitalize mt-1">${day.description}</p>
                <div class="flex justify-around mt-3 text-xs text-gray-600">
                    <span>💧 ${day.humidity}%</span>
                    <span>💨 ${day.windSpeed}</span>
                </div>
            </div>
        `;
    }).join('');
    
    forecastEl.innerHTML = `
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 md:p-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">5-Day Forecast</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                ${cards}
            </div>
        </div>
    `;
    forecastEl.classList.remove('hidden');
}

// Update search history list
export function updateSearchHistory(history) {
    const historyEl = document.getElementById('search-history');
    
    if (!history || history.length === 0) {
        historyEl.innerHTML = '<p class="text-gray-500 text-sm">No recent searches</p>';
        return;
    }
    
    const html = history.map(city => `
        <button class="history-item w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-600">
            📍 ${city}
        </button>
    `).join('');
    
    historyEl.innerHTML = html;
}

// Update favorites list
export function updateFavorites(favorites) {
    const favoritesEl = document.getElementById('favorites');
    
    if (!favorites || favorites.length === 0) {
        favoritesEl.innerHTML = '<p class="text-gray-500 text-sm">No favorite cities</p>';
        return;
    }
    
    const html = favorites.map(city => `
        <div class="flex items-center justify-between bg-yellow-50 px-4 py-2 rounded-lg">
            <button class="favorite-item text-left flex-1 text-gray-700 hover:text-yellow-600 transition-colors">
                ⭐ ${city}
            </button>
            <button class="remove-favorite text-red-500 hover:text-red-700 ml-2" data-city="${city}" aria-label="Remove from favorites">
                ✕
            </button>
        </div>
    `).join('');
    
    favoritesEl.innerHTML = html;
}

// Change background based on weather
function updateBackground(iconCode) {
    const body = document.body;
    const mainCondition = iconCode.slice(0, 2);
    
    // Remove all weather classes
    body.className = body.className.replace(/weather-\w+/g, '');
    
    // Add appropriate weather class
    const weatherClasses = {
        '01': 'weather-clear',
        '02': 'weather-few-clouds',
        '03': 'weather-clouds',
        '04': 'weather-clouds',
        '09': 'weather-rain',
        '10': 'weather-rain',
        '11': 'weather-thunderstorm',
        '13': 'weather-snow',
        '50': 'weather-mist'
    };
    
    const weatherClass = weatherClasses[mainCondition] || 'weather-default';
    body.classList.add(weatherClass);
}

// Update unit toggle button text
export function updateUnitToggle(units) {
    const toggleBtn = document.getElementById('unit-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = units === 'metric' ? '°C' : '°F';
        toggleBtn.setAttribute('data-units', units);
    }
}
