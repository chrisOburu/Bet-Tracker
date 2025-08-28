import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { accountService } from '../services/accountApi';

const AccountModal = ({ open, onClose, onSubmit, account, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    account_identifier: '',
    account_type: 'email',
    name: '',
    is_active: true,
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account && mode === 'edit') {
      setFormData({
        account_identifier: account.account_identifier || '',
        account_type: account.account_type || 'email',
        name: account.name || '',
        is_active: account.is_active ?? true,
        notes: account.notes || ''
      });
    } else {
      setFormData({
        account_identifier: '',
        account_type: 'email',
        name: '',
        is_active: true,
        notes: ''
      });
    }
    setErrors({});
  }, [account, mode, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const validation = accountService.validateAccount(formData.account_identifier);
    if (!validation.isValid) {
      newErrors.account_identifier = validation.error;
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleDetectType = () => {
    const identifier = formData.account_identifier;
    if (identifier) {
      const detectedType = accountService.detectAccountType(identifier);
      setFormData(prev => ({ ...prev, account_type: detectedType }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Add New Account' : 'Edit Account'}
        </DialogTitle>
        <DialogContent>
          <TextField
            name="account_identifier"
            label="Email or Phone Number"
            value={formData.account_identifier}
            onChange={handleChange}
            onBlur={handleDetectType}
            fullWidth
            margin="normal"
            required
            error={!!errors.account_identifier}
            helperText={errors.account_identifier}
            placeholder="user@example.com or +1234567890"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Account Type</InputLabel>
            <Select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              label="Account Type"
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            name="name"
            label="Display Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
            placeholder="John Doe"
          />
          
          <TextField
            name="notes"
            label="Notes (Optional)"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            placeholder="Additional notes about this account..."
          />
          
          <FormControlLabel
            control={
              <Switch
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
            }
            label="Active Account"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {mode === 'create' ? 'Add Account' : 'Update Account'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AccountModal;
