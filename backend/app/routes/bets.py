from flask import Blueprint, request, jsonify
from app import db
from app.models.bet import Bet
from datetime import datetime
from sqlalchemy import desc, case

bets_bp = Blueprint('bets', __name__)

@bets_bp.route('/bets', methods=['GET'])
def get_bets():
    """Get all bets with optional filtering"""
    status = request.args.get('status')
    sport = request.args.get('sport')
    
    query = Bet.query
    
    if status:
        query = query.filter(Bet.status == status)
    if sport:
        query = query.filter(Bet.sport == sport)
    
    # Order by: pending bets first (status='pending' gets priority 0, others get priority 1)
    # Then by date_placed descending (newest first)
    bets = query.order_by(
        case(
            (Bet.status == 'pending', 0),
            else_=1
        ),
        desc(Bet.date_placed)
    ).all()
    return jsonify([bet.to_dict() for bet in bets])

@bets_bp.route('/bets', methods=['POST'])
def create_bet():
    """Create a new bet"""
    data = request.get_json()
    
    try:
        # Calculate potential payout
        potential_payout = data['stake'] * data['odds']
        
        # Parse kickoff datetime if provided
        kickoff = None
        if 'kickoff' in data and data['kickoff']:
            try:
                kickoff = datetime.fromisoformat(data['kickoff'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid kickoff datetime format'}), 400
        
        bet = Bet(
            sport=data['sport'],
            event_name=data['event_name'],
            bet_type=data['bet_type'],
            selection=data['selection'],
            sportsbook=data['sportsbook'],
            odds=data['odds'],
            stake=data['stake'],
            potential_payout=potential_payout,
            kickoff=kickoff,
            notes=data.get('notes', '')
        )
        
        db.session.add(bet)
        db.session.commit()
        
        return jsonify(bet.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bets_bp.route('/bets/<int:bet_id>', methods=['PUT'])
def update_bet(bet_id):
    """Update a bet (usually to mark as won/lost)"""
    bet = Bet.query.get_or_404(bet_id)
    data = request.get_json()
    
    try:
        # Update fields
        for field in ['sport', 'event_name', 'bet_type', 'selection', 'sportsbook', 'odds', 'stake', 'notes']:
            if field in data:
                setattr(bet, field, data[field])
        
        # Handle kickoff datetime update
        if 'kickoff' in data:
            if data['kickoff']:
                try:
                    bet.kickoff = datetime.fromisoformat(data['kickoff'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'error': 'Invalid kickoff datetime format'}), 400
            else:
                bet.kickoff = None
        
        # Handle status change
        if 'status' in data:
            bet.status = data['status']
            
            if data['status'] == 'won':
                bet.actual_payout = data.get('actual_payout', bet.potential_payout)
                bet.profit_loss = bet.actual_payout - bet.stake
                bet.date_settled = datetime.utcnow()
            elif data['status'] == 'lost':
                bet.actual_payout = 0
                bet.profit_loss = -bet.stake
                bet.date_settled = datetime.utcnow()
            elif data['status'] == 'void':
                bet.actual_payout = bet.stake  # Stake returned
                bet.profit_loss = 0
                bet.date_settled = datetime.utcnow()
        
        # Recalculate potential payout if odds or stake changed
        if 'odds' in data or 'stake' in data:
            bet.potential_payout = bet.stake * bet.odds
        
        db.session.commit()
        return jsonify(bet.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bets_bp.route('/bets/<int:bet_id>', methods=['DELETE'])
def delete_bet(bet_id):
    """Delete a bet"""
    bet = Bet.query.get_or_404(bet_id)
    
    try:
        db.session.delete(bet)
        db.session.commit()
        return jsonify({'message': 'Bet deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bets_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get betting statistics"""
    all_bets = Bet.query.all()
    settled_bets = Bet.query.filter(Bet.status.in_(['won', 'lost', 'void'])).all()
    won_bets = Bet.query.filter(Bet.status == 'won').all()
    lost_bets = Bet.query.filter(Bet.status == 'lost').all()
    
    total_bets = len(all_bets)
    total_settled = len(settled_bets)
    total_won = len(won_bets)
    total_lost = len(lost_bets)
    
    total_staked = sum(bet.stake for bet in all_bets)
    total_profit_loss = sum(bet.profit_loss for bet in settled_bets)
    total_potential_winnings = sum(bet.potential_payout for bet in all_bets if bet.status == 'pending')
    
    win_rate = (total_won / total_settled * 100) if total_settled > 0 else 0
    roi = (total_profit_loss / total_staked * 100) if total_staked > 0 else 0
    
    # Get sports breakdown
    sports_stats = {}
    for bet in all_bets:
        if bet.sport not in sports_stats:
            sports_stats[bet.sport] = {
                'total_bets': 0,
                'total_staked': 0,
                'profit_loss': 0,
                'won': 0,
                'lost': 0
            }
        
        sports_stats[bet.sport]['total_bets'] += 1
        sports_stats[bet.sport]['total_staked'] += bet.stake
        sports_stats[bet.sport]['profit_loss'] += bet.profit_loss
        
        if bet.status == 'won':
            sports_stats[bet.sport]['won'] += 1
        elif bet.status == 'lost':
            sports_stats[bet.sport]['lost'] += 1
    
    return jsonify({
        'total_bets': total_bets,
        'total_settled': total_settled,
        'total_won': total_won,
        'total_lost': total_lost,
        'total_staked': round(total_staked, 2),
        'total_profit_loss': round(total_profit_loss, 2),
        'total_potential_winnings': round(total_potential_winnings, 2),
        'win_rate': round(win_rate, 2),
        'roi': round(roi, 2),
        'sports_stats': sports_stats
    })
