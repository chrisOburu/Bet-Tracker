import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Box, IconButton, Tooltip } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  List as ListIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  People as PeopleIcon,
  SportsEsports as SportsIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Navigation = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Button
        component={NavLink}
        to="/"
        color="inherit"
        startIcon={<TrendingUpIcon />}
        sx={{
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Arbitrages
      </Button>
      <Button
        component={NavLink}
        to="/dashboard"
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
      <Button
        component={NavLink}
        to="/transactions"
        color="inherit"
        startIcon={<AccountBalanceIcon />}
        sx={{
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Transactions
      </Button>
      <Button
        component={NavLink}
        to="/accounts"
        color="inherit"
        startIcon={<PeopleIcon />}
        sx={{
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Accounts
      </Button>
      <Button
        component={NavLink}
        to="/sportsbooks"
        color="inherit"
        startIcon={<SportsIcon />}
        sx={{
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Sportsbooks
      </Button>
      <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <IconButton
          color="inherit"
          onClick={toggleDarkMode}
          sx={{ ml: 1 }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Navigation;
