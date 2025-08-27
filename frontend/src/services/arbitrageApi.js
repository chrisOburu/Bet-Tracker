import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const arbitrageService = {
  // Get grouped arbitrage opportunities with pagination
  getGroupedArbitrages: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/arbitrages/grouped?${params}`);
    return response.data;
  },

  // Get all arbitrages for a specific match signature - NEW ENDPOINT
  getArbitragesByMatchSignature: async (matchSignature, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/arbitrages/match/${encodeURIComponent(matchSignature)}?${params}`);
    return response.data;
  },

  // Get all arbitrages for a specific match signature - OLD ENDPOINT (deprecated)
  getArbitragesBySignature: async (matchSignature, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/arbitrages/signature/${encodeURIComponent(matchSignature)}?${params}`);
    return response.data;
  },

  // Get all arbitrage opportunities
  getArbitrages: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/arbitrages?${params}`);
    return response.data;
  },

  // Create a new arbitrage opportunity
  createArbitrage: async (arbitrageData) => {
    const response = await axios.post(`${API_BASE_URL}/arbitrages`, arbitrageData);
    return response.data;
  },

  // Update an arbitrage opportunity
  updateArbitrage: async (id, arbitrageData) => {
    const response = await axios.put(`${API_BASE_URL}/arbitrages/${id}`, arbitrageData);
    return response.data;
  },

  // Delete an arbitrage opportunity
  deleteArbitrage: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/arbitrages/${id}`);
    return response.data;
  },

  // Get arbitrage statistics
  getArbitrageStats: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/arbitrages/stats?${params}`);
    return response.data;
  },

  // Import arbitrages from JSON data
  importArbitrages: async (arbitrageData) => {
    const response = await axios.post(`${API_BASE_URL}/arbitrages/import`, arbitrageData);
    return response.data;
  },

  // Add arbitrage opportunity to bets
  addArbitrageToBets: async (arbitrageId, options = {}) => {
    const response = await axios.post(`${API_BASE_URL}/arbitrages/${arbitrageId}/add-to-bets`, options);
    return response.data;
  },

  // Add arbitrage opportunity to bets using data (no ID required) with custom stakes
  addArbitrageDataToBets: async (arbitrageData, stakes = {}) => {
    const response = await axios.post(`${API_BASE_URL}/arbitrages/add-to-bets`, {
      ...arbitrageData,
      stakes: stakes  // Include custom stakes from modal
    });
    return response.data;
  }
};
