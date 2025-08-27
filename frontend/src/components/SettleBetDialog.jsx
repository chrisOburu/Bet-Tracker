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
import { betService } from '../services/api.js';

const SettleBetDialog = ({ open, onClose, bet, onSettled }) => {
  const [status, setStatus] = useState('');
  const [actualPayout, setActualPayout] = useState('');

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

  const handleSettle = async () => {
    try {
      const updateData = { status };
      
      if (status === 'won' && actualPayout) {
        updateData.actual_payout = parseFloat(actualPayout);
      } else if (status === 'half_won') {
        if (actualPayout) {
          updateData.actual_payout = parseFloat(actualPayout);
        } else {
          // For half win: get back stake + half the profit
          updateData.actual_payout = (bet.potential_payout + bet.stake) / 2;
        }
      } else if (status === 'half_lost') {
        // For half loss: lose half the stake, get back the other half
        updateData.actual_payout = bet.stake / 2;
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
          <Typography variant="subtitle1"><strong>Sportsbook:</strong> {bet.sportsbook}</Typography>
          {bet.kickoff && (
            <Typography variant="subtitle1"><strong>Kickoff:</strong> {formatDateTime(bet.kickoff)}</Typography>
          )}
          <Typography variant="subtitle1"><strong>Stake:</strong> ${bet.stake}</Typography>
          <Typography variant="subtitle1"><strong>Potential Payout:</strong> ${bet.potential_payout}</Typography>
          <Typography variant="subtitle1"><strong>Date Placed:</strong> {formatDateTime(bet.date_placed)}</Typography>
          {bet.date_settled && (
            <Typography variant="subtitle1"><strong>Date Settled:</strong> {formatDateTime(bet.date_settled)}</Typography>
          )}
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Result</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Result"
          >
            <MenuItem value="won">Won</MenuItem>
            <MenuItem value="half_won">Half Won</MenuItem>
            <MenuItem value="lost">Lost</MenuItem>
            <MenuItem value="half_lost">Half Lost</MenuItem>
            <MenuItem value="void">Void/Push</MenuItem>
          </Select>
        </FormControl>

        {(status === 'won' || status === 'half_won') && (
          <TextField
            fullWidth
            label="Actual Payout (optional)"
            type="number"
            step="0.01"
            value={actualPayout}
            onChange={(e) => setActualPayout(e.target.value)}
            helperText={`Leave empty to use ${status === 'half_won' ? 'calculated half win' : 'potential'} payout ($${status === 'half_won' ? ((bet.potential_payout + bet.stake) / 2).toFixed(2) : bet.potential_payout})`}
          />
        )}

        {status && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', 
            borderRadius: 1 
          }}>
            <Typography variant="h6">
              {status === 'won' && `Profit: $${((actualPayout || bet.potential_payout) - bet.stake).toFixed(2)}`}
              {status === 'half_won' && `Profit: $${(
                (actualPayout || ((bet.potential_payout + bet.stake) / 2)) - bet.stake
              ).toFixed(2)}`}
              {status === 'lost' && `Loss: -$${bet.stake}`}
              {status === 'half_lost' && `Loss: -$${(bet.stake / 2).toFixed(2)}`}
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
