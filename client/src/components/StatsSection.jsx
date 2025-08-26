import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatPercentage } from '../utils/formatters';

const StatItem = ({ label, value, valueColor = '#28a745' }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography 
      variant="h4" 
      sx={{ 
        fontSize: '1.5em',
        fontWeight: 'bold',
        color: valueColor
      }}
    >
      {value}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        color: 'white',
        fontSize: '0.9em'
      }}
    >
      {label}
    </Typography>
  </Box>
);

const StatsSection = ({ stats }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'space-around',
        padding: '15px',
        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
        borderBottom: '1px solid #dee2e6'
      }}
    >
      <StatItem 
        label="Total Opportunities" 
        value={stats.totalOpportunities}
        valueColor="white"
      />
      <StatItem 
        label="Highest Profit" 
        value={formatPercentage(stats.bestProfit)}
        valueColor="white"
      />
      <StatItem 
        label="Profitable (>1%)" 
        value={stats.profitableCount}
        valueColor="white"
      />
    </Box>
  );
};

export default StatsSection;