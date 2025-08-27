import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableContainer, 
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button
} from '@mui/material';
import ArbitrageRow from './ArbitrageRow';

const ArbitrageTable = ({ 
  data, 
  loading, 
  error, 
  pagination, 
  onPageChange, 
  onLimitChange,
  fetchMatchArbitrages,
  getMatchArbitrages,
  isMatchLoading,
  expandedMatch,
  onMatchExpand,
  onBackToList
}) => {
  // Handle expanding a match - this will replace the table view
  const handleMatchExpand = async (matchSignature) => {
    try {
      // Fetch detailed arbitrages for this match if not already loaded
      if (!getMatchArbitrages(matchSignature)) {
        await fetchMatchArbitrages(matchSignature);
      }
      onMatchExpand(matchSignature);
    } catch (error) {
      console.error('Failed to expand match:', error);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1); // Material-UI uses 0-based indexing, but our API uses 1-based
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    onLimitChange(1, newLimit); // Reset to first page with new limit
  };

  // Transform data for display - data is now individual opportunities, not groups
  const displayData = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Data is already in the format we need (individual opportunities with summary info)
    return data;
  }, [data]);

  // Get expanded match data if we're in expanded view
  const expandedMatchData = expandedMatch ? getMatchArbitrages(expandedMatch) : null;
  const isExpandedLoading = expandedMatch ? isMatchLoading(expandedMatch) : false;

  if (loading && !expandedMatch) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading arbitrage opportunities...
        </Typography>
      </Box>
    );
  }

  if (error && !expandedMatch) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">
          Error loading arbitrage data: {error}
        </Alert>
      </Box>
    );
  }

  // Render expanded match view
  if (expandedMatch) {
    if (isExpandedLoading) {
      return (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading match arbitrages...
          </Typography>
        </Box>
      );
    }

    if (!expandedMatchData) {
      return (
        <Box sx={{ mt: 3 }}>
          <Alert severity="error">
            Failed to load arbitrages for this match.
          </Alert>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        {/* Back button and match info */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="outlined"
              onClick={onBackToList}
              sx={{ mr: 2 }}
            >
              ← Back to All Matches
            </Button>
            <Typography variant="h6" component="span">
              {expandedMatchData.match_info?.home_team} vs {expandedMatchData.match_info?.away_team}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {expandedMatchData.total_count} arbitrage opportunities
          </Typography>
        </Box>

        {/* Expanded match table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px' }}>
                  Profit %
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px' }}>
                  Time
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', width: '25%' }}>
                  Event
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', width: '20%' }}>
                  Market
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px' }}>
                  Odds
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', textAlign: 'center' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', textAlign: 'center' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expandedMatchData.arbitrages.map((arbitrage, index) => (
                <ArbitrageRow 
                  key={`expanded-arbitrage-${arbitrage.id || index}`}
                  opportunity={arbitrage}
                  groupIndex={index}
                  expandedAccordion={null} // No accordion in expanded view
                  onAccordionChange={() => {}} // No accordion functionality
                  fetchMatchArbitrages={fetchMatchArbitrages}
                  getMatchArbitrages={getMatchArbitrages}
                  isMatchLoading={isMatchLoading}
                  isExpandedView={true} // Flag to disable accordion in row
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // Regular list view
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading data: {error}
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No arbitrage opportunities found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Table sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', textAlign: 'center' }}>
                Profit
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px' }}>
                Bookmaker
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px' }}>
                Time
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', width: '25%' }}>
                Event
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', width: '20%' }}>
                Market
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px' }}>
                Odds
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', textAlign: 'center' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', padding: '12px 8px', textAlign: 'center' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {displayData.map((opportunity, index) => (
              <ArbitrageRow 
                key={`arbitrage-opportunity-${opportunity.match_signature}-${pagination.currentPage}-${index}`}
                opportunity={opportunity}
                groupIndex={index}
                expandedAccordion={null} // No accordion in list view now
                onAccordionChange={() => {}} // No accordion functionality
                onMatchExpand={handleMatchExpand} // New prop for match expansion
                fetchMatchArbitrages={fetchMatchArbitrages}
                getMatchArbitrages={getMatchArbitrages}
                isMatchLoading={isMatchLoading}
                isExpandedView={false} // Flag to show expansion option
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Backend Pagination Controls */}
      <TablePagination
        component="div"
        count={pagination.totalItems} // Total match groups
        page={pagination.currentPage - 1} // Material-UI uses 0-based indexing
        onPageChange={handleChangePage}
        rowsPerPage={pagination.itemsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage="Matches per page:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} of ${count} match groups`
        }
      />
    </Box>
  );
};

export default ArbitrageTable;
