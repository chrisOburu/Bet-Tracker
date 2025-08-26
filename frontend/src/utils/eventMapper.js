export const getEventLinkWithMatchId = (opportunity, bookmaker) => {
  // For now, return the bookmaker link since we don't have specific match URLs
  const bookmakerLinks = {
    bet365: 'https://www.bet365.com',
    williamhill: 'https://www.williamhill.com',
    betfair: 'https://www.betfair.com',
    pinnacle: 'https://www.pinnacle.com',
    unibet: 'https://www.unibet.com',
    ladbrokes: 'https://www.ladbrokes.com'
  };
  
  const normalizedBookmaker = bookmaker.toLowerCase().replace(/\s+/g, '');
  return bookmakerLinks[normalizedBookmaker] || '#';
};

export const hasEventLink = (bookmaker) => {
  const supportedBookmakers = [
    'bet365', 'williamhill', 'betfair', 'pinnacle', 'unibet', 'ladbrokes'
  ];
  
  const normalizedBookmaker = bookmaker.toLowerCase().replace(/\s+/g, '');
  return supportedBookmakers.includes(normalizedBookmaker);
};
