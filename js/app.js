import { getCurrentWeather, getForecast } from './api.js';
import { 
    getSearchHistory, 
    addToSearchHistory, 
    getFavorites, 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite,
    getUnits,
    setUnits 
} from './storage.js';
import { 
    showLoading, 
    showError, 
    displayCurrentWeather, 
    displayForecast, 
    updateSearchHistory, 
    updateFavorites,
    updateUnitToggle 
} from './ui.js';

let currentCity = '';
let temperatureChart = null;

// Initialize everything when page loads
function init() {
    initializeDarkMode();
    setupEventListeners();
    
    // Load initial data
    updateSearchHistory(getSearchHistory());
    updateFavorites(getFavorites());
    
    // Set initial unit toggle
    updateUnitToggle(getUnits());
    
    // Load default city (optional)
    const history = getSearchHistory();
    if (history.length > 0) {
        searchWeather(history[0]);
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', handleSearch);
    
    // Unit toggle
    const unitToggle = document.getElementById('unit-toggle');
    unitToggle.addEventListener('click', handleUnitToggle);
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // History items (event delegation)
    const historyContainer = document.getElementById('search-history');
    historyContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('history-item')) {
            const city = e.target.textContent.trim().replace('📍 ', '');
            searchWeather(city);
        }
    });
    
    // Favorite items (event delegation)
    const favoritesContainer = document.getElementById('favorites');
    favoritesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('favorite-item')) {
            const city = e.target.textContent.trim().replace('⭐ ', '');
            searchWeather(city);
        } else if (e.target.classList.contains('remove-favorite')) {
            const city = e.target.getAttribute('data-city');
            handleRemoveFavorite(city);
        }
    });
    
    // Current weather favorite button (event delegation)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'favorite-btn' || e.target.closest('#favorite-btn')) {
            handleToggleFavorite();
        }
    });
}

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();
    
    const searchInput = document.getElementById('search-input');
    const city = searchInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    await searchWeather(city);
    searchInput.value = '';
}

// Check if dark mode was enabled before
function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeButton(true);
    }
}

// Toggle between dark and light mode
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeButton(isDark);
    
    // Update chart if it exists
    if (temperatureChart) {
        updateChartTheme(isDark);
    }
}

function updateDarkModeButton(isDark) {
    const btn = document.getElementById('dark-mode-toggle');
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
}

// Search weather for a city
async function searchWeather(city) {
    showLoading();
    currentCity = city;
    
    try {
        const units = getUnits();
        
        // Get both current and forecast data
        const [weatherData, forecastData] = await Promise.all([
            getCurrentWeather(city, units),
            getForecast(city, units)
        ]);
        
        // Display the data
        displayCurrentWeather(weatherData);
        displayForecast(forecastData);
        renderTemperatureChart(forecastData);
        
        // Update search history
        addToSearchHistory(weatherData.city);
        updateSearchHistory(getSearchHistory());
        
    } catch (error) {
        showError(error.message);
    }
}

// Toggle between Celsius and Fahrenheit
async function handleUnitToggle() {
    const currentUnits = getUnits();
    const newUnits = currentUnits === 'metric' ? 'imperial' : 'metric';
    
    setUnits(newUnits);
    updateUnitToggle(newUnits);
    
    // Refresh current weather with new units
    if (currentCity) {
        await searchWeather(currentCity);
    }
}

// Add or remove city from favorites
function handleToggleFavorite() {
    if (!currentCity) return;
    
    try {
        if (isFavorite(currentCity)) {
            removeFromFavorites(currentCity);
            showNotification('Removed from favorites');
        } else {
            const added = addToFavorites(currentCity);
            if (added) {
                showNotification('Added to favorites');
            }
        }
        
        // Update UI
        updateFavorites(getFavorites());
        
        // Update favorite button
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.textContent = isFavorite(currentCity) ? '⭐' : '☆';
        }
    } catch (error) {
        showError(error.message);
    }
}

// Remove a city from favorites list
function handleRemoveFavorite(city) {
    removeFromFavorites(city);
    updateFavorites(getFavorites());
    showNotification(`Removed ${city} from favorites`);
    
    // Update favorite button if this was the current city
    if (city === currentCity) {
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.textContent = '☆';
        }
    }
}

// Create the temperature chart
function renderTemperatureChart(forecastData) {
    const chartContainer = document.getElementById('chart-container');
    const canvas = document.getElementById('temperature-chart');
    
    if (!canvas) return;
    
    // Show chart container
    chartContainer.classList.remove('hidden');
    
    // Destroy existing chart
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    
    const isDark = document.body.classList.contains('dark-mode');
    const units = getUnits();
    const tempUnit = units === 'metric' ? '°C' : '°F';
    
    // Prepare data
    const labels = forecastData.map(day => {
        const date = new Date(day.date * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });
    
    const maxTemps = forecastData.map(day => day.tempMax);
    const minTemps = forecastData.map(day => day.tempMin);
    const avgTemps = forecastData.map(day => day.temperature);
    
    // Create chart
    const ctx = canvas.getContext('2d');
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Max Temperature (${tempUnit})`,
                    data: maxTemps,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: `Average Temperature (${tempUnit})`,
                    data: avgTemps,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: `Min Temperature (${tempUnit})`,
                    data: minTemps,
                    borderColor: 'rgb(147, 197, 253)',
                    backgroundColor: 'rgba(147, 197, 253, 0.1)',
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: isDark ? '#e5e7eb' : '#374151',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: isDark ? '#e5e7eb' : '#374151',
                        callback: function(value) {
                            return value + tempUnit;
                        }
                    },
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: isDark ? '#e5e7eb' : '#374151'
                    },
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

// Update chart colors for dark/light mode
function updateChartTheme(isDark) {
    if (!temperatureChart) return;
    
    const textColor = isDark ? '#e5e7eb' : '#374151';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    temperatureChart.options.plugins.legend.labels.color = textColor;
    temperatureChart.options.scales.y.ticks.color = textColor;
    temperatureChart.options.scales.y.grid.color = gridColor;
    temperatureChart.options.scales.x.ticks.color = textColor;
    temperatureChart.options.scales.x.grid.color = gridColor;
    
    temperatureChart.update();
}

// Show notification message
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
