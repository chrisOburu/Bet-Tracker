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
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { betService } from '../services/api';
import BetForm from '../components/BetForm';
import SettleBetDialog from '../components/SettleBetDialog';

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
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bet: null });

  useEffect(() => {
    fetchBets();
  }, [filters]);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const response = await betService.getBets(filters);
      setBets(response.data);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
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
      setDeleteDialog({ open: false, bet: null });
    } catch (error) {
      console.error('Error deleting bet:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'won': return 'success';
      case 'lost': return 'error';
      case 'void': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const uniqueSports = [...new Set(bets.map(bet => bet.sport))];

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
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="won">Won</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
                <MenuItem value="void">Void</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sport</InputLabel>
              <Select
                value={filters.sport}
                onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value }))}
                label="Sport"
              >
                <MenuItem value="">All</MenuItem>
                {uniqueSports.map((sport) => (
                  <MenuItem key={sport} value={sport}>
                    {sport}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => setFilters({ status: '', sport: '' })}
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
              <TableCell>Date</TableCell>
              <TableCell>Sport</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Selection</TableCell>
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
                <TableCell colSpan={10} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : bets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No bets found
                </TableCell>
              </TableRow>
            ) : (
              bets.map((bet) => (
                <TableRow key={bet.id} hover>
                  <TableCell>{formatDate(bet.date_placed)}</TableCell>
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
                      label={bet.status}
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
        {selectedBet?.status === 'pending' && (
          <MenuItem onClick={handleSettle}>
            <CheckIcon sx={{ mr: 1 }} />
            Settle
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
        onSubmit={fetchBets}
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
        onSettled={fetchBets}
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
