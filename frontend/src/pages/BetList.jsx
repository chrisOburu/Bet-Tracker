import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { betService } from '../services/api.js';
import BetForm from '../components/BetForm.jsx';
import SettleBetDialog from '../components/SettleBetDialog.jsx';
import { getBookmakerLink } from '../utils/bookmakerMapper.js';

const BetList = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBetForm, setShowBetForm] = useState(false);
  const [editingBet, setEditingBet] = useState(null);
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [settlingBet, setSettlingBet] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    sport: '',
    sportsbook: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    sports: [],
    sportsbooks: []
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bet: null });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchBets();
  }, [filters, pagination.page]);

  const fetchFilterOptions = async () => {
    try {
      const response = await betService.getFilterOptions();
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchBets = async () => {
    try {
      setLoading(true);
      const queryParams = {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page
      };
      const response = await betService.getBets(queryParams);
      setBets(response.data.bets);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBetFormSubmit = () => {
    fetchBets();
    fetchFilterOptions(); // Refresh filter options when bets change
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleMenuOpen = (event, bet) => {
    setAnchorEl(event.currentTarget);
    setSelectedBet(bet);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBet(null);
  };

  const handleEdit = () => {
    setEditingBet(selectedBet);
    setShowBetForm(true);
    handleMenuClose();
  };

  const handleSettle = () => {
    setSettlingBet(selectedBet);
    setShowSettleDialog(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialog({ open: true, bet: selectedBet });
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await betService.deleteBet(deleteDialog.bet.id);
      fetchBets();
      fetchFilterOptions(); // Refresh filter options when bet is deleted
      setDeleteDialog({ open: false, bet: null });
    } catch (error) {
      console.error('Error deleting bet:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'won': return 'success';
      case 'half_won': return 'success';
      case 'lost': return 'error';
      case 'half_lost': return 'error';
      case 'void': return 'warning';
      default: return 'default';
    }
  };

  const getStatusAbbreviation = (status) => {
    switch (status) {
      case 'won': return 'W';
      case 'half_won': return 'HW';
      case 'lost': return 'L';
      case 'half_lost': return 'HL';
      case 'void': return 'V';
      case 'pending': return 'P';
      default: return status?.charAt(0)?.toUpperCase() || 'P';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" className="text-2xl font-bold">
          My Bets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowBetForm(true)}
        >
          Add Bet
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterIcon color="action" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, status: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="won">Won</MenuItem>
                <MenuItem value="half_won">Half Won</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
                <MenuItem value="half_lost">Half Lost</MenuItem>
                <MenuItem value="void">Void</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sport</InputLabel>
              <Select
                value={filters.sport}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, sport: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                label="Sport"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.sports.map((sport) => (
                  <MenuItem key={sport} value={sport}>
                    {sport}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sportsbook</InputLabel>
              <Select
                value={filters.sportsbook}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, sportsbook: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                label="Sportsbook"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.sportsbooks.map((sportsbook) => (
                  <MenuItem key={sportsbook} value={sportsbook}>
                    {sportsbook}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => {
                setFilters({ status: '', sport: '', sportsbook: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bets Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Sport</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Selection</TableCell>
              <TableCell>Sportsbook</TableCell>
              <TableCell>Kickoff</TableCell>
              <TableCell align="right">Odds</TableCell>
              <TableCell align="right">Stake</TableCell>
              <TableCell align="right">Potential</TableCell>
              <TableCell align="right">P&L</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : bets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  No bets found
                </TableCell>
              </TableRow>
            ) : (
              bets.map((bet) => (
                <TableRow key={bet.id} hover>
                  <TableCell>
                    {(() => {
                      const dateTime = formatDateTime(bet.date_placed);
                      return (
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {dateTime.date}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {dateTime.time}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Chip label={bet.sport} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {bet.event_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {bet.bet_type}
                    </Typography>
                  </TableCell>
                  <TableCell>{bet.selection}</TableCell>
                  <TableCell>
                    <Chip 
                      label={bet.sportsbook} 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                      onClick={() => {
                        const url = getBookmakerLink(bet.sportsbook);
                        if (url && url !== '#') {
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      sx={{ 
                        cursor: getBookmakerLink(bet.sportsbook) !== '#' ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: getBookmakerLink(bet.sportsbook) !== '#' ? 'primary.light' : 'inherit',
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {bet.kickoff ? (
                      (() => {
                        const kickoffDateTime = formatDateTime(bet.kickoff);
                        return (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {kickoffDateTime.date}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {kickoffDateTime.time}
                            </Typography>
                          </Box>
                        );
                      })()
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        TBD
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{bet.odds}</TableCell>
                  <TableCell align="right">{formatCurrency(bet.stake)}</TableCell>
                  <TableCell align="right">{formatCurrency(bet.potential_payout)}</TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      color: bet.profit_loss > 0 ? 'success.main' : 
                             bet.profit_loss < 0 ? 'error.main' : 'text.primary' 
                    }}
                  >
                    {bet.status === 'pending' ? '-' : formatCurrency(bet.profit_loss)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusAbbreviation(bet.status)}
                      color={getStatusColor(bet.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, bet)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination and Summary */}
      {!loading && bets.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} bets
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="medium"
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {selectedBet?.status !== undefined && (
          <MenuItem onClick={handleSettle}>
            <CheckIcon sx={{ mr: 1 }} />
            {selectedBet?.status === 'pending' ? 'Settle' : 'Re-settle'}
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Bet Form Dialog */}
      <BetForm
        open={showBetForm}
        onClose={() => {
          setShowBetForm(false);
          setEditingBet(null);
        }}
        onSubmit={handleBetFormSubmit}
        bet={editingBet}
      />

      {/* Settle Bet Dialog */}
      <SettleBetDialog
        open={showSettleDialog}
        onClose={() => {
          setShowSettleDialog(false);
          setSettlingBet(null);
        }}
        bet={settlingBet}
        onSettled={handleBetFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, bet: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this bet? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, bet: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BetList;
