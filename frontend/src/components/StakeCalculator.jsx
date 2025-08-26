import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  IconButton,
  useTheme
} from '@mui/material';
import { Calculate, Close } from '@mui/icons-material';

const StakeCalculator = ({ open, onClose, opportunity }) => {
  const theme = useTheme();
  const [totalStake, setTotalStake] = useState(100);
  const [results, setResults] = useState(null);
  const [fixedStakeMode, setFixedStakeMode] = useState('total'); // 'total' or index number
  const [individualStakes, setIndividualStakes] = useState({});

  const calculateStakes = () => {
    if (!opportunity || !opportunity.combination_details) return;

    const { combination_details, arbitrage_percentage } = opportunity;
    const stakes = [];
    let totalImpliedProb = 0;

    // Calculate total implied probability
    combination_details.forEach(detail => {
      const odds = detail.odds;
      if (odds) {
        totalImpliedProb += 1 / odds;
      }
    });

    if (fixedStakeMode === 'total') {
      // Fixed total stake calculation
      const total = parseFloat(totalStake) || 100;
      
      combination_details.forEach((detail, index) => {
        const bookmaker = detail.bookmaker;
        const odds = detail.odds;
        
        if (odds) {
          const stake = total / (odds * totalImpliedProb);
          const potentialReturn = stake * odds;
          const profit = potentialReturn - total;
          
          stakes.push({
            bookmaker,
            odds,
            stake: stake.toFixed(2),
            potentialReturn: potentialReturn.toFixed(2),
            profit: profit.toFixed(2),
            index
          });
        }
      });

      const totalProfit = stakes.length > 0 ? parseFloat(stakes[0].profit) : 0;
      const profitPercentage = ((totalProfit / total) * 100).toFixed(2);

      setResults({
        stakes,
        totalStake: total,
        totalProfit: totalProfit.toFixed(2),
        profitPercentage,
        arbitragePercentage: arbitrage_percentage.toFixed(2)
      });
    } else {
      // Fixed individual stake calculation
      const fixedIndex = parseInt(fixedStakeMode);
      const fixedStake = parseFloat(individualStakes[fixedIndex]) || 100;
      const fixedOdds = combination_details[fixedIndex];
      
      if (!fixedOdds) return;
      
      const odds = fixedOdds.odds;
      
      if (!odds) return;

      // Calculate total stake based on fixed individual stake
      const calculatedTotal = fixedStake * odds * totalImpliedProb;
      
      combination_details.forEach((detail, index) => {
        const bookmaker = detail.bookmaker;
        const currentOdds = detail.odds;
        
        if (currentOdds) {
          const stake = index === fixedIndex ? 
            fixedStake : 
            calculatedTotal / (currentOdds * totalImpliedProb);
          const potentialReturn = stake * currentOdds;
          const profit = potentialReturn - calculatedTotal;
          
          stakes.push({
            bookmaker,
            odds: currentOdds,
            stake: stake.toFixed(2),
            potentialReturn: potentialReturn.toFixed(2),
            profit: profit.toFixed(2),
            index
          });
        }
      });

      const totalProfit = stakes.length > 0 ? parseFloat(stakes[0].profit) : 0;
      const profitPercentage = ((totalProfit / calculatedTotal) * 100).toFixed(2);

      setResults({
        stakes,
        totalStake: calculatedTotal,
        totalProfit: totalProfit.toFixed(2),
        profitPercentage,
        arbitragePercentage: arbitrage_percentage.toFixed(2)
      });
    }
  };

  React.useEffect(() => {
    if (open && opportunity) {
      calculateStakes();
    }
  }, [open, opportunity, totalStake, fixedStakeMode, individualStakes]);

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

  const handleRadioClick = (selectedValue) => {
    setFixedStakeMode(selectedValue);
    
    // Reset individual stakes when switching modes
    if (selectedValue === 'total') {
      setIndividualStakes({});
    } else {
      // When switching to individual stake mode, initialize with current calculated value
      const index = parseInt(selectedValue);
      if (!individualStakes[index] && results) {
        const currentStake = results.stakes.find(s => s.index === index);
        if (currentStake) {
          setIndividualStakes(prev => ({
            ...prev,
            [index]: currentStake.stake
          }));
        }
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"       
      PaperProps={{
        sx: { borderRadius: '12px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
        borderBottom: `1px solid ${theme.palette.divider}`,
        pr: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calculate sx={{ color: theme.palette.text.primary }} />
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>Stake Calculator</Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.text.primary
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Results Section */}
          {results && (
            <>
              <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                  <Table>
                    <TableHead sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]
                    }}>
                      <TableRow>
                        <TableCell sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }}>Bookmaker</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }} align="center">Odds</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }} align="center">Stake</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }} align="center">Return</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }} align="center">Profit</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }} align="center">Fix</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.stakes.map((stake, index) => (
                        <TableRow 
                          key={`stake-${index}`}
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              backgroundColor: theme.palette.action.hover
                            },
                            '&:hover': {
                              backgroundColor: theme.palette.action.selected
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {stake.bookmaker.charAt(0).toUpperCase() + stake.bookmaker.slice(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body1" fontWeight="500">
                              {stake.odds}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {fixedStakeMode === index.toString() ? (
                              <TextField
                                type="number"
                                value={individualStakes[index] || stake.stake}
                                onChange={(e) => handleIndividualStakeChange(index, e.target.value)}
                                size="small"
                                InputProps={{
                                  startAdornment: <Typography sx={{ mr: 0.5, fontSize: '0.875rem' }}>$</Typography>,
                                }}
                                sx={{ 
                                  width: '120px',
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: theme.palette.warning.light,
                                    fontWeight: 'bold'
                                  }
                                }}
                              />
                            ) : (
                              <Typography variant="h6" >
                                ${stake.stake}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="h6" fontWeight="500"  color="primary">
                              ${stake.potentialReturn}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              color={parseFloat(stake.profit) >= 0 ? "success.main" : "error.main"}
                            >
                              ${stake.profit}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRadioClick(index.toString());
                              }}
                              sx={{ 
                                display: 'inline-flex',
                                cursor: 'pointer'
                              }}
                            >
                              <Radio
                                checked={fixedStakeMode === index.toString()}
                                value={index.toString()}
                                size="small"
                                disableRipple
                                sx={{ p: 1 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Total Row */}
                      <TableRow sx={{ 
                        backgroundColor: theme.palette.action.hover,
                        borderTop: parseFloat(results.profitPercentage) >= 0 ? `2px solid ${theme.palette.success.main}` : `2px solid ${theme.palette.error.main}`,
                        '&:hover': {
                          backgroundColor: theme.palette.action.selected
                        }
                      }}>
                        <TableCell>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                            Total
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {fixedStakeMode === 'total' ? (
                            <TextField
                              type="number"
                              value={totalStake}
                              onChange={handleTotalStakeChange}
                              size="small"
                              InputProps={{
                                startAdornment: <Typography sx={{ mr: 0.5, fontSize: '0.875rem' }}>$</Typography>,
                              }}
                              sx={{ 
                                width: '100px',
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: theme.palette.warning.light,
                                  fontWeight: 'bold'
                                }
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Calculated
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                            ${results.totalStake.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            ${(parseFloat(results.totalStake) + parseFloat(results.totalProfit)).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color={parseFloat(results.profitPercentage) >= 0 ? "success.main" : "error.main"}
                          >
                            ${results.totalProfit} ({results.profitPercentage}%)
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRadioClick('total');
                            }}
                            sx={{ 
                              display: 'inline-flex',
                              cursor: 'pointer'
                            }}
                          >
                            <Radio
                              checked={fixedStakeMode === 'total'}
                              value="total"
                              size="small"
                              disableRipple
                              sx={{ p: 1 }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </>
          )}
          
          {!results && (
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center', 
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100] 
              }}>
                <Typography variant="h6" color="text.secondary">
                  Adjust stakes using the radio buttons and input fields
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default StakeCalculator;
