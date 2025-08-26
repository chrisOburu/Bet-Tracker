import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Grid,
} from '@mui/material';
import { betService } from '../services/api.js';

const BetForm = ({ open, onClose, onSubmit, bet = null }) => {
  const [formData, setFormData] = useState({
    sport: '',
    event_name: '',
    bet_type: '',
    selection: '',
    odds: '',
    stake: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bet) {
      setFormData({
        sport: bet.sport || '',
        event_name: bet.event_name || '',
        bet_type: bet.bet_type || '',
        selection: bet.selection || '',
        odds: bet.odds || '',
        stake: bet.stake || '',
        notes: bet.notes || '',
      });
    } else {
      setFormData({
        sport: '',
        event_name: '',
        bet_type: '',
        selection: '',
        odds: '',
        stake: '',
        notes: '',
      });
    }
    setErrors({});
  }, [bet, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sport) newErrors.sport = 'Sport is required';
    if (!formData.event_name) newErrors.event_name = 'Event name is required';
    if (!formData.bet_type) newErrors.bet_type = 'Bet type is required';
    if (!formData.selection) newErrors.selection = 'Selection is required';
    if (!formData.odds || isNaN(formData.odds) || parseFloat(formData.odds) <= 0) {
      newErrors.odds = 'Valid odds are required';
    }
    if (!formData.stake || isNaN(formData.stake) || parseFloat(formData.stake) <= 0) {
      newErrors.stake = 'Valid stake amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        odds: parseFloat(formData.odds),
        stake: parseFloat(formData.stake),
      };

      if (bet) {
        await betService.updateBet(bet.id, submitData);
      } else {
        await betService.createBet(submitData);
      }
      
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting bet:', error);
    }
  };

  const sports = [
    'Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer', 
    'Tennis', 'Golf', 'Boxing', 'MMA', 'Other'
  ];

  const betTypes = [
    'Moneyline', 'Point Spread', 'Over/Under', 'Prop Bet', 
    'Parlay', 'Teaser', 'Future', 'Other'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {bet ? 'Edit Bet' : 'Add New Bet'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="sport"
                label="Sport"
                value={formData.sport}
                onChange={handleChange}
                fullWidth
                error={!!errors.sport}
                helperText={errors.sport}
              >
                {sports.map((sport) => (
                  <MenuItem key={sport} value={sport}>
                    {sport}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="event_name"
                label="Event Name"
                value={formData.event_name}
                onChange={handleChange}
                fullWidth
                error={!!errors.event_name}
                helperText={errors.event_name}
                placeholder="e.g., Lakers vs Warriors"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="bet_type"
                label="Bet Type"
                value={formData.bet_type}
                onChange={handleChange}
                fullWidth
                error={!!errors.bet_type}
                helperText={errors.bet_type}
              >
                {betTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="selection"
                label="Selection"
                value={formData.selection}
                onChange={handleChange}
                fullWidth
                error={!!errors.selection}
                helperText={errors.selection}
                placeholder="e.g., Lakers +3.5"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="odds"
                label="Odds (Decimal)"
                value={formData.odds}
                onChange={handleChange}
                fullWidth
                type="number"
                step="0.01"
                error={!!errors.odds}
                helperText={errors.odds}
                placeholder="e.g., 1.91"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="stake"
                label="Stake Amount ($)"
                value={formData.stake}
                onChange={handleChange}
                fullWidth
                type="number"
                step="0.01"
                error={!!errors.stake}
                helperText={errors.stake}
                placeholder="e.g., 100"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Optional notes about this bet..."
              />
            </Grid>
            {formData.odds && formData.stake && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <strong>Potential Payout: ${(parseFloat(formData.odds || 0) * parseFloat(formData.stake || 0)).toFixed(2)}</strong>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {bet ? 'Update' : 'Add'} Bet
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BetForm;
