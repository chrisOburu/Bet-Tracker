import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  Pagination,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { transactionService } from '../services/transactionApi.js';
import TransactionForm from '../components/TransactionForm.jsx';
import { getBookmakerLink } from '../utils/bookmakerMapper.js';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });
  
  // Filters
  const [filters, setFilters] = useState({
    type: '',
    sportsbook: '',
    status: '',
    start_date: '',
    end_date: ''
  });

  const sportsbooks = [
    'DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet',
    'WynnBET', 'BetRivers', 'Unibet', 'FOX Bet', 'Barstool',
    'Hard Rock Bet', 'ESPN BET', 'bet365', 'Other'
  ];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page
      };
      const [transactionsData, statsData] = await Promise.all([
        transactionService.getTransactions(queryParams),
        transactionService.getTransactionStats(filters)
      ]);
      
      // Handle the new paginated response format
      if (transactionsData.transactions) {
        setTransactions(transactionsData.transactions);
        setPagination(prev => ({
          ...prev,
          ...transactionsData.pagination
        }));
      } else {
        // Fallback for old format
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      }
      
      setStats(statsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.page]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleMenuOpen = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleEdit = () => {
    setEditingTransaction(selectedTransaction);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(selectedTransaction.id);
        fetchTransactions();
      } catch (err) {
        setError('Failed to delete transaction');
      }
    }
    handleMenuClose();
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTransaction(null);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      sportsbook: '',
      status: '',
      start_date: '',
      end_date: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    return type === 'deposit' ? 'success' : 'error';
  };

  if (loading && transactions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading transactions...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Add Transaction
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Total Deposits
                  </Typography>
                </Box>
                <Typography variant="h5" component="div">
                  ${stats.total_deposits.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stats.deposit_count} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Total Withdrawals
                  </Typography>
                </Box>
                <Typography variant="h5" component="div">
                  ${stats.total_withdrawals.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stats.withdrawal_count} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Net Position
                  </Typography>
                </Box>
                <Typography 
                  variant="h5" 
                  component="div"
                  color={stats.net_position >= 0 ? 'success.main' : 'error.main'}
                >
                  ${stats.net_position.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Withdrawals - Deposits - Fees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDownIcon color="warning" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Total Fees & Tax
                  </Typography>
                </Box>
                <Typography variant="h5" component="div" color="warning.main">
                  ${((stats.total_tax || 0) + (stats.total_charges || 0)).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tax: ${(stats.total_tax || 0).toLocaleString()} | Charges: ${(stats.total_charges || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={handleFilterChange('type')}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="withdrawal">Withdrawal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sportsbook</InputLabel>
              <Select
                value={filters.sportsbook}
                onChange={handleFilterChange('sportsbook')}
                label="Sportsbook"
              >
                <MenuItem value="">All</MenuItem>
                {sportsbooks.map((sb) => (
                  <MenuItem key={sb} value={sb}>{sb}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={handleFilterChange('status')}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={filters.start_date}
              onChange={handleFilterChange('start_date')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={filters.end_date}
              onChange={handleFilterChange('end_date')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button onClick={clearFilters} variant="outlined" fullWidth>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Sportsbook</TableCell>
              <TableCell>Account</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Tax</TableCell>
              <TableCell align="right">Transaction Charges</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reference ID</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{formatDateTime(transaction.date_created)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.transaction_type.toUpperCase()}
                      color={getTypeColor(transaction.transaction_type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.sportsbook}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        const url = getBookmakerLink(transaction.sportsbook);
                        if (url && url !== '#') {
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      sx={{ 
                        cursor: getBookmakerLink(transaction.sportsbook) !== '#' ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: getBookmakerLink(transaction.sportsbook) !== '#' ? 'primary.light' : 'inherit',
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={transaction.account_name || 'No account specified'} arrow>
                      <Typography variant="body2" color="textSecondary">
                        {transaction.account_name || 'N/A'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      color={transaction.transaction_type === 'deposit' ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {transaction.transaction_type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">${(transaction.tax || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">${(transaction.transaction_charges || 0).toFixed(2)}</TableCell>
                  <TableCell>{transaction.payment_method || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.status.toUpperCase()}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.reference_id || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, transaction)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination and Summary */}
      {!loading && transactions.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} transactions
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

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={formOpen}
        onClose={handleFormClose}
        transaction={editingTransaction}
        onSaved={fetchTransactions}
      />
    </Box>
  );
};

export default Transactions;
