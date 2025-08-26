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

    // Data is already grouped from the backend, transform for display
    return data.map((group, index) => ({
      signature: group.match_signature,
      opportunities: group.all_opportunities || [group], // Use all_opportunities if available, fallback to single item
      bestArbitrage: group.arbitrage_percentage,
      totalOpportunities: group.total_opportunities || 1
    }));
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
