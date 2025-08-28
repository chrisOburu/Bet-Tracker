from flask import Blueprint, request, jsonify
from app import db
from app.models.account import Account
from datetime import datetime
from sqlalchemy import desc, asc, or_

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('/accounts', methods=['GET'])
def get_accounts():
    """Get all accounts with optional filtering and sorting"""
    try:
        # Get query parameters
        search = request.args.get('search', '')
        account_type = request.args.get('account_type')  # 'email' or 'phone'
        is_active = request.args.get('is_active')
        sort_by = request.args.get('sort_by', 'created_at')  # created_at, account_identifier, name
        sort_order = request.args.get('sort_order', 'desc')  # asc or desc
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Build query
        query = Account.query
        
        # Apply filters
        if search:
            query = query.filter(or_(
                Account.account_identifier.ilike(f'%{search}%'),
                Account.name.ilike(f'%{search}%'),
                Account.notes.ilike(f'%{search}%')
            ))
        
        if account_type:
            query = query.filter(Account.account_type == account_type)
        
        if is_active is not None:
            is_active_bool = is_active.lower() in ['true', '1', 'yes']
            query = query.filter(Account.is_active == is_active_bool)
        
        # Apply sorting
        sort_column = getattr(Account, sort_by, Account.created_at)
        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # Apply pagination
        paginated_accounts = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'accounts': [account.to_dict() for account in paginated_accounts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated_accounts.total,
                'pages': paginated_accounts.pages,
                'has_next': paginated_accounts.has_next,
                'has_prev': paginated_accounts.has_prev
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/accounts', methods=['POST'])
def create_account():
    """Create a new account"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if 'account_identifier' not in data:
            return jsonify({'error': 'account_identifier is required'}), 400
        
        if 'name' not in data or not data['name'].strip():
            return jsonify({'error': 'name is required'}), 400
        
        account_identifier = data['account_identifier'].strip()
        account_name = data['name'].strip()
        
        if not account_identifier:
            return jsonify({'error': 'account_identifier cannot be empty'}), 400
        
        # Check if account identifier already exists
        existing_account = Account.query.filter_by(account_identifier=account_identifier).first()
        if existing_account:
            return jsonify({'error': 'Account with this identifier already exists'}), 400
        
        # Check if account name already exists
        existing_name = Account.query.filter_by(name=account_name).first()
        if existing_name:
            return jsonify({'error': 'Account with this name already exists'}), 400
        
        # Auto-detect account type if not provided
        account_type = data.get('account_type')
        if not account_type:
            account_type = Account.detect_account_type(account_identifier)
        
        # Create new account
        account = Account(
            account_identifier=account_identifier,
            account_type=account_type,
            name=account_name,
            is_active=data.get('is_active', True),
            notes=data.get('notes', '').strip() or None
        )
        
        db.session.add(account)
        db.session.commit()
        
        return jsonify(account.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/accounts/<int:account_id>', methods=['GET'])
def get_account(account_id):
    """Get a specific account by ID"""
    try:
        account = Account.query.get_or_404(account_id)
        return jsonify(account.to_dict())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/accounts/<int:account_id>', methods=['PUT'])
def update_account(account_id):
    """Update an account"""
    try:
        account = Account.query.get_or_404(account_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields if provided
        if 'account_identifier' in data:
            new_identifier = data['account_identifier'].strip()
            if not new_identifier:
                return jsonify({'error': 'account_identifier cannot be empty'}), 400
            
            # Check if new identifier conflicts with existing account
            existing_account = Account.query.filter(
                Account.account_identifier == new_identifier,
                Account.id != account_id
            ).first()
            if existing_account:
                return jsonify({'error': 'Account with this identifier already exists'}), 400
            
            account.account_identifier = new_identifier
            
            # Auto-update account type based on new identifier
            account.account_type = Account.detect_account_type(new_identifier)
        
        if 'name' in data:
            new_name = data['name'].strip()
            if not new_name:
                return jsonify({'error': 'name cannot be empty'}), 400
            
            # Check if new name conflicts with existing account
            existing_name = Account.query.filter(
                Account.name == new_name,
                Account.id != account_id
            ).first()
            if existing_name:
                return jsonify({'error': 'Account with this name already exists'}), 400
            
            account.name = new_name
        
        if 'account_type' in data:
            account.account_type = data['account_type']
        
        if 'is_active' in data:
            account.is_active = data['is_active']
        
        if 'notes' in data:
            account.notes = data['notes'].strip() or None
        
        account.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify(account.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/accounts/<int:account_id>', methods=['DELETE'])
def delete_account(account_id):
    """Delete an account"""
    try:
        account = Account.query.get_or_404(account_id)
        
        db.session.delete(account)
        db.session.commit()
        
        return jsonify({'message': 'Account deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/accounts/stats', methods=['GET'])
def get_account_stats():
    """Get account statistics"""
    try:
        total_accounts = Account.query.count()
        active_accounts = Account.query.filter_by(is_active=True).count()
        email_accounts = Account.query.filter_by(account_type='email').count()
        phone_accounts = Account.query.filter_by(account_type='phone').count()
        
        return jsonify({
            'total_accounts': total_accounts,
            'active_accounts': active_accounts,
            'inactive_accounts': total_accounts - active_accounts,
            'email_accounts': email_accounts,
            'phone_accounts': phone_accounts
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
