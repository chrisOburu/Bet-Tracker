const bookmakerLinks = {
  bet365: 'https://www.bet365.com',
  williamhill: 'https://www.williamhill.com',
  betfair: 'https://www.betfair.com',
  pinnacle: 'https://www.pinnacle.com',
  unibet: 'https://www.unibet.com',
  ladbrokes: 'https://www.ladbrokes.com',
  skybet: 'https://www.skybet.com',
  paddy: 'https://www.paddypower.com',
  coral: 'https://www.coral.co.uk',
  betway: 'https://www.betway.com'
};

const bookmakerDisplayNames = {
  bet365: 'Bet365',
  williamhill: 'William Hill',
  betfair: 'Betfair',
  pinnacle: 'Pinnacle',
  unibet: 'Unibet',
  ladbrokes: 'Ladbrokes',
  skybet: 'SkyBet',
  paddy: 'Paddy Power',
  coral: 'Coral',
  betway: 'Betway'
};

export const getBookmakerLink = (bookmaker) => {
  const normalizedBookmaker = bookmaker.toLowerCase().replace(/\s+/g, '');
  return bookmakerLinks[normalizedBookmaker] || '#';
};

export const getBookmakerDisplayName = (bookmaker) => {
  const normalizedBookmaker = bookmaker.toLowerCase().replace(/\s+/g, '');
  return bookmakerDisplayNames[normalizedBookmaker] || bookmaker;
};
