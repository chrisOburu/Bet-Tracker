from flask import Blueprint, request, jsonify
from app import db
from app.models.sportsbook import Sportsbook
from datetime import datetime
from sqlalchemy import desc, asc

sportsbooks_bp = Blueprint('sportsbooks', __name__)

@sportsbooks_bp.route('/sportsbooks', methods=['GET'])
def get_sportsbooks():
    """Get all sportsbooks with optional filtering"""
    try:
        # Get query parameters
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        country = request.args.get('country')
        search = request.args.get('search')
        sort_by = request.args.get('sort_by', 'name')  # name, created_at, country
        sort_order = request.args.get('sort_order', 'asc')  # asc or desc
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Build query
        query = Sportsbook.query
        
        if active_only:
            query = query.filter(Sportsbook.is_active == True)
        
        if country:
            query = query.filter(Sportsbook.country.ilike(f'%{country}%'))
        
        if search:
            query = query.filter(
                db.or_(
                    Sportsbook.name.ilike(f'%{search}%'),
                    Sportsbook.display_name.ilike(f'%{search}%')
                )
            )
        
        # Apply sorting
        sort_column = getattr(Sportsbook, sort_by, Sportsbook.name)
        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # Apply pagination
        total_count = query.count()
        sportsbooks = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return jsonify({
            'sportsbooks': [sportsbook.to_dict() for sportsbook in sportsbooks],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page,
                'has_next': page * per_page < total_count,
                'has_prev': page > 1
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sportsbooks_bp.route('/sportsbooks/active', methods=['GET'])
def get_active_sportsbooks():
    """Get all active sportsbooks for dropdowns"""
    try:
        sportsbooks = Sportsbook.get_active_sportsbooks()
        return jsonify({
            'sportsbooks': [sportsbook.to_dict() for sportsbook in sportsbooks]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sportsbooks_bp.route('/sportsbooks', methods=['POST'])
def create_sportsbook():
    """Create a new sportsbook"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Sportsbook name is required'}), 400
        
        # Check if sportsbook already exists
        existing = Sportsbook.get_by_name(data['name'])
        if existing:
            return jsonify({'error': 'A sportsbook with this name already exists'}), 400
        
        sportsbook = Sportsbook(
            name=data['name'].strip(),
            display_name=data.get('display_name', '').strip() or None,
            website_url=data.get('website_url', '').strip() or None,
            logo_url=data.get('logo_url', '').strip() or None,
            is_active=data.get('is_active', True),
            country=data.get('country', '').strip() or None,
            description=data.get('description', '').strip() or None
        )
        
        db.session.add(sportsbook)
        db.session.commit()
        
        return jsonify(sportsbook.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sportsbooks_bp.route('/sportsbooks/<int:sportsbook_id>', methods=['GET'])
def get_sportsbook(sportsbook_id):
    """Get a specific sportsbook by ID"""
    try:
        sportsbook = Sportsbook.query.get_or_404(sportsbook_id)
        return jsonify(sportsbook.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sportsbooks_bp.route('/sportsbooks/<int:sportsbook_id>', methods=['PUT'])
def update_sportsbook(sportsbook_id):
    """Update a sportsbook"""
    try:
        sportsbook = Sportsbook.query.get_or_404(sportsbook_id)
        data = request.get_json()
        
        # Check if name change would create a duplicate
        if 'name' in data and data['name'] != sportsbook.name:
            existing = Sportsbook.get_by_name(data['name'])
            if existing and existing.id != sportsbook_id:
                return jsonify({'error': 'A sportsbook with this name already exists'}), 400
        
        # Update fields if provided
        if 'name' in data:
            sportsbook.name = data['name'].strip()
        
        if 'display_name' in data:
            sportsbook.display_name = data['display_name'].strip() or None
        
        if 'website_url' in data:
            sportsbook.website_url = data['website_url'].strip() or None
        
        if 'logo_url' in data:
            sportsbook.logo_url = data['logo_url'].strip() or None
        
        if 'is_active' in data:
            sportsbook.is_active = bool(data['is_active'])
        
        if 'country' in data:
            sportsbook.country = data['country'].strip() or None
        
        if 'description' in data:
            sportsbook.description = data['description'].strip() or None
        
        # Update the updated_at timestamp
        sportsbook.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify(sportsbook.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sportsbooks_bp.route('/sportsbooks/<int:sportsbook_id>', methods=['DELETE'])
def delete_sportsbook(sportsbook_id):
    """Delete a sportsbook"""
    try:
        sportsbook = Sportsbook.query.get_or_404(sportsbook_id)
        
        # Check if there are any bets using this sportsbook
        # We'll import Bet here to avoid circular imports
        from app.models.bet import Bet
        bet_count = Bet.query.filter(Bet.sportsbook_id == sportsbook.id).count()
        
        if bet_count > 0:
            return jsonify({
                'error': f'Cannot delete sportsbook. It is referenced by {bet_count} bet(s). '
                         'Consider deactivating it instead.'
            }), 400
        
        db.session.delete(sportsbook)
        db.session.commit()
        
        return jsonify({'message': 'Sportsbook deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sportsbooks_bp.route('/sportsbooks/<int:sportsbook_id>/toggle-active', methods=['PATCH'])
def toggle_sportsbook_active(sportsbook_id):
    """Toggle the active status of a sportsbook"""
    try:
        sportsbook = Sportsbook.query.get_or_404(sportsbook_id)
        sportsbook.is_active = not sportsbook.is_active
        sportsbook.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Sportsbook {"activated" if sportsbook.is_active else "deactivated"} successfully',
            'sportsbook': sportsbook.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sportsbooks_bp.route('/sportsbooks/bulk-create', methods=['POST'])
def bulk_create_sportsbooks():
    """Create multiple sportsbooks at once"""
    try:
        data = request.get_json()
        
        if not data.get('sportsbooks'):
            return jsonify({'error': 'No sportsbooks data provided'}), 400
        
        created_sportsbooks = []
        skipped_sportsbooks = []
        
        for sportsbook_data in data['sportsbooks']:
            if not sportsbook_data.get('name'):
                continue
            
            # Check if sportsbook already exists
            existing = Sportsbook.get_by_name(sportsbook_data['name'])
            if existing:
                skipped_sportsbooks.append(sportsbook_data['name'])
                continue
            
            sportsbook = Sportsbook(
                name=sportsbook_data['name'].strip(),
                display_name=sportsbook_data.get('display_name', '').strip() or None,
                website_url=sportsbook_data.get('website_url', '').strip() or None,
                logo_url=sportsbook_data.get('logo_url', '').strip() or None,
                is_active=sportsbook_data.get('is_active', True),
                country=sportsbook_data.get('country', '').strip() or None,
                description=sportsbook_data.get('description', '').strip() or None
            )
            
            db.session.add(sportsbook)
            created_sportsbooks.append(sportsbook)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully created {len(created_sportsbooks)} sportsbooks',
            'created_count': len(created_sportsbooks),
            'skipped_count': len(skipped_sportsbooks),
            'skipped_names': skipped_sportsbooks,
            'created_sportsbooks': [sb.to_dict() for sb in created_sportsbooks]
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sportsbooks_bp.route('/sportsbooks/stats', methods=['GET'])
def get_sportsbook_stats():
    """Get sportsbook statistics"""
    try:
        # We'll import Bet here to avoid circular imports
        from app.models.bet import Bet
        
        total_sportsbooks = Sportsbook.query.count()
        active_sportsbooks = Sportsbook.query.filter_by(is_active=True).count()
        
        # Get sportsbook usage statistics
        sportsbook_usage = db.session.query(
            Sportsbook.name.label('sportsbook_name'),
            Sportsbook.id.label('sportsbook_id'),
            db.func.count(Bet.id).label('bet_count'),
            db.func.sum(Bet.stake).label('total_stake'),
            db.func.avg(Bet.odds).label('avg_odds')
        ).join(Bet, Bet.sportsbook_id == Sportsbook.id).group_by(Sportsbook.id).order_by(db.desc('bet_count')).limit(10).all()
        
        usage_stats = []
        for usage in sportsbook_usage:
            usage_stats.append({
                'sportsbook_name': usage.sportsbook_name,
                'sportsbook_id': usage.sportsbook_id,
                'bet_count': usage.bet_count,
                'total_stake': float(usage.total_stake) if usage.total_stake else 0,
                'avg_odds': float(usage.avg_odds) if usage.avg_odds else 0,
                'is_registered': True  # All results from this query are registered sportsbooks
            })
        
        return jsonify({
            'total_sportsbooks': total_sportsbooks,
            'active_sportsbooks': active_sportsbooks,
            'inactive_sportsbooks': total_sportsbooks - active_sportsbooks,
            'top_used_sportsbooks': usage_stats
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
