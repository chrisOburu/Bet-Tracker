import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar position="static" className="bg-gradient-to-r from-blue-600 to-blue-800">
      <Toolbar>
        <Box className="flex items-center gap-2">
          <TrendingUp className="text-white" />
          <Typography variant="h6" component="div" className="text-white font-bold">
            Arbitrage Opportunities - Uzee Style
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;