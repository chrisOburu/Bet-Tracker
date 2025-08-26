import { useState, useEffect, useCallback } from 'react';
import { arbitrageService } from '../services/arbitrageApi.js';

export const useArbitrageData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0, // This will be total match groups
    itemsPerPage: 10,
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

  const fetchData = useCallback(async (page = 1, limit = 10, filters = {}) => {
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
            all_opportunities: [
              {
                profit: 2.5,
                arbitrage_percentage: 2.5,
                league: 'Premier League',
                country: 'England',
                kickoff_datetime: new Date(Date.now() + 24*60*60*1000).toISOString(),
                match_signature: 'Manchester United vs Arsenal - Match Result',
                combination_details: [
                  {'name': '1', 'bookmaker': 'Bet365', 'odds': 2.5},
                  {'name': 'X', 'bookmaker': 'William Hill', 'odds': 3.2},
                  {'name': '2', 'bookmaker': 'Ladbrokes', 'odds': 2.8}
                ]
              }
            ],
            total_opportunities: 1,
            profit_range: { min: 2.5, max: 2.5 },
            markets_count: 1
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
            all_opportunities: [
              {
                profit: 1.8,
                arbitrage_percentage: 1.8,
                league: 'La Liga',
                country: 'Spain',
                kickoff_datetime: new Date(Date.now() + 48*60*60*1000).toISOString(),
                match_signature: 'Barcelona vs Real Madrid - Total Goals',
                combination_details: [
                  {'name': 'Over 2.5', 'bookmaker': 'Betfair', 'odds': 1.9},
                  {'name': 'Under 2.5', 'bookmaker': 'Coral', 'odds': 2.1}
                ]
              }
            ],
            total_opportunities: 1,
            profit_range: { min: 1.8, max: 1.8 },
            markets_count: 1
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
      
      // Transform grouped data to match expected frontend structure
      const transformedData = groupedResponse.groups.map(group => {
        const bestArbitrage = group.best_arbitrage || {};
        const allArbitrages = group.all_arbitrages || [];
        
        // Create a structured data format
        return {
          arbitrage_percentage: bestArbitrage.profit || 0,
          match_signature: group.match_signature || '',
          league: bestArbitrage.league || 'Unknown',
          country: bestArbitrage.country || 'Unknown',
          kickoff_datetime: bestArbitrage.kickoff_datetime || null, // Add kickoff at top level
          match_info: {
            match_signature: group.match_signature || '',
            kickoff_datetime: bestArbitrage.kickoff_datetime || null,
            matches_by_site: {}
          },
          combination_details: typeof bestArbitrage.combination_details === 'string' 
            ? JSON.parse(bestArbitrage.combination_details) 
            : (bestArbitrage.combination_details || []),
          // Store all arbitrages for this match signature
          all_opportunities: allArbitrages.map(arb => ({
            ...arb,
            arbitrage_percentage: arb.profit || 0,
            league: arb.league || bestArbitrage.league || 'Unknown',
            country: arb.country || bestArbitrage.country || 'Unknown',
            kickoff_datetime: arb.kickoff_datetime || bestArbitrage.kickoff_datetime || null,
            match_signature: arb.match_signature || group.match_signature,
            combination_details: typeof arb.combination_details === 'string' 
              ? JSON.parse(arb.combination_details) 
              : (arb.combination_details || [])
          })),
          total_opportunities: group.total_opportunities,
          profit_range: {
            min: group.min_profit,
            max: group.max_profit
          },
          markets_count: group.markets_count
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
        totalOpportunities: transformedData.reduce((sum, group) => sum + group.total_opportunities, 0)
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
    // Initial fetch only
    fetchData();

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
    fetchTopOpportunities
  };
};
