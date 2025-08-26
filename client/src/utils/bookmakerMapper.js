export const bookmakerLinks = {  
  // International Bookmakers
  'pinnacle': 'https://www.pinnacle.com',

  //Kenya Bookmakers
  'sportpesa': 'https://www.ke.sportpesa.com',
  'betika': 'https://www.betika.com/en-ke',
  'mcheza': 'https://www.mcheza.com',
  'odibets': 'https://www.odibets.com',
  'shabiki': 'https://www.shabiki.com',
  'mozzartbet': 'https://www.mozzartbet.co.ke/en#',
  'betpawa': 'https://www.betpawa.co.ke',
  'kwikbet': 'https://www.kwikbet.co.ke',
  'sportybet': 'https://www.sportybet.com',
  'bangbet': 'https://www.bangbet.com',
  'pepeta': 'https://pepeta.com',
  'playmaster': 'https://playmaster.co.ke',
  'chezacash' : 'https://www.chezacash.com',
  'kessbet': 'https://www.kessbet.com',

  // Default fallback
  'default': '#'
};

export const getBookmakerLink = (bookmakerName) => {
  if (!bookmakerName) return '#';
  
  // Normalize the bookmaker name (lowercase, remove spaces, replace with underscores)
  const normalizedName = bookmakerName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/\./g, '');
  
  return bookmakerLinks[normalizedName] || bookmakerLinks['default'];
};

export const getBookmakerDisplayName = (bookmakerName) => {
  if (!bookmakerName) return 'Unknown';
  
  // Convert bookmaker names to proper display format
  const displayNames = Object.fromEntries(
    Object.keys(bookmakerLinks).map(key => [
      key,
      key.charAt(0).toUpperCase() + key.slice(1)
    ])
  );
  
  const normalizedName = bookmakerName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/\./g, '');
  
  return displayNames[normalizedName] || bookmakerName.charAt(0).toUpperCase() + bookmakerName.slice(1);
};