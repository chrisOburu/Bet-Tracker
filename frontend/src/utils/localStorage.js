/**
 * Local storage utility functions for persisting user preferences
 */

const STORAGE_KEYS = {
  ARBITRAGE_MATCHES_PER_PAGE: 'arbitrage_matches_per_page',
  ARBITRAGE_SORT_PREFERENCES: 'arbitrage_sort_preferences',
  THEME_MODE: 'theme_mode'
};

/**
 * Get matches per page from localStorage with fallback
 * @param {number} defaultValue - Default value if nothing stored
 * @returns {number} Stored or default matches per page
 */
export const getStoredMatchesPerPage = (defaultValue = 10) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ARBITRAGE_MATCHES_PER_PAGE);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      // Validate that it's a reasonable number
      if (parsed > 0 && parsed <= 100) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error reading matches per page from localStorage:', error);
  }
  return defaultValue;
};

/**
 * Store matches per page to localStorage
 * @param {number} value - Number of matches per page
 */
export const setStoredMatchesPerPage = (value) => {
  try {
    if (typeof value === 'number' && value > 0 && value <= 100) {
      localStorage.setItem(STORAGE_KEYS.ARBITRAGE_MATCHES_PER_PAGE, value.toString());
    }
  } catch (error) {
    console.warn('Error storing matches per page to localStorage:', error);
  }
};

/**
 * Get sort preferences from localStorage
 * @returns {object} Sort preferences object
 */
export const getStoredSortPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ARBITRAGE_SORT_PREFERENCES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error reading sort preferences from localStorage:', error);
  }
  return {
    sortBy: 'profit',
    sortOrder: 'desc'
  };
};

/**
 * Store sort preferences to localStorage
 * @param {object} preferences - Sort preferences object
 */
export const setStoredSortPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ARBITRAGE_SORT_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Error storing sort preferences to localStorage:', error);
  }
};

/**
 * Get theme mode from localStorage
 * @returns {string} Theme mode ('light' or 'dark')
 */
export const getStoredThemeMode = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.warn('Error reading theme mode from localStorage:', error);
  }
  return 'light'; // Default to light mode
};

/**
 * Store theme mode to localStorage
 * @param {string} mode - Theme mode ('light' or 'dark')
 */
export const setStoredThemeMode = (mode) => {
  try {
    if (mode === 'light' || mode === 'dark') {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    }
  } catch (error) {
    console.warn('Error storing theme mode to localStorage:', error);
  }
};

/**
 * Clear all stored preferences
 */
export const clearStoredPreferences = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Error clearing stored preferences:', error);
  }
};

export default {
  getStoredMatchesPerPage,
  setStoredMatchesPerPage,
  getStoredSortPreferences,
  setStoredSortPreferences,
  getStoredThemeMode,
  setStoredThemeMode,
  clearStoredPreferences
};
