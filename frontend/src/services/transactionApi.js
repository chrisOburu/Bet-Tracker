import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const transactionService = {
  // Get all transactions
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/transactions?${params}`);
    return response.data;
  },

  // Create a new transaction
  createTransaction: async (transactionData) => {
    const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData);
    return response.data;
  },

  // Update a transaction
  updateTransaction: async (id, transactionData) => {
    const response = await axios.put(`${API_BASE_URL}/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete a transaction
  deleteTransaction: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/transactions/${id}`);
    return response.data;
  },

  // Get transaction statistics
  getTransactionStats: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/transactions/stats?${params}`);
    return response.data;
  }
};
