import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Divider,
  Alert,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  useTheme
} from '@mui/material';
import { formatPercentage } from '../utils/formatters';

const AddToBetsModal = ({ 
  open, 
  onClose, 
  opportunity, 
  onConfirm, 
  loading = false 
}) => {
  const theme = useTheme();
  const [stakes, setStakes] = useState({});
  const [totalStake, setTotalStake] = useState(100);
  const [estimatedReturn, setEstimatedReturn] = useState(0);
  const [calculatedStakes, setCalculatedStakes] = useState([]);
  const [fixedStakeMode, setFixedStakeMode] = useState('total'); // 'total' or index number
  const [individualStakes, setIndividualStakes] = useState({});

  const calculateStakes = () => {
    if (!opportunity || !opportunity.combination_details) return;

    const combinations = opportunity.combination_details;
    const stakes = [];
    
    // Calculate implied probabilities
    const impliedProbs = combinations.map(combo => 1 / parseFloat(combo.odds));
    const totalImpliedProb = impliedProbs.reduce((sum, prob) => sum + prob, 0);

    if (fixedStakeMode === 'total') {
      // Fixed total stake calculation
      const total = parseFloat(totalStake) || 100;
      
      combinations.forEach((combo, index) => {
        const odds = parseFloat(combo.odds);
        const stake = total / (odds * totalImpliedProb);
        const potentialReturn = stake * odds;
        const profit = potentialReturn - total;
        
        stakes.push({
          index,
          bookmaker: combo.bookmaker,
          selection: combo.name,
          odds: odds,
          stake: parseFloat(stake.toFixed(2)),
          potentialReturn: parseFloat(potentialReturn.toFixed(2)),
          profit: parseFloat(profit.toFixed(2))
        });
      });
      
      setCalculatedStakes(stakes);
      
      // Initialize stakes object with calculated values
      const newStakes = {};
      stakes.forEach((stake, index) => {
        newStakes[index] = stake.stake;
      });
      setStakes(newStakes);
      setEstimatedReturn(stakes.length > 0 ? stakes[0].potentialReturn : 0);
    } else {
      // Fixed individual stake calculation
      const fixedIndex = parseInt(fixedStakeMode);
      const fixedStake = parseFloat(individualStakes[fixedIndex]) || 100;
      const fixedOdds = parseFloat(combinations[fixedIndex].odds);
      
      // Calculate total stake based on fixed individual stake
      const calculatedTotal = fixedStake * fixedOdds * totalImpliedProb;
      
      combinations.forEach((combo, index) => {
        const odds = parseFloat(combo.odds);
        const stake = index === fixedIndex ? 
          fixedStake : 
          calculatedTotal / (odds * totalImpliedProb);
        const potentialReturn = stake * odds;
        const profit = potentialReturn - calculatedTotal;
        
        stakes.push({
          index,
          bookmaker: combo.bookmaker,
          selection: combo.name,
          odds: odds,
          stake: parseFloat(stake.toFixed(2)),
          potentialReturn: parseFloat(potentialReturn.toFixed(2)),
          profit: parseFloat(profit.toFixed(2))
        });
      });
      
      setCalculatedStakes(stakes);
      
      // Update stakes object and total
      const newStakes = {};
      stakes.forEach((stake, index) => {
        newStakes[index] = stake.stake;
      });
      setStakes(newStakes);
      setTotalStake(calculatedTotal);
      setEstimatedReturn(stakes.length > 0 ? stakes[0].potentialReturn : 0);
    }
  };

  useEffect(() => {
    calculateStakes();
  }, [opportunity, totalStake, fixedStakeMode, individualStakes]);

  const handleTotalStakeChange = (event) => {
    const value = event.target.value;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setTotalStake(value);
    }
  };

  const handleIndividualStakeChange = (index, value) => {
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setIndividualStakes(prev => ({
        ...prev,
        [index]: value
      }));
    }
  };

  const handleStakeModeChange = (event) => {
    const newMode = event.target.value;
    const oldMode = fixedStakeMode;
    
    // When switching modes, preserve the current calculated value as the starting point
    if (oldMode === 'total' && newMode !== 'total') {
      // Switching from total to individual stake - use current calculated stake for that bet
      const targetIndex = parseInt(newMode);
      const currentCalculatedStake = calculatedStakes[targetIndex]?.stake || 100;
      setIndividualStakes(prev => ({
        ...prev,
        [targetIndex]: currentCalculatedStake
      }));
    } else if (oldMode !== 'total' && newMode === 'total') {
      // Switching from individual to total - use current calculated total
      const currentTotal = calculatedStakes.reduce((sum, stake) => sum + stake.stake, 0);
      setTotalStake(currentTotal || 100);
    } else if (oldMode !== 'total' && newMode !== 'total') {
      // Switching between individual stakes - use current calculated stake for the new target
      const targetIndex = parseInt(newMode);
      const currentCalculatedStake = calculatedStakes[targetIndex]?.stake || 100;
      setIndividualStakes(prev => ({
        ...prev,
        [targetIndex]: currentCalculatedStake
      }));
    }
    
    setFixedStakeMode(newMode);
  };

  const resetStakesState = () => {
    setTotalStake(100);
    setFixedStakeMode('total');
    setIndividualStakes({});
    setStakes({});
    setCalculatedStakes([]);
    setEstimatedReturn(0);
  };

  const handleClose = () => {
    resetStakesState();
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(stakes);
      resetStakesState();
    }
  };

  const getEventName = () => {
    if (!opportunity || !opportunity.combination_details || opportunity.combination_details.length === 0) {
      return 'Unknown Event';
    }
    
    const first = opportunity.combination_details[0];
    const home = first.home_team || 'Team A';
    const away = first.away_team || 'Team B';
    return `${home} vs ${away}`;
  };

  const getMarket = () => {
    if (!opportunity || !opportunity.combination_details || opportunity.combination_details.length === 0) {
      return 'Unknown Market';
    }
    return opportunity.combination_details[0].market || 'Unknown Market';
  };

  if (!opportunity) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          Add Arbitrage Bets to Portfolio
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and adjust stakes before adding bets
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Event Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Event Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Match</Typography>
              <Typography variant="body1">{getEventName()}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Market</Typography>
              <Typography variant="body1">{getMarket()}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Expected Profit</Typography>
              <Typography variant="body1" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                {formatPercentage(opportunity.arbitrage_percentage || 0)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Info about calculated stakes */}
        <Alert severity="info" sx={{ mb: 2 }}>
          Stakes are calculated automatically based on arbitrage theory. You can fix either the total amount or an individual stake.
        </Alert>

        {/* Stake Calculation Controls */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Stake Calculation Method
          </Typography>
          
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <RadioGroup
              row
              value={fixedStakeMode}
              onChange={handleStakeModeChange}
            >
              <FormControlLabel 
                value="total" 
                control={<Radio size="small" />} 
                label="Fix Total Amount"
              />
              {opportunity?.combination_details?.map((combo, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio size="small" />}
                  label={`Fix ${combo.bookmaker} Stake`}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {fixedStakeMode === 'total' ? (
            <TextField
              label="Total Stake Amount ($)"
              type="number"
              value={totalStake}
              onChange={handleTotalStakeChange}
              variant="outlined"
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ width: 200 }}
            />
          ) : (
            <TextField
              label={`${opportunity?.combination_details?.[parseInt(fixedStakeMode)]?.bookmaker || 'Individual'} Stake ($)`}
              type="number"
              value={individualStakes[parseInt(fixedStakeMode)] || ''}
              onChange={(e) => handleIndividualStakeChange(parseInt(fixedStakeMode), e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ width: 200 }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Bets Table */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Individual Bets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Stakes are automatically calculated based on your selected method above.
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Bookmaker</TableCell>
                <TableCell>Selection</TableCell>
                <TableCell align="center">Odds</TableCell>
                <TableCell align="center">Stake ($)</TableCell>
                <TableCell align="center">Potential Return ($)</TableCell>
                <TableCell align="center">Profit ($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calculatedStakes.map((stakeInfo, index) => (
                <TableRow key={index}>
                  <TableCell>{stakeInfo.bookmaker || 'Unknown'}</TableCell>
                  <TableCell>{stakeInfo.selection || 'Unknown Selection'}</TableCell>
                  <TableCell align="center">{stakeInfo.odds.toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {stakeInfo.stake.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {stakeInfo.potentialReturn.toFixed(2)}
                  </TableCell>
                  <TableCell align="center" sx={{ 
                    color: theme.palette.success.main, 
                    fontWeight: 'bold' 
                  }}>
                    {stakeInfo.profit.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Box sx={{ 
          p: 2, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: 1,
          mb: 2
        }}>
          <Typography variant="subtitle2" gutterBottom>Summary</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Stake</Typography>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                ${fixedStakeMode === 'total' ? 
                  parseFloat(totalStake || 0).toFixed(2) : 
                  calculatedStakes.reduce((sum, stake) => sum + stake.stake, 0).toFixed(2)
                }
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Estimated Return</Typography>
              <Typography variant="h6" sx={{ color: theme.palette.success.main }}>
                ${calculatedStakes.length > 0 ? calculatedStakes[0].potentialReturn.toFixed(2) : '0.00'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Estimated Profit</Typography>
              <Typography variant="h6" sx={{ color: theme.palette.success.main }}>
                ${calculatedStakes.length > 0 ? calculatedStakes[0].profit.toFixed(2) : '0.00'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Warning */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            These bets will be added to your portfolio as pending bets. 
            Make sure to place the actual bets with the respective bookmakers to secure the arbitrage profit.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || totalStake === 0}
          sx={{ 
            bgcolor: theme.palette.success.main,
            '&:hover': {
              bgcolor: theme.palette.success.dark
            }
          }}
        >
          {loading ? 'Adding Bets...' : `Add ${opportunity.combination_details?.length || 0} Bets`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToBetsModal;
