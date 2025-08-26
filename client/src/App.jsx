import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import StatsSection from './components/StatsSection';
import ArbitrageTable from './components/ArbitrageTable';
import { useArbitrageData } from './hooks/useArbitrageData';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f8f9fa',
    },
    typography: {
      fontFamily: 'Roboto',
    },
  },
});

function App() {
  const { data, loading, error, lastFetch, pagination, stats, refetch, reloadData } = useArbitrageData();

  const handlePageChange = (page) => {
    console.log('Page change requested:', page); // Debug log
    refetch(page, pagination.itemsPerPage);
  };

  const handleLimitChange = (page, limit) => {
    console.log('Limit change requested:', page, limit); // Debug log
    refetch(page, limit);
  };

  const formatLastFetch = () => {
    if (!lastFetch) return 'Never';
    return lastFetch.toLocaleString();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          background: '#4F5279',
          margin: 0,
          padding: '20px',
          minHeight: '100vh'
        }}
      >
        <Box 
          sx={{ 
            maxWidth: '1400px',
            margin: '0 auto',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              padding: '20px',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              <img 
                src="https://png.pngtree.com/png-clipart/20250123/original/pngtree-cute-cartoon-gecko-illustration-png-image_20298941.png" 
                alt="Logo" 
                style={{ height: 48, width: 48, marginRight: 12 }} 
              />
              <Typography variant="h4" component="h1">
                Star Lizard Arbitrage Monitor
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, gap: 1 }}>
              <Typography variant="body1">
                Last updated: {formatLastFetch()}
              </Typography>
              <Tooltip title="Refresh now">
                <IconButton 
                  onClick={() => refetch(pagination.currentPage, pagination.itemsPerPage)}
                  disabled={loading}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
              {pagination?.totalItems || 0} match groups ({pagination?.totalOpportunities || data.length} total opportunities)
            </Typography>
          </Box>
          
          {/* Stats Section */}
          <StatsSection stats={stats} />
          
          {/* Arbitrage Table with proper pagination props */}
          <ArbitrageTable 
            data={data} 
            loading={loading} 
            error={error}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;