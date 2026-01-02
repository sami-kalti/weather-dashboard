// API URLs for Open-Meteo (free weather API)
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Get city coordinates from city name
async function getCityCoordinates(city) {
    try {
        const response = await fetch(
            `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        
        if (!response.ok) {
            throw new Error('Failed to find city location.');
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('City not found. Please check the spelling and try again.');
        }
        
        const location = data.results[0];
        return {
            name: location.name,
            country: location.country_code || location.country,
            latitude: location.latitude,
            longitude: location.longitude
        };
    } catch (error) {
        console.error('Error fetching city coordinates:', error);
        throw error;
    }
}

// Convert weather codes to readable descriptions and icons
function getWeatherInfo(code) {
    const weatherMap = {
        0: { description: 'clear sky', icon: '01d' },
        1: { description: 'mainly clear', icon: '01d' },
        2: { description: 'partly cloudy', icon: '02d' },
        3: { description: 'overcast', icon: '03d' },
        45: { description: 'foggy', icon: '50d' },
        48: { description: 'depositing rime fog', icon: '50d' },
        51: { description: 'light drizzle', icon: '09d' },
        53: { description: 'moderate drizzle', icon: '09d' },
        55: { description: 'dense drizzle', icon: '09d' },
        61: { description: 'slight rain', icon: '10d' },
        63: { description: 'moderate rain', icon: '10d' },
        65: { description: 'heavy rain', icon: '10d' },
        71: { description: 'slight snow', icon: '13d' },
        73: { description: 'moderate snow', icon: '13d' },
        75: { description: 'heavy snow', icon: '13d' },
        77: { description: 'snow grains', icon: '13d' },
        80: { description: 'slight rain showers', icon: '09d' },
        81: { description: 'moderate rain showers', icon: '09d' },
        82: { description: 'violent rain showers', icon: '09d' },
        85: { description: 'slight snow showers', icon: '13d' },
        86: { description: 'heavy snow showers', icon: '13d' },
        95: { description: 'thunderstorm', icon: '11d' },
        96: { description: 'thunderstorm with slight hail', icon: '11d' },
        99: { description: 'thunderstorm with heavy hail', icon: '11d' }
    };
    return weatherMap[code] || { description: 'unknown', icon: '01d' };
}

// Get current weather for a city
export async function getCurrentWeather(city, units = 'metric') {
    try {
        // First get the city coordinates
        const location = await getCityCoordinates(city);
        
        // Then fetch weather data
        const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
        const windUnit = units === 'imperial' ? 'mph' : 'ms';
        
        const response = await fetch(
            `${WEATHER_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data. Please try again later.');
        }
        
        const data = await response.json();
        const current = data.current;
        const weatherInfo = getWeatherInfo(current.weather_code);
        
        return {
            city: location.name,
            country: location.country,
            temperature: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            description: weatherInfo.description,
            icon: weatherInfo.icon,
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
            pressure: Math.round(current.surface_pressure),
            timestamp: Math.floor(new Date(current.time).getTime() / 1000)
        };
    } catch (error) {
        console.error('Error fetching current weather:', error);
        throw error;
    }
}

// Get 5-day forecast for a city
export async function getForecast(city, units = 'metric') {
    try {
        const location = await getCityCoordinates(city);
        
        // Then fetch forecast data
        const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
        const windUnit = units === 'imperial' ? 'mph' : 'ms';
        
        const response = await fetch(
            `${WEATHER_URL}?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto&forecast_days=7`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch forecast data. Please try again later.');
        }
        
        const data = await response.json();
        const daily = data.daily;
        
        // Get 5 days of forecast (skip today, take next 5)
        return daily.time.slice(1, 6).map((date, index) => {
            const i = index + 1;
            const weatherInfo = getWeatherInfo(daily.weather_code[i]);
            const avgTemp = Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2);
            
            return {
                date: Math.floor(new Date(date).getTime() / 1000),
                temperature: avgTemp,
                tempMin: Math.round(daily.temperature_2m_min[i]),
                tempMax: Math.round(daily.temperature_2m_max[i]),
                description: weatherInfo.description,
                icon: weatherInfo.icon,
                humidity: Math.round(daily.relative_humidity_2m_mean[i]),
                windSpeed: Math.round(daily.wind_speed_10m_max[i] * 10) / 10
            };
        });
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
}

// Get icon URL for weather conditions
export function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
