import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const accountService = {
  // Get all accounts
  getAccounts: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/accounts?${params}`);
    return response.data;
  },

  // Get a specific account by ID
  getAccount: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/accounts/${id}`);
    return response.data;
  },

  // Create a new account
  createAccount: async (accountData) => {
    const response = await axios.post(`${API_BASE_URL}/accounts`, accountData);
    return response.data;
  },

  // Update an account
  updateAccount: async (id, accountData) => {
    const response = await axios.put(`${API_BASE_URL}/accounts/${id}`, accountData);
    return response.data;
  },

  // Delete an account
  deleteAccount: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/accounts/${id}`);
    return response.data;
  },

  // Get account statistics
  getAccountStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/accounts/stats`);
    return response.data;
  },

  // Validate account identifier
  validateAccount: (identifier) => {
    if (!identifier || !identifier.trim()) {
      return { isValid: false, error: 'Account identifier is required' };
    }

    const trimmedIdentifier = identifier.trim();
    
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmedIdentifier)) {
      return { isValid: true, type: 'email' };
    }
    
    // Check if it's a phone number (basic validation)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (phoneRegex.test(trimmedIdentifier)) {
      return { isValid: true, type: 'phone' };
    }
    
    return { isValid: false, error: 'Must be a valid email or phone number' };
  },

  // Auto-detect account type
  detectAccountType: (identifier) => {
    const validation = accountService.validateAccount(identifier);
    return validation.isValid ? validation.type : 'email'; // Default to email
  },

  // Format account display (show last 3 characters)
  formatAccountDisplay: (identifier) => {
    if (!identifier) return 'N/A';
    if (identifier.length <= 3) return identifier;
    return '...' + identifier.slice(-3);
  },

  // Search accounts
  searchAccounts: async (searchTerm, filters = {}) => {
    const searchFilters = {
      ...filters,
      search: searchTerm,
      page: 1,
      per_page: 50
    };
    
    return await accountService.getAccounts(searchFilters);
  },

  // Get active accounts only
  getActiveAccounts: async (filters = {}) => {
    const activeFilters = {
      ...filters,
      is_active: 'true'
    };
    
    return await accountService.getAccounts(activeFilters);
  },

  // Get accounts by type
  getAccountsByType: async (accountType, filters = {}) => {
    const typeFilters = {
      ...filters,
      account_type: accountType
    };
    
    return await accountService.getAccounts(typeFilters);
  },

  // Bulk operations
  toggleAccountStatus: async (id, isActive) => {
    const response = await axios.put(`${API_BASE_URL}/accounts/${id}`, {
      is_active: isActive
    });
    return response.data;
  },

  // Export accounts (get all without pagination)
  exportAccounts: async (filters = {}) => {
    const exportFilters = {
      ...filters,
      per_page: 1000 // Get a large number for export
    };
    
    return await accountService.getAccounts(exportFilters);
  }
};

export default accountService;
