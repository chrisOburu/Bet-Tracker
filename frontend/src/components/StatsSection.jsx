import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { formatPercentage } from '../utils/formatters';

const StatItem = ({ label, value, valueColor = 'inherit' }) => (
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
        color: theme.palette.primary.contrastText,
        fontSize: '0.9em'
      }}
    >
      {label}
    </Typography>
  </Box>
);

const StatsSection = ({ stats }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'space-around',
        padding: '15px',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <StatItem 
        label="Total Opportunities" 
        value={stats.totalOpportunities}
        valueColor={theme.palette.primary.contrastText}
      />
      <StatItem 
        label="Highest Profit" 
        value={formatPercentage(stats.bestProfit)}
        valueColor={theme.palette.primary.contrastText}
      />
      <StatItem 
        label="Profitable (>1%)" 
        value={stats.profitableCount}
        valueColor={theme.palette.primary.contrastText}
      />
    </Box>
  );
};

export default StatsSection;
