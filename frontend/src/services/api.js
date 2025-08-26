import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const betService = {
  // Get all bets
  getBets: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.sport) params.append('sport', filters.sport);
    
    return api.get(`/bets?${params.toString()}`);
  },

  // Create a new bet
  createBet: (betData) => {
    return api.post('/bets', betData);
  },

  // Update a bet
  updateBet: (betId, betData) => {
    return api.put(`/bets/${betId}`, betData);
  },

  // Delete a bet
  deleteBet: (betId) => {
    return api.delete(`/bets/${betId}`);
  },

  // Get statistics
  getStats: () => {
    return api.get('/stats');
  },
};

export default api;
