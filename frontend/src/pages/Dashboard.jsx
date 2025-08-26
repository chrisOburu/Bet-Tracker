import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Sports,
} from '@mui/icons-material';
import { betService } from '../services/api.js';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBets, setRecentBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, betsResponse] = await Promise.all([
        betService.getStats(),
        betService.getBets()
      ]);
      
      setStats(statsResponse.data);
      setRecentBets(betsResponse.data.slice(0, 5)); // Last 5 bets
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'won': return 'success';
      case 'lost': return 'error';
      case 'void': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom className="text-2xl font-bold mb-6">
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-blue-50">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Bets
                  </Typography>
                  <Typography variant="h4">
                    {stats?.total_bets || 0}
                  </Typography>
                </Box>
                <Sports color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={`${stats?.total_profit_loss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total P&L
                  </Typography>
                  <Typography variant="h4" color={stats?.total_profit_loss >= 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(stats?.total_profit_loss || 0)}
                  </Typography>
                </Box>
                {stats?.total_profit_loss >= 0 ? 
                  <TrendingUp color="success" sx={{ fontSize: 40 }} /> :
                  <TrendingDown color="error" sx={{ fontSize: 40 }} />
                }
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-purple-50">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Win Rate
                  </Typography>
                  <Typography variant="h4">
                    {stats?.win_rate?.toFixed(1) || 0}%
                  </Typography>
                </Box>
                <AccountBalance color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-orange-50">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    ROI
                  </Typography>
                  <Typography variant="h4" color={stats?.roi >= 0 ? 'success.main' : 'error.main'}>
                    {stats?.roi?.toFixed(1) || 0}%
                  </Typography>
                </Box>
                <TrendingUp color={stats?.roi >= 0 ? 'success' : 'error'} sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Additional Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Betting Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Total Staked:</Typography>
                <Typography fontWeight="bold">{formatCurrency(stats?.total_staked || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Bets Won:</Typography>
                <Typography fontWeight="bold" color="success.main">{stats?.total_won || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Bets Lost:</Typography>
                <Typography fontWeight="bold" color="error.main">{stats?.total_lost || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Pending Bets:</Typography>
                <Typography fontWeight="bold">{(stats?.total_bets || 0) - (stats?.total_settled || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Potential Winnings:</Typography>
                <Typography fontWeight="bold" color="primary.main">
                  {formatCurrency(stats?.total_potential_winnings || 0)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Bets */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bets
            </Typography>
            {recentBets.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Stake</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentBets.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {bet.event_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {bet.selection}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={bet.status}
                            color={getStatusColor(bet.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(bet.stake)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary">No bets yet</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
