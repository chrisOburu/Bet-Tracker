import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const sportsbookService = {
  // Get all sportsbooks with filtering and pagination
  getSportsbooks: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_BASE_URL}/sportsbooks?${params}`);
    return response.data;
  },

  // Get active sportsbooks for dropdowns
  getActiveSportsbooks: async () => {
    const response = await axios.get(`${API_BASE_URL}/sportsbooks/active`);
    return response.data;
  },

  // Get a specific sportsbook by ID
  getSportsbook: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/sportsbooks/${id}`);
    return response.data;
  },

  // Create a new sportsbook
  createSportsbook: async (sportsbookData) => {
    const response = await axios.post(`${API_BASE_URL}/sportsbooks`, sportsbookData);
    return response.data;
  },

  // Update a sportsbook
  updateSportsbook: async (id, sportsbookData) => {
    const response = await axios.put(`${API_BASE_URL}/sportsbooks/${id}`, sportsbookData);
    return response.data;
  },

  // Delete a sportsbook
  deleteSportsbook: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/sportsbooks/${id}`);
    return response.data;
  },

  // Toggle sportsbook active status
  toggleSportsbookActive: async (id) => {
    const response = await axios.patch(`${API_BASE_URL}/sportsbooks/${id}/toggle-active`);
    return response.data;
  },

  // Bulk create sportsbooks
  bulkCreateSportsbooks: async (sportsbooks) => {
    const response = await axios.post(`${API_BASE_URL}/sportsbooks/bulk-create`, {
      sportsbooks: sportsbooks
    });
    return response.data;
  },

  // Get sportsbook statistics
  getSportsbookStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/sportsbooks/stats`);
    return response.data;
  },

  // Validation utilities
  validateSportsbook: (sportsbook) => {
    const errors = {};

    if (!sportsbook.name || sportsbook.name.trim().length === 0) {
      errors.name = 'Sportsbook name is required';
    } else if (sportsbook.name.trim().length > 100) {
      errors.name = 'Sportsbook name must be 100 characters or less';
    }

    if (sportsbook.display_name && sportsbook.display_name.length > 100) {
      errors.display_name = 'Display name must be 100 characters or less';
    }

    if (sportsbook.website_url && sportsbook.website_url.length > 500) {
      errors.website_url = 'Website URL must be 500 characters or less';
    }

    if (sportsbook.logo_url && sportsbook.logo_url.length > 500) {
      errors.logo_url = 'Logo URL must be 500 characters or less';
    }

    if (sportsbook.country && sportsbook.country.length > 100) {
      errors.country = 'Country must be 100 characters or less';
    }

    // Basic URL validation
    if (sportsbook.website_url && sportsbook.website_url.trim()) {
      try {
        new URL(sportsbook.website_url);
      } catch {
        errors.website_url = 'Please enter a valid URL';
      }
    }

    if (sportsbook.logo_url && sportsbook.logo_url.trim()) {
      try {
        new URL(sportsbook.logo_url);
      } catch {
        errors.logo_url = 'Please enter a valid URL';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Format sportsbook display name
  formatSportsbookDisplay: (sportsbook) => {
    if (!sportsbook) return 'Unknown Sportsbook';
    return sportsbook.display_name || sportsbook.name || 'Unknown Sportsbook';
  }
};
