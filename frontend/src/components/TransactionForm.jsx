import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  InputAdornment,
} from '@mui/material';
import { transactionService } from '../services/transactionApi.js';
import { accountService } from '../services/accountApi.js';

const TransactionForm = ({ open, onClose, transaction, onSaved }) => {
  const [formData, setFormData] = useState({
    transaction_type: transaction?.transaction_type || 'deposit',
    sportsbook: transaction?.sportsbook || '',
    account: transaction?.account || '',
    amount: transaction?.amount || '',
    tax: transaction?.tax || '',
    transaction_charges: transaction?.transaction_charges || '',
    payment_method: transaction?.payment_method || '',
    reference_id: transaction?.reference_id || '',
    status: transaction?.status || 'completed',
    notes: transaction?.notes || ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Fetch accounts when component mounts
  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const data = await accountService.getActiveAccounts({
        per_page: 100, // Get plenty of accounts for dropdown
        sort_by: 'name',
        sort_order: 'asc'
      });
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAccounts();
    }
  }, [open]);

  const sportsbooks = [
    'DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet',
    'WynnBET', 'BetRivers', 'Unibet', 'FOX Bet', 'Barstool',
    'Hard Rock Bet', 'ESPN BET', 'bet365', 'Other'
  ];

  const paymentMethods = [
    'Bank Transfer', 'Credit Card', 'Debit Card', 'PayPal',
    'Crypto', 'Check', 'Cash App', 'Venmo', 'Skrill', 'Other'
  ];

  const statuses = [
    'pending', 'completed', 'failed', 'cancelled'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.transaction_type) {
      newErrors.transaction_type = 'Transaction type is required';
    }

    if (!formData.sportsbook) {
      newErrors.sportsbook = 'Sportsbook is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (formData.tax && parseFloat(formData.tax) < 0) {
      newErrors.tax = 'Tax cannot be negative';
    }

    if (formData.transaction_charges && parseFloat(formData.transaction_charges) < 0) {
      newErrors.transaction_charges = 'Transaction charges cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        tax: formData.tax ? parseFloat(formData.tax) : 0,
        transaction_charges: formData.transaction_charges ? parseFloat(formData.transaction_charges) : 0
      };

      if (transaction) {
        await transactionService.updateTransaction(transaction.id, transactionData);
      } else {
        await transactionService.createTransaction(transactionData);
      }

      onSaved();
      onClose();
      
      // Reset form
      setFormData({
        transaction_type: 'deposit',
        sportsbook: '',
        amount: '',
        tax: '',
        transaction_charges: '',
        payment_method: '',
        reference_id: '',
        status: 'completed',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({ submit: 'Failed to save transaction. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {transaction ? 'Edit Transaction' : 'Add New Transaction'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth error={!!errors.transaction_type}>
              <InputLabel>Transaction Type *</InputLabel>
              <Select
                value={formData.transaction_type}
                onChange={handleInputChange('transaction_type')}
                label="Transaction Type *"
              >
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="withdrawal">Withdrawal</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth error={!!errors.sportsbook}>
              <InputLabel>Sportsbook *</InputLabel>
              <Select
                value={formData.sportsbook}
                onChange={handleInputChange('sportsbook')}
                label="Sportsbook *"
              >
                {sportsbooks.map((sportsbook) => (
                  <MenuItem key={sportsbook} value={sportsbook}>
                    {sportsbook}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth error={!!errors.account}>
              <InputLabel>Account</InputLabel>
              <Select
                value={formData.account}
                onChange={handleInputChange('account')}
                label="Account"
              >
                <MenuItem value="">
                  <em>No Account Selected</em>
                </MenuItem>
                {loadingAccounts ? (
                  <MenuItem disabled>
                    Loading accounts...
                  </MenuItem>
                ) : (
                  accounts.map((account) => (
                    <MenuItem key={account.id} value={account.account_identifier}>
                      {account.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.account && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {errors.account}
                </Box>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Amount *"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Tax"
              type="number"
              step="0.01"
              value={formData.tax}
              onChange={handleInputChange('tax')}
              error={!!errors.tax}
              helperText={errors.tax || "Tax amount (leave empty for no tax)"}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Transaction Charges"
              type="number"
              step="0.01"
              value={formData.transaction_charges}
              onChange={handleInputChange('transaction_charges')}
              error={!!errors.transaction_charges}
              helperText={errors.transaction_charges || "Processing fees or charges (leave empty for no charges)"}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.payment_method}
                onChange={handleInputChange('payment_method')}
                label="Payment Method"
              >
                <MenuItem value="">None</MenuItem>
                {paymentMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Reference ID"
              value={formData.reference_id}
              onChange={handleInputChange('reference_id')}
              helperText="Transaction reference from sportsbook"
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleInputChange('status')}
                label="Status"
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleInputChange('notes')}
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : transaction ? 'Update' : 'Add'} Transaction
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionForm;
