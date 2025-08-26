import { getBookmakerLink,bookmakerLinks } from './bookmakerMapper';



// Generate match-specific URLs using various strategies
export const generateMatchUrl = (bookmaker, matchId, homeTeam, awayTeam, league, country) => {
  const normalizedBookmaker = bookmaker.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/\./g, '');
  
  const baseUrl = bookmakerLinks[normalizedBookmaker];
  
  if (!baseUrl) {
    return getBookmakerLink(bookmaker); // Fallback to main bookmaker site
  }

  // Different URL patterns for different bookmakers
  switch (normalizedBookmaker) {
    case 'sportpesa':
      return `${baseUrl}/games/${matchId}/markets?sportId=1&section=markets`;
    case 'betika':
      return `${baseUrl}/m/${matchId}`;
    case 'pinnacle':
      return `${baseUrl}/en/soccer/${generateSlug(country)}-${generateSlug(league)}/${generateMatchSlug(homeTeam, awayTeam)}/${matchId}/#all`;
    case 'mozzartbet':
      return `${baseUrl}/match/${matchId}`;
    case 'shabiki':
      return `${baseUrl}/prematch?curpage=prematch/event?eventId=1-1116-${matchId}`;
    case 'odibets':
      return `${baseUrl}/sportevent/${matchId}`;
    case 'betpawa':
      return `${baseUrl}/event/${matchId}?filter=all`;
    case 'kwikbet':
      return `${baseUrl}/sports/Soccer-1/${matchId}`;
    case 'pepeta':
      return `${baseUrl}/sports/soccer/preview/${matchId}`;
    case 'bangbet':
      return `${baseUrl}/ke-m/sport/Football/match?groupId=&matchId=sr%3Amatch%3A${matchId.split(':')[2]}&sportId=sr%3Asport%3A1&producer=3&position=16&prediction=4`;
    case 'playmaster':
      return `${baseUrl}/en/sports/prematch/Football/${encodeURIComponent(country)}/${encodeURIComponent(league)}/${encodeURIComponent(`${homeTeam} V ${awayTeam}`)}_${matchId}`;
    case 'chezacash':
      return `${baseUrl}/#/soccer/${generateSlug(league)}/${generateSlug(homeTeam)}-vs-${generateSlug(awayTeam)}/sm-${matchId}/`;
    case 'sportybet':
      return `${baseUrl}/ke/sport/football/${encodeURIComponent(country)}/${encodeURIComponent(league).replace(/%20/g, '_')}/${encodeURIComponent(homeTeam).replace(/%20/g, '_')}_vs_${encodeURIComponent(awayTeam).replace(/%20/g, '_')}/${matchId}`;
    case 'kessbet':
      return `${baseUrl}/pc/match/${matchId}`;
    default:
      // Generic pattern for other bookmakers
      return `${baseUrl}/${matchId}`;
  }
};

// Generate URL-friendly slugs from team/league names
export const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
};

// Generate match-specific identifiers
export const generateMatchSlug = (homeTeam, awayTeam) => {
  return `${generateSlug(homeTeam)}-${generateSlug(awayTeam)}`;
};

// Generate Betfair-style market IDs (simplified)
export const generateBetfairMarketId = (homeTeam, awayTeam) => {
  const combined = `${homeTeam}${awayTeam}`.replace(/\s/g, '');
  // Simple hash-like generation (in real scenario, you'd use actual market IDs)
  return combined.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString();
};

// Enhanced function to get event-specific links
export const getEventLink = (bookmaker, matchInfo, matchId = null) => {
  if (!matchInfo || !bookmaker) {
    return getBookmakerLink(bookmaker); // Fallback to main site
  }

  const { home_team, away_team, league, country } = matchInfo;
  
  if (!home_team || !away_team) {
    return getBookmakerLink(bookmaker); // Fallback if no team info
  }

  return generateMatchUrl(bookmaker, matchId, home_team, away_team, league, country);
};

// Function to extract match ID from various sources
export const extractMatchId = (opportunity, bookmaker) => {
  // Try to extract match ID from different possible locations
  const matchInfo = opportunity.match_info;
  
  if (!matchInfo) return null;

  // Check if match ID exists in matches_by_site
  if (matchInfo.matches_by_site && matchInfo.matches_by_site[bookmaker]) {
    const matchData = matchInfo.matches_by_site[bookmaker][0];
    return matchData?.match_id || matchData?.id || null;
  }

  // Check for global match ID
  return matchInfo.match_id || matchInfo.id || null;
};

// Main function to get event-specific link with match ID support
export const getEventLinkWithMatchId = (opportunity, bookmaker) => {
  const matchId = extractMatchId(opportunity, bookmaker);
  const matchInfo = opportunity.match_info?.matches_by_site?.[bookmaker]?.[0] || {};
  
  return getEventLink(bookmaker, matchInfo, matchId);
};

// Function to check if a specific match URL is available
export const hasEventLink = (bookmaker) => {
  const normalizedBookmaker = bookmaker.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/\./g, '');
  
  return bookmakerLinks.hasOwnProperty(normalizedBookmaker);
};