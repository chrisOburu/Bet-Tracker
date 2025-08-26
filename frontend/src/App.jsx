import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import Dashboard from './pages/Dashboard.jsx';
import BetList from './pages/BetList.jsx';
import Transactions from './pages/Transactions.jsx';
import Arbitrages from './pages/Arbitrages.jsx';
import Navigation from './components/Navigation.jsx';
import ThemeContextProvider from './contexts/ThemeContext.jsx';

function App() {
  return (
    <ThemeContextProvider>
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
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/arbitrages" element={<Arbitrages />} />
          </Routes>
        </Container>
      </Router>
    </ThemeContextProvider>
  );
}

export default App;
