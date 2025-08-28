import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import AccountModal from '../components/AccountModal';
import { accountService } from '../services/accountApi';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  
  // Filters and search
  const [search, setSearch] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalAccounts, setTotalAccounts] = useState(0);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const filters = {
        page: page + 1,
        per_page: rowsPerPage,
        sort_by: 'created_at',
        sort_order: 'desc'
      };
      
      if (search) filters.search = search;
      if (accountTypeFilter) filters.account_type = accountTypeFilter;
      if (activeFilter) filters.is_active = activeFilter;
      
      const data = await accountService.getAccounts(filters);
      setAccounts(data.accounts);
      setTotalAccounts(data.pagination.total);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err.response?.data?.error || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, rowsPerPage, search, accountTypeFilter, activeFilter]);

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteAccount = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await accountService.deleteAccount(accountToDelete.id);
      setSuccess('Account deleted successfully');
      fetchAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleSubmitAccount = async (formData) => {
    try {
      if (modalMode === 'create') {
        await accountService.createAccount(formData);
      } else {
        await accountService.updateAccount(selectedAccount.id, formData);
      }
      
      setSuccess(`Account ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
      setModalOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error('Error submitting account:', err);
      setError(err.response?.data?.error || `Failed to ${modalMode} account`);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Account Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateAccount}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search accounts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Accounts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No accounts found</TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    {account.account_type === 'email' ? (
                      <EmailIcon color="primary" />
                    ) : (
                      <PhoneIcon color="secondary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={account.account_identifier}>
                      <span>{accountService.formatAccountDisplay(account.account_identifier)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{account.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={account.is_active ? 'Active' : 'Inactive'}
                      color={account.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(account.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditAccount(account)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAccount(account)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalAccounts}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Account Modal */}
      <AccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitAccount}
        account={selectedAccount}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the account "{accountToDelete?.account_identifier}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountsPage;
