import { useState, useEffect, useCallback } from 'react';

export const useArbitrageData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0, // This will be total match groups
    itemsPerPage: 25,
    hasNextPage: false,
    hasPrevPage: false,
    totalOpportunities: 0 // This will be total individual opportunities
  });
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    bestProfit: 0,
    profitableCount: 0,
    recentOpportunities: 0
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchData = useCallback(async (page = 1, limit = 25, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching page ${page} with limit ${limit} match groups`); // Updated debug log
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: filters.sortBy || 'profit',
        sortOrder: filters.sortOrder || 'desc',
        minProfit: filters.minProfit || '0'
      });

      // Fetch from Flask backend
      const response = await fetch(`${API_BASE_URL}/arbitrage-opportunities?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      //console.log('Backend response (match groups):', result); // Updated debug log
      
      // Transform the data to match expected frontend structure
      const transformedData = result.data.map(item => {
        const profitValue = item.profit;

        // Create match_info structure from combination_details
        const matches_by_site = {};
        item.combination_details.forEach(detail => {
          if (!matches_by_site[detail.bookmaker]) {
            matches_by_site[detail.bookmaker] = [];
          }
          matches_by_site[detail.bookmaker].push({
            home_team: detail.home_team,
            away_team: detail.away_team,
            match_id: detail.match_id,
            league: detail.league,
            country: detail.country
          });
        });
        
        return {
          ...item,
          arbitrage_percentage: profitValue,
          match_info: {
            match_signature: item.match_signature,
            kickoff_datetime: item.kickoff_datetime,
            matches_by_site: matches_by_site
          }
        };
      });
      
      setData(transformedData);
      setPagination(result.pagination);
      setLastFetch(new Date());

      // Fetch stats if it's the first page
      if (page === 1) {
        fetchStats();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching arbitrage data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  const refetch = useCallback((page, limit, filters) => {
    return fetchData(page, limit, filters);
  }, [fetchData]);

  const reloadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reload-data`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Refresh current page after reload
        await fetchData(pagination.currentPage, pagination.itemsPerPage);
      } else {
        throw new Error('Failed to reload data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error reloading data:', err);
    }
  }, [fetchData, pagination.currentPage, pagination.itemsPerPage]);

  const fetchTopOpportunities = useCallback(async (limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/top-opportunities?limit=${limit}`);
      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching top opportunities:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    // Initial fetch only
    fetchData();

    // Set up interval to fetch every hour (3600000ms)
    const interval = setInterval(() => {
      fetchData(pagination.currentPage, pagination.itemsPerPage);
    }, 3600000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchData]); // Remove pagination dependency to prevent infinite loop

  return { 
    data, 
    loading, 
    error, 
    lastFetch,
    pagination,
    stats,
    refetch,
    reloadData,
    fetchTopOpportunities
  };
};