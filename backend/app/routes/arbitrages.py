from flask import Blueprint, request, jsonify
from app import db
from app.models.arbitrage import Arbitrage
from app.models.bet import Bet
from app.models.account import Account
from app.models.sportsbook import Sportsbook
from datetime import datetime
from sqlalchemy import desc, asc, func
import json
from collections import defaultdict
import os

arbitrages_bp = Blueprint('arbitrages', __name__)

def resolve_sportsbook_id(sportsbook_input):
    """
    Resolve sportsbook ID from either ID or name.
    Returns (sportsbook_id, sportsbook_name) tuple or (None, None) if not found.
    Creates sportsbook if it doesn't exist.
    """
    if not sportsbook_input:
        return None, None
    
    # If it's a number, treat it as ID
    if str(sportsbook_input).isdigit():
        sportsbook = Sportsbook.query.get(int(sportsbook_input))
        if sportsbook:
            return sportsbook.id, sportsbook.name
    
    # Otherwise, treat it as name and try to find it
    sportsbook = Sportsbook.get_by_name(str(sportsbook_input))
    if sportsbook:
        return sportsbook.id, sportsbook.name
    
    # If not found, create new sportsbook
    sportsbook = Sportsbook.create_if_not_exists(str(sportsbook_input))
    db.session.add(sportsbook)
    db.session.flush()  # Get the ID without committing
    return sportsbook.id, sportsbook.name

def resolve_account_id(account_input):
    """
    Resolve account ID from either ID or identifier.
    Returns (account_id, account_identifier) tuple or (None, None) if not found.
    """
    if not account_input:
        return None, None
    
    # If it's a number, treat it as ID
    if str(account_input).isdigit():
        account = Account.query.get(int(account_input))
        if account:
            return account.id, account.account_identifier
    
    # Otherwise, treat it as identifier and try to find it
    account = Account.query.filter_by(account_identifier=str(account_input)).first()
    if account:
        return account.id, account.account_identifier
    
    # If not found, return None (don't auto-create accounts)
    return None, None
    return None

