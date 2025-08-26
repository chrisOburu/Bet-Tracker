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
  InputLabel
} from '@mui/material';
import ArbitrageRow from './ArbitrageRow';

const ArbitrageTable = ({ data, loading, error, pagination, onPageChange, onLimitChange }) => {
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  // Handle accordion state changes
  const handleAccordionChange = (signature, isExpanded) => {
    setExpandedAccordion(isExpanded ? signature : null);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setExpandedAccordion(null); // Close any open accordions when changing pages
    onPageChange(newPage + 1); // Material-UI uses 0-based indexing, but our API uses 1-based
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setExpandedAccordion(null); // Close any open accordions
    onLimitChange(1, newLimit); // Reset to first page with new limit
  };

  // Group data by match signature for display
  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const groups = {};
    
    // Group by match_signature
    data.forEach((opportunity, originalIndex) => {
      const signature = opportunity.match_info?.match_signature || opportunity.match_signature || `unknown_${originalIndex}`;
      
      if (!groups[signature]) {
        groups[signature] = [];
      }
      
      groups[signature].push({
        ...opportunity,
        originalIndex
      });
    });

    // Convert to array and sort each group by arbitrage percentage (highest first)
    const groupedArray = Object.entries(groups).map(([signature, opportunities]) => {
      const sortedOpportunities = opportunities.sort((a, b) => 
        (b.arbitrage_percentage || -100) - (a.arbitrage_percentage || -100)
      );

      return {
        signature,
        opportunities: sortedOpportunities,
        bestArbitrage: sortedOpportunities[0].arbitrage_percentage,
        totalOpportunities: sortedOpportunities.length
      };
    });

    return groupedArray.sort((a, b) => (b.bestArbitrage || -100) - (a.bestArbitrage || -100));
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading arbitrage opportunities...
        </Typography>
      </Box>
    );
  }

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
        <Typography variant="h6" sx={{ color: '#6c757d' }}>
          No arbitrage opportunities found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Updated Pagination Info at Top */}
      {/* <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2, 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <Typography variant="body2" sx={{ color: '#495057' }}>
          Showing {groupedData.length} match groups (Page {pagination.currentPage} of {pagination.totalPages})
          <br />
          <Typography component="span" variant="caption" sx={{ color: '#6c757d' }}>
            {pagination.totalOpportunities} total arbitrage opportunities across {pagination.totalItems} matches
          </Typography>
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Matches per page</InputLabel>
          <Select
            value={pagination.itemsPerPage}
            onChange={handleChangeRowsPerPage}
            label="Matches per page"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box> */}

      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Table sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 'bold', color: '#495057', padding: '12px 8px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>
                Profit
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#495057', padding: '12px 8px', borderBottom: '2px solid #dee2e6' }}>
                Bookmaker
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#495057', padding: '12px 8px', borderBottom: '2px solid #dee2e6' }}>
                Time
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#495057', padding: '12px 8px', borderBottom: '2px solid #dee2e6', width: '25%' }}>
                Event
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#495057', padding: '12px 8px', borderBottom: '2px solid #dee2e6', width: '20%' }}>
                Market
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#495057', padding: '12px 8px', borderBottom: '2px solid #dee2e6' }}>
                Odds
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#495057', padding: '12px 8px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#495057', padding: '12px 8px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {groupedData.map((group, groupIndex) => (
              <ArbitrageRow 
                key={`arbitrage-group-${group.signature}-${pagination.currentPage}-${groupIndex}`}
                opportunities={group.opportunities}
                groupIndex={groupIndex}
                expandedAccordion={expandedAccordion}
                onAccordionChange={handleAccordionChange}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Updated Backend Pagination Controls */}
      <TablePagination
        component="div"
        count={pagination.totalItems} // Total match groups
        page={pagination.currentPage - 1} // Material-UI uses 0-based indexing
        onPageChange={handleChangePage}
        rowsPerPage={pagination.itemsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ 
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6'
        }}
        labelRowsPerPage="Matches per page:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} of ${count} match groups`
        }
      />
    </Box>
  );
};

export default ArbitrageTable;