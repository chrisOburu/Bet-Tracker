from flask import Blueprint, request, jsonify
from app import db
from app.models.arbitrage import Arbitrage
from datetime import datetime
from sqlalchemy import desc, asc, func
import json
from collections import defaultdict

arbitrages_bp = Blueprint('arbitrages', __name__)

@arbitrages_bp.route('/arbitrages/grouped', methods=['GET'])
def get_grouped_arbitrages():
    """Get arbitrage opportunities grouped by match signature with pagination"""
    try:
        # Get query parameters
        min_profit = request.args.get('min_profit', type=float)
        max_profit = request.args.get('max_profit', type=float)
        market_name = request.args.get('market_name')
        league = request.args.get('league')
        country = request.args.get('country')
        is_active = request.args.get('is_active', type=bool)
        sort_by = request.args.get('sort_by', 'profit')  # profit, kickoff_datetime, date_created
        sort_order = request.args.get('sort_order', 'desc')  # asc or desc
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Build query
        query = Arbitrage.query
        
        if min_profit is not None:
            query = query.filter(Arbitrage.profit >= min_profit)
        
        if max_profit is not None:
            query = query.filter(Arbitrage.profit <= max_profit)
        
        if market_name:
            query = query.filter(Arbitrage.market_name.ilike(f'%{market_name}%'))
        
        if league:
            query = query.filter(Arbitrage.league.ilike(f'%{league}%'))
        
        if country:
            query = query.filter(Arbitrage.country.ilike(f'%{country}%'))
        
        if is_active is not None:
            query = query.filter(Arbitrage.is_active == is_active)
        
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
            
            # Create grouped entry
            grouped_entry = {
                'match_signature': match_signature,
                'best_arbitrage': best_arbitrage.to_dict(),
                'total_opportunities': len(arbitrages),
                'max_profit': max(arb.profit for arb in arbitrages),
                'min_profit': min(arb.profit for arb in arbitrages),
                'markets_count': len(set(arb.market_name for arb in arbitrages)),
                'all_arbitrages': [arb.to_dict() for arb in sorted_arbitrages]
            }
            
            best_arbitrages.append(grouped_entry)
        
        # Sort the grouped results
        if sort_by == 'profit':
            best_arbitrages.sort(key=lambda x: x['best_arbitrage']['profit'], reverse=(sort_order == 'desc'))
        elif sort_by == 'kickoff_datetime':
            best_arbitrages.sort(key=lambda x: x['best_arbitrage']['kickoff_datetime'], reverse=(sort_order == 'desc'))
        elif sort_by == 'date_created':
            best_arbitrages.sort(key=lambda x: x['best_arbitrage']['date_created'], reverse=(sort_order == 'desc'))
        
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

