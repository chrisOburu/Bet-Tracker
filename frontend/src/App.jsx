import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import Dashboard from './pages/Dashboard.jsx';
import BetList from './pages/BetList.jsx';
import Navigation from './components/Navigation.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" className="mb-4">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Bet Tracker
            </Typography>
            <Navigation />
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" className="py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bets" element={<BetList />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
