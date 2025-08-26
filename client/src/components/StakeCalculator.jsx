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
  IconButton
} from '@mui/material';
import { Calculate, Close } from '@mui/icons-material';

const StakeCalculator = ({ open, onClose, opportunity }) => {
  const [totalStake, setTotalStake] = useState(100);
  const [results, setResults] = useState(null);
  const [fixedStakeMode, setFixedStakeMode] = useState('total'); // 'total' or index number
  const [individualStakes, setIndividualStakes] = useState({});

  const calculateStakes = () => {
    if (!opportunity || !opportunity.combination_details) return;

    const { combination_details, arbitrage_percentage } = opportunity;
    const stakes = [];
    let totalImpliedProb = 0;

    // Calculate total implied probability - handle new structure
    combination_details.forEach(detail => {
      // Handle new structure where odds is direct property
      const odds = detail.odds || Object.values(detail).find(val => 
        typeof val === 'number' && !['bookmaker', 'market', 'id', 'match_id'].includes(val)
      );
      if (odds) {
        totalImpliedProb += 1 / odds;
      }
    });

    if (fixedStakeMode === 'total') {
      // Fixed total stake calculation
      const total = parseFloat(totalStake) || 100;
      
      combination_details.forEach((detail, index) => {
        const bookmaker = detail.bookmaker;
        const odds = detail.odds || Object.values(detail).find(val => 
          typeof val === 'number' && !['bookmaker', 'market', 'id', 'match_id'].includes(val)
        );
        
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
      
      const odds = fixedOdds.odds || Object.values(fixedOdds).find(val => 
        typeof val === 'number' && !['bookmaker', 'market', 'id', 'match_id'].includes(val)
      );
      
      if (!odds) return;

      // Calculate total stake based on fixed individual stake
      const calculatedTotal = fixedStake * odds * totalImpliedProb;
      
      combination_details.forEach((detail, index) => {
        const bookmaker = detail.bookmaker;
        const currentOdds = detail.odds || Object.values(detail).find(val => 
          typeof val === 'number' && !['bookmaker', 'market', 'id', 'match_id'].includes(val)
        );
        
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
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        pr: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calculate />
          <Typography variant="h6">Stake Calculator</Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ 
            color: '#6c757d',
            '&:hover': {
              backgroundColor: 'rgba(108, 117, 125, 0.1)',
              color: '#495057'
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
                <TableContainer component={Paper} sx={{ border: '1px solid #dee2e6' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Bookmaker</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Odds</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Stake</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Return</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Profit</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Fix</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.stakes.map((stake, index) => (
                        <TableRow 
                          key={`stake-${index}`}
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              backgroundColor: '#f9f9f9' 
                            },
                            '&:hover': {
                              backgroundColor: '#f0f8ff'
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
                                    backgroundColor: '#fff3cd',
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
                        backgroundColor: parseFloat(results.profitPercentage) >= 0 ? '#e8f5e8' : '#f8d7da', 
                        borderTop: parseFloat(results.profitPercentage) >= 0 ? '2px solid #28a745' : '2px solid #dc3545',
                        '&:hover': {
                          backgroundColor: parseFloat(results.profitPercentage) >= 0 ? '#e8f5e8' : '#f8d7da'
                        }
                      }}>
                        <TableCell>
                          <Typography variant="h6" fontWeight="bold" >
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
                                  backgroundColor: '#fff3cd',
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
                          <Typography variant="h6" fontWeight="bold" >
                            ${results.totalStake.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            ${(parseFloat(results.totalStake) + parseFloat(results.totalProfit)).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" fontWeight="bold" color={parseFloat(results.profitPercentage) >= 0 ? "success.main" : "error.main"}>
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
              <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
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