@arbitrages_bp.route('/arbitrages/signature/<match_signature>', methods=['GET'])
def get_arbitrages_by_signature(match_signature):
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
        
        return jsonify({
            'match_signature': match_signature,
            'arbitrages': [arbitrage.to_dict() for arbitrage in arbitrages],
            'total_count': len(arbitrages),
            'max_profit': max(arb.profit for arb in arbitrages),
            'min_profit': min(arb.profit for arb in arbitrages),
            'markets': list(set(arb.market_name for arb in arbitrages))
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
        market_name = request.args.get('market_name')
        league = request.args.get('league')
        country = request.args.get('country')
        is_active = request.args.get('is_active', type=bool)
        sort_by = request.args.get('sort_by', 'profit')  # profit, kickoff_datetime, date_created
        sort_order = request.args.get('sort_order', 'desc')  # asc or desc
        
        # Build query
        query = Arbitrage.query
        
        if min_profit is not None:
            query = query.filter(Arbitrage.profit >= min_profit)
        
        if max_profit is not None:
            query = query.filter(Arbitrage.profit <= max_profit)
        
        if market_name:
            query = query.filter(Arbitrage.market_name.ilike(f'%{market_name}%'))
        
        if league:
            query = query.filter(Arbitrage.league.ilike(f'%{league}%'))
        
        if country:
            query = query.filter(Arbitrage.country.ilike(f'%{country}%'))
        
        if is_active is not None:
            query = query.filter(Arbitrage.is_active == is_active)
        
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
        required_fields = ['profit', 'market_name', 'home_team', 'away_team', 'match_signature', 'kickoff_datetime', 'combination_details']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse kickoff datetime
        try:
            kickoff_dt = datetime.fromisoformat(data['kickoff_datetime'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid kickoff_datetime format'}), 400
        
        # Ensure combination_details is a JSON string
        combination_details = data['combination_details']
        if isinstance(combination_details, (list, dict)):
            combination_details = json.dumps(combination_details)
        
        arbitrage = Arbitrage(
            profit=float(data['profit']),
            market_name=data['market_name'],
            home_team=data['home_team'],
            away_team=data['away_team'],
            league=data.get('league'),
            country=data.get('country'),
            match_signature=data['match_signature'],
            kickoff_datetime=kickoff_dt,
            combination_details=combination_details,
            is_active=data.get('is_active', True)
        )
        
        db.session.add(arbitrage)
        db.session.commit()
        
        return jsonify(arbitrage.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages/<int:arbitrage_id>', methods=['PUT'])
def update_arbitrage(arbitrage_id):
    """Update an arbitrage opportunity (mainly to mark as inactive)"""
    try:
        arbitrage = Arbitrage.query.get_or_404(arbitrage_id)
        data = request.get_json()
        
        # Update fields if provided
        if 'is_active' in data:
            arbitrage.is_active = data['is_active']
        
        if 'profit' in data:
            arbitrage.profit = float(data['profit'])
        
        if 'combination_details' in data:
            combination_details = data['combination_details']
            if isinstance(combination_details, (list, dict)):
                combination_details = json.dumps(combination_details)
            arbitrage.combination_details = combination_details
        
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
        # Get query parameters for filtering
        is_active = request.args.get('is_active', type=bool)
        
        # Build base query
        query = Arbitrage.query
        
        if is_active is not None:
            query = query.filter(Arbitrage.is_active == is_active)
        
        arbitrages = query.all()
        
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
        active_arbitrages = [arb for arb in arbitrages if arb.is_active]
        profits = [arb.profit for arb in arbitrages]
        
        # Market frequency
        market_counts = {}
        league_counts = {}
        
        for arb in arbitrages:
            market_counts[arb.market_name] = market_counts.get(arb.market_name, 0) + 1
            if arb.league:
                league_counts[arb.league] = league_counts.get(arb.league, 0) + 1
        
        most_common_market = max(market_counts.items(), key=lambda x: x[1])[0] if market_counts else None
        most_common_league = max(league_counts.items(), key=lambda x: x[1])[0] if league_counts else None
        
        return jsonify({
            'total_opportunities': len(arbitrages),
            'active_opportunities': len(active_arbitrages),
            'average_profit': round(sum(profits) / len(profits), 2) if profits else 0,
            'max_profit': round(max(profits), 2) if profits else 0,
            'min_profit': round(min(profits), 2) if profits else 0,
            'most_common_market': most_common_market,
            'most_common_league': most_common_league,
            'market_distribution': market_counts,
            'league_distribution': league_counts
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@arbitrages_bp.route('/arbitrages/import', methods=['POST'])
def import_arbitrages():
    """Import arbitrage opportunities from JSON file"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, list):
            return jsonify({'error': 'Expected a list of arbitrage opportunities'}), 400
        
        imported_count = 0
        errors = []
        
        for i, arb_data in enumerate(data):
            try:
                # Extract team names from combination_details
                combination_details = arb_data.get('combination_details', [])
                if not combination_details:
                    continue
                
                # Get home and away team from first combination
                first_combo = combination_details[0] if combination_details else {}
                home_team = first_combo.get('home_team', 'Unknown')
                away_team = first_combo.get('away_team', 'Unknown')
                league = first_combo.get('league', 'Unknown')
                country = first_combo.get('country', 'Unknown')
                
                # Parse kickoff datetime
                kickoff_str = arb_data.get('kickoff_datetime', '')
                try:
                    if kickoff_str:
                        kickoff_dt = datetime.fromisoformat(kickoff_str.replace('Z', '+00:00'))
                    else:
                        kickoff_dt = datetime.utcnow()
                except ValueError:
                    kickoff_dt = datetime.utcnow()
                
                # Check if this arbitrage already exists
                existing = Arbitrage.query.filter_by(
                    match_signature=arb_data.get('match_signature', ''),
                    market_name=arb_data.get('market_name', ''),
                    profit=arb_data.get('profit', 0)
                ).first()
                
                if existing:
                    continue  # Skip duplicates
                
                arbitrage = Arbitrage(
                    profit=float(arb_data.get('profit', 0)),
                    market_name=arb_data.get('market_name', ''),
                    home_team=home_team,
                    away_team=away_team,
                    league=league,
                    country=country,
                    match_signature=arb_data.get('match_signature', ''),
                    kickoff_datetime=kickoff_dt,
                    combination_details=json.dumps(combination_details),
                    is_active=True
                )
                
                db.session.add(arbitrage)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {i}: {str(e)}")
                continue
        
        db.session.commit()
        
        return jsonify({
            'imported_count': imported_count,
            'errors': errors,
            'message': f'Successfully imported {imported_count} arbitrage opportunities'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
