import React, { useState } from 'react';
import { 
  TableRow, 
  TableCell, 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody
} from '@mui/material';
import { Calculate, OpenInNew, Sports, ExpandMore } from '@mui/icons-material';
import { formatPercentage, formatTime, formatDate, replaceMarketNames, replaceMarketOutcomeNames } from '../utils/formatters';
import { getBookmakerLink, getBookmakerDisplayName } from '../utils/bookmakerMapper';
import { getEventLinkWithMatchId, hasEventLink } from '../utils/eventMapper';
import StakeCalculator from './StakeCalculator';

const ArbitrageRow = ({ opportunities, groupIndex, expandedAccordion, onAccordionChange }) => {
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorOpportunity, setCalculatorOpportunity] = useState(null);
  
  // Always show the first (best) opportunity
  const bestOpportunity = opportunities[0];
  const additionalOpportunities = opportunities.slice(1);

  const handleAccordionChange = (event, isExpanded) => {
    // Pass the group signature and expansion state to parent
    const signature = opportunities[0].match_info?.match_signature || opportunities[0].match_signature || `unknown_${groupIndex}`;
    onAccordionChange(signature, isExpanded);
  };

  // Move these handlers to component level
  const handleCalculatorOpen = (opp) => {
    setCalculatorOpportunity(opp);
    setCalculatorOpen(true);
  };

  const handleCalculatorClose = () => {
    setCalculatorOpen(false);
    setCalculatorOpportunity(null);
  };

  // Check if this accordion should be expanded
  const isExpanded = expandedAccordion === (opportunities[0].match_info?.match_signature || opportunities[0].match_signature || `unknown_${groupIndex}`);

  const renderOpportunityRows = (opportunity, opportunityIndex, isInAccordion = false) => {
    const { 
      arbitrage_percentage, 
      match_info,
      combination_details,
      kickoff_datetime
    } = opportunity;

    // Extract market from combination_details (since all entries in the same opportunity have the same market)
    const market_name = combination_details?.[0]?.market || 'Unknown Market';
    
    //console.log('Market from combination_details:', market_name); // Debug log

    // Extract team information - handle both old and new structure
    const getTeamInfo = (bookmaker) => {
      // Try new structure first (from combination_details)
      const matchDetail = combination_details?.find(detail => detail.bookmaker === bookmaker);
      if (matchDetail) {
        return {
          home_team: matchDetail.home_team || 'TBD',
          away_team: matchDetail.away_team || 'TBD',
          league: matchDetail.league || 'Unknown',
          country: matchDetail.country || 'Unknown'
        };
      }

      // Fallback to old structure
      if (match_info?.matches_by_site?.[bookmaker]?.[0]) {
        const matchData = match_info.matches_by_site[bookmaker][0];
        return {
          home_team: matchData.home_team || 'TBD',
          away_team: matchData.away_team || 'TBD',
          league: matchData.league || 'Unknown',
          country: matchData.country || 'Unknown'
        };
      }

      return { home_team: 'TBD', away_team: 'TBD', league: 'Unknown', country: 'Unknown' };
    };

    const formatKickoff = () => {
      // Handle both structures
      const kickoff = match_info?.kickoff_datetime || kickoff_datetime;
      if (!kickoff) return 'Unknown';
      
      try {
        const dt = new Date(kickoff);
        return `${formatDate(kickoff)}<br/>${formatTime(kickoff)}`;
      } catch {
        return kickoff.slice(0, 10);
      }
    };

    const getMarketOutcomeAndOdds = (detail) => {
      // Handle new structure where outcome info is in name and odds
      if (detail.name && detail.odds) {
        return {
          marketOutcome: detail.name,
          oddsValue: String(detail.odds)
        };
      }

      // Fallback to old structure
      let marketOutcome = "";
      let oddsValue = "";
      
      for (const [key, value] of Object.entries(detail)) {
        if (!['bookmaker', 'market', 'id', 'home_team', 'away_team', 'match_id', 'league', 'country'].includes(key)) {
          marketOutcome = key;
          oddsValue = String(value);
          break;
        }
      }
      
      return { marketOutcome, oddsValue };
    };

    const handleBookmakerClick = (bookmaker) => {
      const link = getBookmakerLink(bookmaker);
      if (link !== '#') {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
    };

    const handleEventClick = (bookmaker) => {
      const eventLink = getEventLinkWithMatchId(opportunity, bookmaker);
      if (eventLink !== '#') {
        window.open(eventLink, '_blank', 'noopener,noreferrer');
      }
    };

    const rowspan = combination_details.length;

    // Calculate background color - continue alternating pattern from main table
    const getBackgroundColor = () => {
      return groupIndex % 2 === 0 ? '#f0f0ee' : '#ffffff';
    };

    return (
      <>
        {combination_details.map((detail, idx) => {
          const bookmaker = detail.bookmaker;
          const { home_team, away_team, league, country } = getTeamInfo(bookmaker);
          const event = `${home_team} – ${away_team}`;
          const { marketOutcome, oddsValue } = getMarketOutcomeAndOdds(detail);
          const bookmakerDisplayName = getBookmakerDisplayName(bookmaker);
          const bookmakerLink = getBookmakerLink(bookmaker);
          const eventLink = getEventLinkWithMatchId(opportunity, bookmaker);
          const hasSpecificEventLink = hasEventLink(bookmaker);
          
          return (
            <TableRow 
              key={`${opportunityIndex}-${idx}`}
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                borderBottom: idx === combination_details.length - 1 ? '1px solid #e0e0e0' : 'none',
                backgroundColor: getBackgroundColor()
              }}
            >
              {idx === 0 && (
                <TableCell 
                  rowSpan={rowspan}
                  sx={{ 
                    textAlign: 'center',
                    padding: '10px',
                    verticalAlign: 'middle',
                    borderRight: '1px solid #e9ecef',
                    width: '12.5%'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      color: 'black',
                      fontSize: '1rem'
                    }}
                  >
                    {formatPercentage(arbitrage_percentage)}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={() => handleCalculatorOpen(opportunity)}
                    sx={{ 
                      mt: 0.5,
                      color: '#007bff',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 123, 255, 0.1)'
                      }
                    }}
                    title="Calculate stake split"
                  >
                    <Calculate fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
              
              <TableCell sx={{ padding: '8px', verticalAlign: 'top', width: '12.5%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box>
                    <Typography 
                      component="button"
                      onClick={() => handleBookmakerClick(bookmaker)}
                      sx={{ 
                        color: '#212529',
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: bookmakerLink !== '#' ? 'pointer' : 'default',
                        padding: 0,
                        '&:hover': { 
                          textDecoration: bookmakerLink !== '#' ? 'underline' : 'none',
                          color: bookmakerLink !== '#' ? '#0056b3' : '#212529'
                        }
                      }}
                      title={bookmakerLink !== '#' ? `Visit ${bookmakerDisplayName}` : bookmakerDisplayName}
                    >
                      {bookmakerDisplayName}
                    </Typography>
                    <br />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#212529bf',
                        fontSize: '0.75rem'
                      }}
                    >
                      Football
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              
              <TableCell sx={{ padding: '8px', verticalAlign: 'top', width: '12.5%' }}>
                <Typography 
                  sx={{ 
                    color: '#212529',
                    fontSize: '1rem',
                    fontWeight: 400
                  }}
                  dangerouslySetInnerHTML={{ __html: formatKickoff() }}
                />
              </TableCell>
              
              <TableCell sx={{ padding: '8px', verticalAlign: 'top', width: '25%', textAlign: 'left' }}>
                <Box>
                  <Typography 
                    component="button"
                    onClick={() => handleEventClick(bookmaker)}
                    sx={{ 
                      color: hasSpecificEventLink ? '#4059a5' : '#212529',
                      textDecoration: 'none',
                      fontWeight: hasSpecificEventLink ? 500 : 400,
                      fontSize: '1rem',
                      background: 'none',
                      border: 'none',
                      cursor: hasSpecificEventLink ? 'pointer' : 'default',
                      padding: 0,
                      textAlign: 'left',
                      '&:hover': { 
                        textDecoration: hasSpecificEventLink ? 'underline' : 'none',
                        color: hasSpecificEventLink ? '#2c3e8a' : '#212529'
                      }
                    }}
                    title={hasSpecificEventLink ? `View match at ${bookmakerDisplayName}` : event}
                  >
                    {event}
                  </Typography>
                  <br />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#212529bf',
                      fontSize: '0.75rem',
                      textAlign: 'left'
                    }}
                  >
                    {league}
                  </Typography>
                </Box>
              </TableCell>
              
              {/* Market Cell - Updated to use market from combination_details */}
              <TableCell sx={{ padding: '8px', verticalAlign: 'top', width: '20%' }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#212529',
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      display: 'inline'
                    }}
                  >
                    {replaceMarketNames(market_name)}
                  </Typography>{' '}
                  <Typography
                    component="span"
                    sx={{
                      color: '#212529',
                      fontSize: '1rem',
                      fontWeight: 500,
                      display: 'inline'
                    }}
                  >
                    {replaceMarketOutcomeNames(marketOutcome)}
                  </Typography>
                </Box>
              </TableCell>
              
              <TableCell sx={{ padding: '8px', verticalAlign: 'top', width: '12.5%' }}>
                <Typography 
                  component="button"
                  onClick={() => handleEventClick(bookmaker)}
                  sx={{ 
                    color: '#28a745',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '1.1em',
                    background: 'none',
                    border: 'none',
                    cursor: hasSpecificEventLink ? 'pointer' : 'default',
                    padding: 0,
                    '&:hover': { 
                      textDecoration: hasSpecificEventLink ? 'underline' : 'none',
                      color: hasSpecificEventLink ? '#1e7e34' : '#28a745'
                    }
                  }}
                  title={hasSpecificEventLink ? `Place bet on this match at ${bookmakerDisplayName}` : oddsValue}
                >
                  {oddsValue}
                </Typography>
              </TableCell>
              
              <TableCell sx={{ padding: '8px', textAlign: 'center', verticalAlign: 'top', width: '12.5%' }}>
                <Typography 
                  sx={{ 
                    color: '#28a745',
                    fontSize: '1.2em'
                  }}
                >
                  {idx === 0 ? '●' : '○'}
                </Typography>
              </TableCell>
              
              {idx === 0 && (
                <TableCell 
                  rowSpan={rowspan}
                  sx={{ 
                    padding: '8px',
                    verticalAlign: 'middle',
                    width: '12.5%'
                  }}
                >
                  <Button 
                    onClick={() => handleEventClick(combination_details[0].bookmaker)}
                    sx={{ 
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      minWidth: 'auto',
                      '&:hover': {
                        background: '#0056b3'
                      }
                    }}
                    title="View match details"
                  >
                    →
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </>
    );
  };

  // Get event string from best opportunity for use in Accordion label
  const event = (() => {
    const detail = bestOpportunity.combination_details?.[0];
    if (!detail) return '';
    const { home_team, away_team } = detail;
    return home_team && away_team ? `${home_team} – ${away_team}` : '';
  })();

  return (
    <>
      {/* Always show the best opportunity */}
      {renderOpportunityRows(bestOpportunity, 0)}

      {/* Accordion for additional opportunities */}
      {additionalOpportunities.length > 0 && (
        <>
          <TableRow>
            <TableCell 
              colSpan={8}
              sx={{ 
                padding: 0,
                borderBottom: 'none',
                backgroundColor: groupIndex % 2 === 0 ? '#f0f0ee' : '#ffffff'
              }}
            >
              <Accordion
                expanded={isExpanded}
                onChange={handleAccordionChange}
                sx={{
                  '&:before': {
                    display: 'none'
                  },
                  boxShadow: 'none',
                  borderTop: '1px solid #dee2e6',
                  backgroundColor: 'transparent'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: '#f8f9fa',
                    minHeight: '48px',
                    '&.Mui-expanded': {
                      minHeight: '48px'
                    },
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      margin: '8px 0'
                    }
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ 
                      color: '#495057',
                      fontWeight: 500
                    }}
                  >
                    Show {additionalOpportunities.length} more arbitrage opportunit{additionalOpportunities.length > 1 ? 'ies' : 'y'} for {event}
                  </Typography>
                </AccordionSummary>
                
                <AccordionDetails sx={{ padding: 0, backgroundColor: 'transparent' }}>
                  <Table sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <TableBody>
                      {additionalOpportunities.map((opportunity, index) => 
                        renderOpportunityRows(opportunity, index + 1, true)
                      )}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </TableCell>
          </TableRow>
        </>
      )}
      
      {/* Stake Calculator Modal */}
      <StakeCalculator 
        open={calculatorOpen}
        onClose={handleCalculatorClose}
        opportunity={calculatorOpportunity}
      />
    </>
  );
};

export default ArbitrageRow;