@arbitrages_bp.route('/arbitrages/grouped', methods=['GET'])
def get_grouped_arbitrages():
    """Get arbitrage opportunities grouped by match signature with pagination - returns only top arbitrage per group"""
    try:
        # Get query parameters
        min_profit = request.args.get('min_profit', type=float)
        max_profit = request.args.get('max_profit', type=float)
        sort_by = request.args.get('sort_by', 'profit')  # profit, kickoff_datetime, created_at
        sort_order = request.args.get('sort_order', 'desc')  # asc or desc
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Build query
        query = Arbitrage.query
        
        if min_profit is not None:
            query = query.filter(Arbitrage.profit >= min_profit)
        
        if max_profit is not None:
            query = query.filter(Arbitrage.profit <= max_profit)
        
        # Get all arbitrages that match filters
        all_arbitrages = query.all()
        
        # Group by match_signature
        grouped_arbitrages = defaultdict(list)
        for arbitrage in all_arbitrages:
            grouped_arbitrages[arbitrage.match_signature].append(arbitrage)
        
        # Get the best arbitrage for each group and prepare grouped data
        best_arbitrages = []
        for match_signature, arbitrages in grouped_arbitrages.items():
            # Sort arbitrages in this group by profit (descending)
            sorted_arbitrages = sorted(arbitrages, key=lambda x: x.profit, reverse=True)
            best_arbitrage = sorted_arbitrages[0]
            
            # Extract market information from combination_details
            try:
                combination_details = json.loads(best_arbitrage.combination_details)
                markets = list(set(detail.get('market', 'Unknown') for detail in combination_details))
            except (json.JSONDecodeError, AttributeError):
                markets = ['Unknown']
            
            # Create grouped entry - only top arbitrage with summary info
            grouped_entry = {
                'match_signature': match_signature,
                'best_arbitrage': best_arbitrage.to_dict(),
                'total_arbitrages': len(arbitrages),
                'max_profit': max(arb.profit for arb in arbitrages),
                'min_profit': min(arb.profit for arb in arbitrages),
                'markets_count': len(markets),
                'markets': markets
            }
            
            best_arbitrages.append(grouped_entry)
        
        # Sort the grouped results
        if sort_by == 'profit':
            best_arbitrages.sort(key=lambda x: x['best_arbitrage']['profit'], reverse=(sort_order == 'desc'))
        elif sort_by == 'kickoff_datetime':
            best_arbitrages.sort(key=lambda x: x['best_arbitrage']['kickoff_datetime'], reverse=(sort_order == 'desc'))
        elif sort_by == 'created_at':
            best_arbitrages.sort(key=lambda x: x['best_arbitrage']['created_at'], reverse=(sort_order == 'desc'))
        
        # Apply pagination
        total_groups = len(best_arbitrages)
        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        paginated_groups = best_arbitrages[start_index:end_index]
        
        return jsonify({
            'groups': paginated_groups,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_groups': total_groups,
                'total_pages': (total_groups + per_page - 1) // per_page,
                'has_next': end_index < total_groups,
                'has_prev': page > 1
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages/match/<match_signature>', methods=['GET'])
def get_arbitrages_by_match_signature(match_signature):
    """Get all arbitrage opportunities for a specific match signature"""
    try:
        # Get query parameters
        sort_by = request.args.get('sort_by', 'profit')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Build query
        query = Arbitrage.query.filter(Arbitrage.match_signature == match_signature)
        
        # Apply sorting
        sort_column = getattr(Arbitrage, sort_by, Arbitrage.profit)
        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        arbitrages = query.all()
        
        if not arbitrages:
            return jsonify({'error': 'No arbitrages found for this match signature'}), 404
        
        # Extract match info from first arbitrage's combination_details
        match_info = {}
        try:
            first_arb_details = json.loads(arbitrages[0].combination_details)
            if first_arb_details:
                first_detail = first_arb_details[0]
                match_info = {
                    'home_team': first_detail.get('home_team', 'Unknown'),
                    'away_team': first_detail.get('away_team', 'Unknown'),
                    'league': first_detail.get('league', 'Unknown'),
                    'country': first_detail.get('country', 'Unknown'),
                    'kickoff_datetime': arbitrages[0].kickoff_datetime
                }
        except (json.JSONDecodeError, IndexError, KeyError):
            match_info = {
                'home_team': 'Unknown',
                'away_team': 'Unknown',
                'league': 'Unknown',
                'country': 'Unknown',
                'kickoff_datetime': arbitrages[0].kickoff_datetime
            }
        
        # Group by market for better organization
        markets_data = defaultdict(list)
        all_markets = set()
        
        for arb in arbitrages:
            try:
                combination_details = json.loads(arb.combination_details)
                market = combination_details[0].get('market', 'Unknown') if combination_details else 'Unknown'
                all_markets.add(market)
                markets_data[market].append(arb.to_dict())
            except (json.JSONDecodeError, IndexError, KeyError):
                markets_data['Unknown'].append(arb.to_dict())
                all_markets.add('Unknown')
        
        return jsonify({
            'match_signature': match_signature,
            'arbitrages': [arb.to_dict() for arb in arbitrages],
            'markets_data': dict(markets_data),
            'total_count': len(arbitrages),
            'max_profit': max(arb.profit for arb in arbitrages),
            'min_profit': min(arb.profit for arb in arbitrages),
            'markets': list(all_markets),
            'match_info': match_info
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages', methods=['GET'])
def get_arbitrages():
    """Get all arbitrage opportunities with optional filtering"""
    try:
        # Get query parameters
        min_profit = request.args.get('min_profit', type=float)
        max_profit = request.args.get('max_profit', type=float)
        sort_by = request.args.get('sort_by', 'profit')  # profit, kickoff_datetime, created_at
        sort_order = request.args.get('sort_order', 'desc')  # asc or desc
        
        # Build query
        query = Arbitrage.query
        
        if min_profit is not None:
            query = query.filter(Arbitrage.profit >= min_profit)
        
        if max_profit is not None:
            query = query.filter(Arbitrage.profit <= max_profit)
        
        # Apply sorting
        sort_column = getattr(Arbitrage, sort_by, Arbitrage.profit)
        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        arbitrages = query.all()
        
        return jsonify([arbitrage.to_dict() for arbitrage in arbitrages])
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages', methods=['POST'])
def create_arbitrage():
    """Create a new arbitrage opportunity"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['profit', 'match_signature', 'kickoff_datetime', 'combination_details']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Ensure combination_details is a JSON string
        combination_details = data['combination_details']
        if isinstance(combination_details, (list, dict)):
            combination_details = json.dumps(combination_details)
        
        arbitrage = Arbitrage(
            profit=float(data['profit']),
            match_signature=data['match_signature'],
            kickoff_datetime=data['kickoff_datetime'],
            combination_details=combination_details
        )
        
        db.session.add(arbitrage)
        db.session.commit()
        
        return jsonify(arbitrage.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages/<int:arbitrage_id>', methods=['PUT'])
def update_arbitrage(arbitrage_id):
    """Update an arbitrage opportunity"""
    try:
        arbitrage = Arbitrage.query.get_or_404(arbitrage_id)
        data = request.get_json()
        
        # Update fields if provided
        if 'profit' in data:
            arbitrage.profit = float(data['profit'])
        
        if 'match_signature' in data:
            arbitrage.match_signature = data['match_signature']
        
        if 'kickoff_datetime' in data:
            arbitrage.kickoff_datetime = data['kickoff_datetime']
        
        if 'combination_details' in data:
            combination_details = data['combination_details']
            if isinstance(combination_details, (list, dict)):
                combination_details = json.dumps(combination_details)
            arbitrage.combination_details = combination_details
        
        # Update the updated_at timestamp
        arbitrage.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify(arbitrage.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages/<int:arbitrage_id>', methods=['DELETE'])
def delete_arbitrage(arbitrage_id):
    """Delete an arbitrage opportunity"""
    try:
        arbitrage = Arbitrage.query.get_or_404(arbitrage_id)
        db.session.delete(arbitrage)
        db.session.commit()
        
        return jsonify({'message': 'Arbitrage opportunity deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages/stats', methods=['GET'])
def get_arbitrage_stats():
    """Get arbitrage statistics"""
    try:
        # Get all arbitrages
        arbitrages = Arbitrage.query.all()
        
        if not arbitrages:
            return jsonify({
                'total_opportunities': 0,
                'active_opportunities': 0,
                'average_profit': 0,
                'max_profit': 0,
                'min_profit': 0,
                'most_common_market': None,
                'most_common_league': None
            })
        
        # Calculate statistics
        profits = [arb.profit for arb in arbitrages]
        
        # Extract market and league information from combination_details
        market_counts = {}
        league_counts = {}
        
        for arb in arbitrages:
            try:
                combination_details = json.loads(arb.combination_details)
                if combination_details:
                    # Get market from first combination detail
                    market = combination_details[0].get('market', 'Unknown')
                    market_counts[market] = market_counts.get(market, 0) + 1
                    
                    # Get league from first combination detail
                    league = combination_details[0].get('league', 'Unknown')
                    if league != 'Unknown':
                        league_counts[league] = league_counts.get(league, 0) + 1
            except (json.JSONDecodeError, IndexError, KeyError):
                market_counts['Unknown'] = market_counts.get('Unknown', 0) + 1
        
        most_common_market = max(market_counts.items(), key=lambda x: x[1])[0] if market_counts else None
        most_common_league = max(league_counts.items(), key=lambda x: x[1])[0] if league_counts else None
        
        return jsonify({
            'total_opportunities': len(arbitrages),
            'active_opportunities': len(arbitrages),  # All are considered active in simplified model
            'average_profit': round(sum(profits) / len(profits), 2) if profits else 0,
            'max_profit': round(max(profits), 2) if profits else 0,
            'min_profit': round(min(profits), 2) if profits else 0,
            'most_common_market': most_common_market,
            'league_distribution': league_counts
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages/<int:arbitrage_id>/add-to-bets', methods=['POST'])
def add_arbitrage_to_bets(arbitrage_id):
    """Convert an arbitrage opportunity into individual bets"""
    try:
        arbitrage = Arbitrage.query.get_or_404(arbitrage_id)
        data = request.get_json() or {}
        
        # Parse combination details
        try:
            combination_details = json.loads(arbitrage.combination_details) if isinstance(arbitrage.combination_details, str) else arbitrage.combination_details
        except (json.JSONDecodeError, TypeError):
            return jsonify({'error': 'Invalid combination details format'}), 400
        
        if not combination_details:
            return jsonify({'error': 'No betting combinations found'}), 400
        
        # Extract match information
        first_combo = combination_details[0]
        home_team = first_combo.get('home_team', 'Team A')
        away_team = first_combo.get('away_team', 'Team B')
        league = first_combo.get('league', 'Unknown League')
        market = first_combo.get('market', 'Unknown Market')
        
        # Create event name
        event_name = f"{home_team} vs {away_team}"
        
        # Parse kickoff datetime
        kickoff = None
        kickoff_str = arbitrage.kickoff_datetime
        if kickoff_str:
            try:
                # Handle different datetime formats
                if isinstance(kickoff_str, str):
                    if 'T' in kickoff_str:
                        kickoff = datetime.fromisoformat(kickoff_str.replace('Z', '+00:00'))
                    else:
                        kickoff = datetime.strptime(kickoff_str, '%Y-%m-%d %H:%M:%S')
                elif isinstance(kickoff_str, datetime):
                    kickoff = kickoff_str
            except (ValueError, TypeError):
                kickoff = None
        
        # Get default stake from request or use default
        default_stake = data.get('stake', 100.0)  # Default $100 per bet
        
        # Get account from request data (optional)
        account = data.get('account')
        
        created_bets = []
        
        # Create a bet for each combination in the arbitrage
        for combo in combination_details:
            bookmaker = combo.get('bookmaker', 'Unknown')
            odds = float(combo.get('odds', 1.0))
            selection = combo.get('name', 'Unknown Selection')
            
            # Calculate potential payout
            potential_payout = default_stake * odds
            
            # Resolve sportsbook ID and name
            sportsbook_id, sportsbook_name = resolve_sportsbook_id(bookmaker)
            
            # Resolve account ID and identifier
            account_id, account_identifier = resolve_account_id(account)
            
            # Create the bet
            bet = Bet(
                sport='Football',  # Assuming football for now
                event_name=event_name,
                bet_type=market,
                selection=selection,
                sportsbook_id=sportsbook_id,
                account_id=account_id,
                odds=odds,
                stake=default_stake,
                status='pending',
                potential_payout=potential_payout,
                actual_payout=0.0,
                profit_loss=0.0,
                date_placed=datetime.now(),
                date_settled=None,
                kickoff=kickoff,
                notes=f"Added from arbitrage opportunity (Profit: {arbitrage.profit}%)"
            )
            
            db.session.add(bet)
            created_bets.append(bet)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully created {len(created_bets)} bets from arbitrage opportunity',
            'bets_created': len(created_bets),
            'total_stake': default_stake * len(created_bets),
            'expected_profit_percentage': arbitrage.profit,
            'bets': [bet.to_dict() for bet in created_bets]
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages/add-to-bets', methods=['POST'])
def add_arbitrage_to_bets_by_data():
    """Convert arbitrage opportunity data into individual bets with custom stakes and accounts"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract arbitrage data from request
        combination_details = data.get('combination_details', [])
        match_signature = data.get('match_signature', '')
        profit = data.get('profit', 0)
        kickoff_datetime = data.get('kickoff_datetime')
        
        # Handle both old stakes format (dict) and new format (list of bet objects)
        stakes_data = data.get('stakes', {})
        
        if not combination_details:
            return jsonify({'error': 'No betting combinations found'}), 400
        
        # Extract match information
        first_combo = combination_details[0]
        home_team = first_combo.get('home_team', 'Team A')
        away_team = first_combo.get('away_team', 'Team B')
        league = first_combo.get('league', 'Unknown League')
        market = first_combo.get('market', 'Unknown Market')
        
        # Create event name
        event_name = f"{home_team} vs {away_team}"
        
        # Parse kickoff datetime
        kickoff = None
        if kickoff_datetime:
            try:
                # Handle different datetime formats
                if isinstance(kickoff_datetime, str):
                    if 'T' in kickoff_datetime:
                        kickoff = datetime.fromisoformat(kickoff_datetime.replace('Z', '+00:00'))
                    else:
                        kickoff = datetime.strptime(kickoff_datetime, '%Y-%m-%d %H:%M:%S')
                elif isinstance(kickoff_datetime, datetime):
                    kickoff = kickoff_datetime
            except (ValueError, TypeError):
                kickoff = None
        
        # Get default stake from request or use default
        default_stake = data.get('stake', 100.0)  # Default $100 per bet
        
        # Get default account from request data (optional)
        default_account = data.get('account')
        
        created_bets = []
        total_stake = 0
        
        # Create a bet for each combination in the arbitrage
        for i, combo in enumerate(combination_details):
            bookmaker = combo.get('bookmaker', 'Unknown')
            odds = float(combo.get('odds', 1.0))
            selection = combo.get('name', 'Unknown Selection')
            
            # Handle stakes data - check if it's the new format (list) or old format (dict)
            if isinstance(stakes_data, list) and i < len(stakes_data):
                # New format: stakes_data is a list of bet objects with stake and account
                bet_data = stakes_data[i]
                stake = float(bet_data.get('stake', default_stake))
                account = bet_data.get('account', default_account)
            elif isinstance(stakes_data, dict):
                # Old format: stakes_data is a dictionary with index as key
                stake = float(stakes_data.get(str(i), default_stake))
                account = default_account
            else:
                # Fallback to defaults
                stake = default_stake
                account = default_account
            
            total_stake += stake
            
            # Calculate potential payout
            potential_payout = stake * odds
            
            # Resolve sportsbook ID and name
            sportsbook_id, sportsbook_name = resolve_sportsbook_id(bookmaker)
            
            # Resolve account ID and identifier
            account_id, account_identifier = resolve_account_id(account)
            
            # Create the bet
            bet = Bet(
                sport='Football',  # Assuming football for now
                event_name=event_name,
                bet_type=market,
                selection=selection,
                sportsbook_id=sportsbook_id,
                account_id=account_id,
                odds=odds,
                stake=stake,
                status='pending',
                potential_payout=potential_payout,
                actual_payout=0.0,
                profit_loss=0.0,
                date_placed=datetime.now(),
                date_settled=None,
                kickoff=kickoff,
                notes=f"Added from arbitrage opportunity (Profit: {profit}%)"
            )
            
            db.session.add(bet)
            created_bets.append(bet)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully created {len(created_bets)} bets from arbitrage opportunity',
            'bets_created': len(created_bets),
            'total_stake': total_stake,
            'expected_profit_percentage': profit,
            'bets': [bet.to_dict() for bet in created_bets]
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
