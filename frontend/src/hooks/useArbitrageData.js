import { useState, useEffect, useCallback } from 'react';
import { arbitrageService } from '../services/arbitrageApi.js';
import { getStoredMatchesPerPage, setStoredMatchesPerPage } from '../utils/localStorage.js';

export const useArbitrageData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [matchDetails, setMatchDetails] = useState({}); // Store detailed match data
  const [loadingMatches, setLoadingMatches] = useState({}); // Track loading state for individual matches
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0, // This will be total match groups
    itemsPerPage: getStoredMatchesPerPage(10), // Load from localStorage
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

  // Function to update matches per page and store in localStorage
  const updateMatchesPerPage = useCallback((newLimit) => {
    setStoredMatchesPerPage(newLimit);
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newLimit
    }));
  }, []);

  const fetchData = useCallback(async (page = 1, limit = getStoredMatchesPerPage(10), filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching page ${page} with limit ${limit} match groups`);
      
      // Build filters for grouped endpoint
      const apiFilters = {
        page: page,
        per_page: limit,
        sort_by: filters.sortBy || 'profit',
        sort_order: filters.sortOrder || 'desc',
        ...filters
      };

      // Fetch grouped data and stats
      const [groupedResponse, statsData] = await Promise.all([
        arbitrageService.getGroupedArbitrages(apiFilters),
        arbitrageService.getArbitrageStats(apiFilters)
      ]);
      
      console.log('Raw API Response:', groupedResponse); // Debug log
      console.log('Stats Response:', statsData); // Debug log
      
      // Validate response structure
      if (!groupedResponse || !groupedResponse.groups || !Array.isArray(groupedResponse.groups)) {
        console.warn('Invalid grouped response structure:', groupedResponse);
        console.warn('Response type:', typeof groupedResponse);
        console.warn('Response keys:', groupedResponse ? Object.keys(groupedResponse) : 'null/undefined');
        setData([]);
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
          totalOpportunities: 0
        });
        return;
      }
      
      console.log('Groups found:', groupedResponse.groups.length);
      
      // If no data from API, use test data
      if (groupedResponse.groups.length === 0) {
        console.log('No data from API, using test data');
        const testData = [
          {
            arbitrage_percentage: 2.5,
            match_signature: 'Manchester United vs Arsenal - Match Result',
            league: 'Premier League',
            country: 'England',
            kickoff_datetime: new Date(Date.now() + 24*60*60*1000).toISOString(),
            match_info: {
              match_signature: 'Manchester United vs Arsenal - Match Result',
              kickoff_datetime: new Date(Date.now() + 24*60*60*1000).toISOString(),
              matches_by_site: {}
            },
            combination_details: [
              {'name': '1', 'bookmaker': 'Bet365', 'odds': 2.5},
              {'name': 'X', 'bookmaker': 'William Hill', 'odds': 3.2},
              {'name': '2', 'bookmaker': 'Ladbrokes', 'odds': 2.8}
            ],
            total_arbitrages: 3,
            profit_range: { min: 2.5, max: 4.2 },
            markets_count: 2,
            markets: ['Match Result', 'Total Goals']
          },
          {
            arbitrage_percentage: 1.8,
            match_signature: 'Barcelona vs Real Madrid - Total Goals',
            league: 'La Liga',
            country: 'Spain',
            kickoff_datetime: new Date(Date.now() + 48*60*60*1000).toISOString(),
            match_info: {
              match_signature: 'Barcelona vs Real Madrid - Total Goals',
              kickoff_datetime: new Date(Date.now() + 48*60*60*1000).toISOString(),
              matches_by_site: {}
            },
            combination_details: [
              {'name': 'Over 2.5', 'bookmaker': 'Betfair', 'odds': 1.9},
              {'name': 'Under 2.5', 'bookmaker': 'Coral', 'odds': 2.1}
            ],
            total_arbitrages: 2,
            profit_range: { min: 1.8, max: 2.1 },
            markets_count: 1,
            markets: ['Total Goals']
          }
        ];
        
        setData(testData);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: testData.length,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
          totalOpportunities: testData.length
        });
        setStats({
          totalOpportunities: testData.length,
          bestProfit: 2.5,
          profitableCount: testData.length,
          recentOpportunities: testData.length
        });
        setLastFetch(new Date());
        return;
      }
      
      // Transform grouped data to match expected frontend structure - optimized version
      const transformedData = groupedResponse.groups.map(group => {
        const bestArbitrage = group.best_arbitrage || {};
        
        // Extract league and country from combination_details
        let league = 'Unknown';
        let country = 'Unknown';
        
        try {
          const combinationDetails = typeof bestArbitrage.combination_details === 'string' 
            ? JSON.parse(bestArbitrage.combination_details) 
            : (bestArbitrage.combination_details || []);
          
          if (combinationDetails.length > 0) {
            league = combinationDetails[0].league || 'Unknown';
            country = combinationDetails[0].country || 'Unknown';
          }
        } catch (error) {
          console.warn('Error parsing combination_details:', error);
        }
        
        // Create a structured data format without all_arbitrages
        return {
          arbitrage_percentage: bestArbitrage.profit || 0,
          match_signature: group.match_signature || '',
          league: league,
          country: country,
          kickoff_datetime: bestArbitrage.kickoff_datetime || null,
          match_info: {
            match_signature: group.match_signature || '',
            kickoff_datetime: bestArbitrage.kickoff_datetime || null,
            matches_by_site: {}
          },
          combination_details: typeof bestArbitrage.combination_details === 'string' 
            ? JSON.parse(bestArbitrage.combination_details) 
            : (bestArbitrage.combination_details || []),
          // Only store summary info about additional opportunities
          total_arbitrages: group.total_arbitrages || 0,
          profit_range: {
            min: group.min_profit,
            max: group.max_profit
          },
          markets_count: group.markets_count || 0,
          markets: group.markets || []
        };
      });
      
      setData(transformedData);
      
      // Transform pagination data
      setPagination({
        currentPage: groupedResponse.pagination.page,
        totalPages: groupedResponse.pagination.total_pages,
        totalItems: groupedResponse.pagination.total_groups,
        itemsPerPage: groupedResponse.pagination.per_page,
        hasNextPage: groupedResponse.pagination.has_next,
        hasPrevPage: groupedResponse.pagination.has_prev,
        totalOpportunities: transformedData.reduce((sum, group) => sum + group.total_arbitrages, 0)
      });
      
      setLastFetch(new Date());

      // Transform stats
      setStats({
        totalOpportunities: statsData.total_opportunities || 0,
        bestProfit: statsData.max_profit || 0,
        profitableCount: statsData.active_opportunities || 0,
        recentOpportunities: statsData.total_opportunities || 0
      });

    } catch (err) {
      setError(err.message);
      console.error('Error fetching arbitrage data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback((page, limit, filters) => {
    return fetchData(page, limit, filters);
  }, [fetchData]);

  const reloadData = useCallback(async () => {
    try {
      setLoading(true);
      // Simply refetch current page
      await fetchData(pagination.currentPage, pagination.itemsPerPage);
    } catch (err) {
      setError(err.message);
      console.error('Error reloading data:', err);
    }
  }, [fetchData, pagination.currentPage, pagination.itemsPerPage]);

  const fetchMatchArbitrages = useCallback(async (matchSignature) => {
    try {
      setLoadingMatches(prev => ({ ...prev, [matchSignature]: true }));
      
      // Check if we already have the data cached
      if (matchDetails[matchSignature]) {
        return matchDetails[matchSignature];
      }
      
      const response = await arbitrageService.getArbitragesByMatchSignature(matchSignature);
      
      if (!response || !response.arbitrages) {
        throw new Error('Invalid response from match arbitrages API');
      }
      
      // Transform the data to match frontend expectations
      const transformedArbitrages = response.arbitrages.map(arb => ({
        ...arb,
        arbitrage_percentage: arb.profit || 0,
        combination_details: typeof arb.combination_details === 'string' 
          ? JSON.parse(arb.combination_details) 
          : (arb.combination_details || [])
      }));
      
      const matchData = {
        arbitrages: transformedArbitrages,
        markets_data: response.markets_data || {},
        total_count: response.total_count || 0,
        max_profit: response.max_profit || 0,
        min_profit: response.min_profit || 0,
        markets: response.markets || [],
        match_info: response.match_info || {}
      };
      
      // Cache the data
      setMatchDetails(prev => ({
        ...prev,
        [matchSignature]: matchData
      }));
      
      return matchData;
      
    } catch (err) {
      console.error(`Error fetching arbitrages for match ${matchSignature}:`, err);
      throw err;
    } finally {
      setLoadingMatches(prev => ({ ...prev, [matchSignature]: false }));
    }
  }, [matchDetails]);

  const getMatchArbitrages = useCallback((matchSignature) => {
    return matchDetails[matchSignature] || null;
  }, [matchDetails]);

  const isMatchLoading = useCallback((matchSignature) => {
    return loadingMatches[matchSignature] || false;
  }, [loadingMatches]);

  const fetchTopOpportunities = useCallback(async (limit = 10) => {
    try {
      const response = await arbitrageService.getGroupedArbitrages({
        page: 1,
        per_page: limit,
        sort_by: 'profit',
        sort_order: 'desc'
      });
      return response.groups || [];
    } catch (err) {
      console.error('Error fetching top opportunities:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    // Initial fetch with stored preferences
    const storedLimit = getStoredMatchesPerPage(10);
    fetchData(1, storedLimit);

    // Set up interval to fetch every hour (3600000ms)
    const interval = setInterval(() => {
      fetchData(pagination.currentPage, pagination.itemsPerPage);
    }, 3600000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    lastFetch,
    pagination,
    stats,
    refetch,
    reloadData,
    fetchTopOpportunities,
    fetchMatchArbitrages,
    getMatchArbitrages,
    isMatchLoading,
    updateMatchesPerPage
  };
};
