import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { betService } from '../services/api';

const SettleBetDialog = ({ open, onClose, bet, onSettled }) => {
  const [status, setStatus] = useState('');
  const [actualPayout, setActualPayout] = useState('');

  const handleSettle = async () => {
    try {
      const updateData = { status };
      
      if (status === 'won' && actualPayout) {
        updateData.actual_payout = parseFloat(actualPayout);
      }

      await betService.updateBet(bet.id, updateData);
      onSettled();
      onClose();
      
      // Reset form
      setStatus('');
      setActualPayout('');
    } catch (error) {
      console.error('Error settling bet:', error);
    }
  };

  const handleClose = () => {
    setStatus('');
    setActualPayout('');
    onClose();
  };

  if (!bet) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settle Bet</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1"><strong>Event:</strong> {bet.event_name}</Typography>
          <Typography variant="subtitle1"><strong>Selection:</strong> {bet.selection}</Typography>
          <Typography variant="subtitle1"><strong>Stake:</strong> ${bet.stake}</Typography>
          <Typography variant="subtitle1"><strong>Potential Payout:</strong> ${bet.potential_payout}</Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Result</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Result"
          >
            <MenuItem value="won">Won</MenuItem>
            <MenuItem value="lost">Lost</MenuItem>
            <MenuItem value="void">Void/Push</MenuItem>
          </Select>
        </FormControl>

        {status === 'won' && (
          <TextField
            fullWidth
            label="Actual Payout (optional)"
            type="number"
            step="0.01"
            value={actualPayout}
            onChange={(e) => setActualPayout(e.target.value)}
            helperText={`Leave empty to use potential payout ($${bet.potential_payout})`}
          />
        )}

        {status && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6">
              {status === 'won' && `Profit: $${((actualPayout || bet.potential_payout) - bet.stake).toFixed(2)}`}
              {status === 'lost' && `Loss: -$${bet.stake}`}
              {status === 'void' && `Refund: $${bet.stake}`}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSettle} 
          variant="contained" 
          disabled={!status}
        >
          Settle Bet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettleBetDialog;
