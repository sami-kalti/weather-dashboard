// Storage keys for localStorage
const STORAGE_KEYS = {
    SEARCH_HISTORY: 'weatherSearchHistory',
    FAVORITES: 'weatherFavorites',
    UNITS: 'weatherUnits'
};

const MAX_HISTORY_ITEMS = 5;
const MAX_FAVORITES = 5;

// Get search history
export function getSearchHistory() {
    try {
        const history = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading search history:', error);
        return [];
    }
}

// Add city to search history
export function addToSearchHistory(city) {
    try {
        let history = getSearchHistory();
        
        // Remove city if it already exists
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        // Add to beginning
        history.unshift(city);
        
        // Keep only last MAX_HISTORY_ITEMS
        history = history.slice(0, MAX_HISTORY_ITEMS);
        
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

// Clear all search history
export function clearSearchHistory() {
    try {
        localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
        console.error('Error clearing search history:', error);
    }
}

// Get favorite cities
export function getFavorites() {
    try {
        const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
        console.error('Error reading favorites:', error);
        return [];
    }
}

// Add city to favorites
export function addToFavorites(city) {
    try {
        let favorites = getFavorites();
        
        // Check if already in favorites
        if (favorites.some(item => item.toLowerCase() === city.toLowerCase())) {
            return false;
        }
        
        // Check if limit reached
        if (favorites.length >= MAX_FAVORITES) {
            throw new Error(`Maximum ${MAX_FAVORITES} favorite cities allowed`);
        }
        
        favorites.push(city);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        return true;
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
}

// Remove city from favorites
export function removeFromFavorites(city) {
    try {
        let favorites = getFavorites();
        favorites = favorites.filter(item => item.toLowerCase() !== city.toLowerCase());
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
        console.error('Error removing from favorites:', error);
    }
}

// Check if city is favorited
export function isFavorite(city) {
    const favorites = getFavorites();
    return favorites.some(item => item.toLowerCase() === city.toLowerCase());
}

// Get temperature units preference
export function getUnits() {
    try {
        return localStorage.getItem(STORAGE_KEYS.UNITS) || 'metric';
    } catch (error) {
        console.error('Error reading units preference:', error);
        return 'metric';
    }
}

// Save temperature units preference
export function setUnits(units) {
    try {
        localStorage.setItem(STORAGE_KEYS.UNITS, units);
    } catch (error) {
        console.error('Error saving units preference:', error);
    }
}
