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
  TableBody,
  CircularProgress,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import { Calculate, ExpandMore } from '@mui/icons-material';
import { formatPercentage, formatTime, formatDate, replaceMarketNames, replaceMarketOutcomeNames } from '../utils/formatters';
import { getBookmakerLink, getBookmakerDisplayName } from '../utils/bookmakerMapper';
import { getEventLinkWithMatchId, hasEventLink } from '../utils/eventMapper';
import { arbitrageService } from '../services/arbitrageApi';
import StakeCalculator from './StakeCalculator';
import AddToBetsModal from './AddToBetsModal';

const ArbitrageRow = ({ 
  opportunity, 
  groupIndex, 
  expandedAccordion, 
  onAccordionChange, 
  onMatchExpand, // New prop for table replacement
  fetchMatchArbitrages,
  getMatchArbitrages,
  isMatchLoading,
  isExpandedView = false // Flag to indicate if we're in expanded view
}) => {
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorOpportunity, setCalculatorOpportunity] = useState(null);
  const [addingToBets, setAddingToBets] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  
  // This is now a single opportunity with summary info
  const hasAdditionalArbitrages = opportunity.total_arbitrages > 1;
  
  // Handle expansion - now triggers table replacement instead of accordion
  const handleExpansionClick = () => {
    if (onMatchExpand && hasAdditionalArbitrages) {
      onMatchExpand(opportunity.match_signature);
    }
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

  // Handle adding arbitrage to bets
  const handleAddToBets = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleConfirmAddToBets = async (stakes) => {
    try {
      setAddingToBets(true);
      
      // Prepare arbitrage data for the API with custom stakes
      const arbitrageData = {
        match_signature: opportunity.match_signature,
        combination_details: opportunity.combination_details,
        profit: opportunity.arbitrage_percentage,
        kickoff_datetime: opportunity.kickoff_datetime
      };
      
      const response = await arbitrageService.addArbitrageDataToBets(arbitrageData, stakes);
      
      setNotification({
        open: true,
        message: `Successfully added ${response.bets_created} bets to your portfolio!`,
        severity: 'success'
      });
      
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding arbitrage to bets:', error);
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Failed to add arbitrage to bets',
        severity: 'error'
      });
    } finally {
      setAddingToBets(false);
    }
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Check if this accordion should be expanded
  const isExpanded = expandedAccordion === opportunity.match_signature;

  // Get match arbitrages data if available
  const matchData = getMatchArbitrages(opportunity.match_signature);
  const isLoading = isMatchLoading(opportunity.match_signature);

  const renderOpportunityRows = (opp, opportunityIndex, isInAccordion = false) => {
    const { 
      arbitrage_percentage, 
      combination_details,
      match_info
    } = opp;

    // Extract market from combination_details
    const market_name = combination_details?.[0]?.market || combination_details?.[0]?.market_name || 'Unknown Market';
    
    // Extract team information from combination_details or opportunity data
    const getTeamInfo = (bookmaker) => {
      // First try to get from combination_details
      const matchDetail = combination_details?.find(detail => detail.bookmaker === bookmaker);
      if (matchDetail && matchDetail.home_team && matchDetail.away_team) {
        return {
          home_team: matchDetail.home_team,
          away_team: matchDetail.away_team,
          league: matchDetail.league || 'Unknown',
          country: matchDetail.country || 'Unknown'
        };
      }

      // Fallback to extracting from match_signature or opportunity data
      const signature = opp.match_signature || '';
      const parts = signature.split(' vs ');
      if (parts.length >= 2) {
        const home_team = parts[0].trim();
        const away_team = parts[1].split(' - ')[0].trim(); // Remove market name if present
        return {
          home_team,
          away_team,
          league: opp.league || 'Unknown',
          country: opp.country || 'Unknown'
        };
      }

      return { home_team: 'TBD', away_team: 'TBD', league: 'Unknown', country: 'Unknown' };
    };

    const formatKickoff = () => {
      // Try to get kickoff from multiple sources
      const kickoff = match_info?.kickoff_datetime || 
                     opp.kickoff_datetime || 
                     (combination_details?.[0]?.kickoff_datetime);
      
      if (!kickoff) return 'TBD';
      
      try {
        const dt = new Date(kickoff);
        if (isNaN(dt.getTime())) {
          return 'TBD';
        }
        return `${formatDate(kickoff)}<br/>${formatTime(kickoff)}`;
      } catch (error) {
        console.warn('Error formatting kickoff time:', error, kickoff);
        return 'TBD';
      }
    };

    const getMarketOutcomeAndOdds = (detail) => {
      return {
        marketOutcome: detail.name || '',
        oddsValue: String(detail.odds || '')
      };
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
    const getBackgroundColor = (theme) => {
      return groupIndex % 2 === 0 
        ? theme.palette.action.hover 
        : theme.palette.background.paper;
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
                borderBottom: idx === combination_details.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                backgroundColor: getBackgroundColor(theme)
              }}
            >
              {idx === 0 && (
                <TableCell 
                  rowSpan={rowspan}
                  sx={{ 
                    textAlign: 'center',
                    padding: '10px',
                    verticalAlign: 'middle',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    width: '12.5%'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      fontSize: '1rem'
                    }}
                  >
                    {formatPercentage(arbitrage_percentage || 0)}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={() => handleCalculatorOpen(opportunity)}
                    sx={{ 
                      mt: 0.5,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
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
                        color: theme.palette.text.primary,
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: bookmakerLink !== '#' ? 'pointer' : 'default',
                        padding: 0,
                        '&:hover': { 
                          textDecoration: bookmakerLink !== '#' ? 'underline' : 'none',
                          color: bookmakerLink !== '#' ? theme.palette.primary.main : theme.palette.text.primary
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
                        color: theme.palette.text.secondary,
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
                    color: theme.palette.text.primary,
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
                      color: hasSpecificEventLink ? theme.palette.primary.main : theme.palette.text.primary,
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
                        color: hasSpecificEventLink ? theme.palette.primary.dark : theme.palette.text.primary
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
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      textAlign: 'left'
                    }}
                  >
                    {league}
                  </Typography>
                </Box>
              </TableCell>
              
              {/* Market Cell */}
              <TableCell sx={{ padding: '8px', verticalAlign: 'top', width: '20%' }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.primary,
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
                      color: theme.palette.text.primary,
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
                    color: theme.palette.success.main,
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '1.1em',
                    background: 'none',
                    border: 'none',
                    cursor: hasSpecificEventLink ? 'pointer' : 'default',
                    padding: 0,
                    '&:hover': { 
                      textDecoration: hasSpecificEventLink ? 'underline' : 'none',
                      color: hasSpecificEventLink ? theme.palette.success.dark : theme.palette.success.main
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
                    color: theme.palette.success.main,
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
                    onClick={handleAddToBets}
                    disabled={addingToBets}
                    sx={{ 
                      background: theme.palette.success.main,
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      minWidth: 'auto',
                      fontSize: '0.875rem',
                      '&:hover': {
                        background: theme.palette.success.dark
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabled,
                        color: theme.palette.action.disabled
                      }
                    }}
                    title="Add arbitrage bets to your portfolio"
                  >
                    Add Bets
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </>
    );
  };

  // Get event string from the opportunity for use in Accordion label
  const event = (() => {
    const detail = opportunity.combination_details?.[0];
    if (!detail) return '';
    const { home_team, away_team } = detail;
    return home_team && away_team ? `${home_team} – ${away_team}` : '';
  })();

  return (
    <>
      {/* Always show the best opportunity */}
      {renderOpportunityRows(opportunity, 0)}

      {/* Show expand row only if there are more arbitrages and not in expanded view */}
      {hasAdditionalArbitrages && !isExpandedView && (
        <TableRow>
          <TableCell 
            colSpan={8}
            sx={{ 
              padding: 1,
              textAlign: 'right',
              backgroundColor: groupIndex % 2 === 0 
                ? theme.palette.action.hover 
                : theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleExpansionClick}
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main
                }
              }}
            >
              View {opportunity.total_arbitrages - 1} more
            </Button>
          </TableCell>
        </TableRow>
      )}
      
      {/* Stake Calculator Modal */}
      <StakeCalculator 
        open={calculatorOpen}
        onClose={handleCalculatorClose}
        opportunity={calculatorOpportunity}
      />

      {/* Add to Bets Modal */}
      <AddToBetsModal
        open={modalOpen}
        onClose={handleModalClose}
        opportunity={opportunity}
        onConfirm={handleConfirmAddToBets}
        loading={addingToBets}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ArbitrageRow;
