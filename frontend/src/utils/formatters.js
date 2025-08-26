export const formatPercentage = (value) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  return `${value.toFixed(2)}%`;
};

export const formatOdds = (odds) => {
  if (Array.isArray(odds)) {
    return odds.map(odd => odd.toFixed(2)).join(', ');
  }
  return odds?.toFixed(2) || 'N/A';
};

export const formatTime = (timeString) => {
  if (!timeString) return 'TBD';
  
  try {
    const cleanTimeString = timeString.replace('Z', '+00:00');
    const date = new Date(cleanTimeString);
    
    if (isNaN(date.getTime())) {
      return 'TBD';
    }
    
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    return 'TBD';
  }
};

export const formatDate = (timeString) => {
  if (!timeString) return 'TBD';
  
  try {
    const cleanTimeString = timeString.replace('Z', '+00:00');
    const date = new Date(cleanTimeString);
    
    if (isNaN(date.getTime())) {
      return 'TBD';
    }
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch (error) {
    return 'TBD';
  }
};

export const replaceMarketNames = (marketName) => {
  if (!marketName) return '';
  
  // Handle O/U markets - remove the line value
  if (marketName.includes('O/U')) {
    marketName = marketName.slice(0, -4); // remove the last 4 characters (e.g., "O/U 2.5")
  }
  
  const replacements = {
    "Total": "",
    "Home Team": "1",
    "Away Team": "2",
    "Goals": "",
    "Match Results": "1X2",
    "Match Winner": "1X2",
    "O/U": "",
    "Draw No Bet": "DNB",
    "Double Chance": "DC",
    "Both Teams to Score": "BTS",
    "Asian Handicap": "AH",
    "European Handicap": "EH",
    "Over/Under 2.5": "O/U 2.5",
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    if (marketName.includes(key)) {
      marketName = marketName.replace(key, value);
    }
  }
  
  return marketName;
};

export const replaceMarketOutcomeNames = (marketOutcome) => {
  if (!marketOutcome) return '';
  
  const replacements = {
    "home": "1",
    "away": "2",
    "draw": "X",
    "over": "Over",
    "under": "Under",
    "yes": "Yes",
    "no": "No",
  };
  
  let outcome = marketOutcome.toLowerCase();
  for (const [key, value] of Object.entries(replacements)) {
    if (outcome.includes(key)) {
      outcome = outcome.replace(key, value);
    }
  }
  
  return outcome;
};
