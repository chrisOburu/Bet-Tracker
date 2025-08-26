import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import { Dashboard as DashboardIcon, List as ListIcon } from '@mui/icons-material';

const Navigation = () => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        component={NavLink}
        to="/"
        color="inherit"
        startIcon={<DashboardIcon />}
        sx={{
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Dashboard
      </Button>
      <Button
        component={NavLink}
        to="/bets"
        color="inherit"
        startIcon={<ListIcon />}
        sx={{
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        My Bets
      </Button>
    </Box>
  );
};

export default Navigation;
