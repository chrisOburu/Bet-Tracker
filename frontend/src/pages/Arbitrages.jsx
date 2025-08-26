import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip, 
  Grid, 
  Card, 
  CardContent 
} from '@mui/material';
import { 
  Refresh, 
  TrendingUp, 
  ShowChart, 
  Assessment, 
  Schedule 
} from '@mui/icons-material';
import ArbitrageTable from '../components/ArbitrageTable';
import { useArbitrageData } from '../hooks/useArbitrageData';

const Arbitrages = () => {
  const { data, loading, error, lastFetch, pagination, stats, refetch, reloadData } = useArbitrageData();

  const handlePageChange = (page) => {
    console.log('Page change requested:', page);
    refetch(page, pagination.itemsPerPage);
  };

  const handleLimitChange = (page, limit) => {
    console.log('Limit change requested:', page, limit);
    refetch(page, limit);
  };

  const formatLastFetch = () => {
    if (!lastFetch) return 'Never';
    return lastFetch.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Arbitrage Opportunities
        </Typography>
        <Tooltip title="Refresh arbitrage data">
          <IconButton 
            onClick={() => refetch(pagination.currentPage, pagination.itemsPerPage)}
            disabled={loading}
            color="primary"
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Best Profit
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {stats?.bestProfit?.toFixed(2) || 0}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Maximum available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShowChart color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Total Opportunities
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {stats?.totalOpportunities || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Available markets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="secondary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Match Groups
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {pagination?.totalItems || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Unique matches
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Last Updated
                </Typography>
              </Box>
              <Typography variant="h6" component="div">
                {formatLastFetch()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Data refresh time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Arbitrage Table */}
      <ArbitrageTable 
        data={data} 
        loading={loading} 
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </Box>
  );
};

export default Arbitrages;
