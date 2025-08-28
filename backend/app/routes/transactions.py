from flask import Blueprint, request, jsonify
from app import db
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.sportsbook import Sportsbook
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

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

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Get all transactions with optional filtering and pagination"""
    try:
        # Get query parameters
        transaction_type = request.args.get('type')  # 'deposit' or 'withdrawal'
        sportsbook = request.args.get('sportsbook')
        status = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        # Build query
        query = Transaction.query
        
        if transaction_type:
            query = query.filter(Transaction.transaction_type == transaction_type)
        
        if sportsbook:
            # Filter by sportsbook name through the relationship
            query = query.join(Sportsbook).filter(Sportsbook.name.ilike(f'%{sportsbook}%'))
        
        if status:
            query = query.filter(Transaction.status == status)
        
        if start_date:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.date_created >= start)
        
        if end_date:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.date_created <= end)
        
        # Order by date_created descending
        query = query.order_by(Transaction.date_created.desc())
        
        # Apply pagination
        paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'transactions': [transaction.to_dict() for transaction in paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages,
                'has_next': paginated.has_next,
                'has_prev': paginated.has_prev
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    """Create a new transaction"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['transaction_type', 'sportsbook', 'amount']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate transaction type
        if data['transaction_type'] not in ['deposit', 'withdrawal']:
            return jsonify({'error': 'transaction_type must be either "deposit" or "withdrawal"'}), 400
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid amount format'}), 400
        
        # Get tax and transaction charges from user input (no automatic calculation)
        tax = data.get('tax', 0.0)  # Default to 0 if not provided
        transaction_charges = data.get('transaction_charges', 0.0)  # Default to 0 if not provided
        
        # Resolve sportsbook ID and name
        sportsbook_id, sportsbook_name = resolve_sportsbook_id(data.get('sportsbook'))
        
        # Resolve account ID and identifier
        account_id, account_identifier = resolve_account_id(data.get('account'))
        
        # Create new transaction
        transaction = Transaction(
            transaction_type=data['transaction_type'],
            sportsbook_id=sportsbook_id,
            account_id=account_id,
            amount=amount,
            tax=tax,
            transaction_charges=transaction_charges,
            payment_method=data.get('payment_method'),
            reference_id=data.get('reference_id'),
            status=data.get('status', 'completed'),
            date_processed=datetime.now() if data.get('status', 'completed') == 'completed' else None,
            notes=data.get('notes')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify(transaction.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Update an existing transaction"""
    try:
        transaction = Transaction.query.get_or_404(transaction_id)
        data = request.get_json()
        
        # Update fields if provided
        if 'transaction_type' in data:
            if data['transaction_type'] not in ['deposit', 'withdrawal']:
                return jsonify({'error': 'transaction_type must be either "deposit" or "withdrawal"'}), 400
            transaction.transaction_type = data['transaction_type']
        
        if 'sportsbook' in data:
            sportsbook_id, sportsbook_name = resolve_sportsbook_id(data['sportsbook'])
            transaction.sportsbook_id = sportsbook_id
        
        if 'account' in data:
            account_id, account_identifier = resolve_account_id(data['account'])
            transaction.account_id = account_id
        
        if 'amount' in data:
            try:
                amount = float(data['amount'])
                if amount <= 0:
                    return jsonify({'error': 'Amount must be greater than 0'}), 400
                transaction.amount = amount
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid amount format'}), 400
        
        if 'tax' in data:
            try:
                transaction.tax = float(data['tax']) if data['tax'] else 0.0
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid tax format'}), 400
        
        if 'transaction_charges' in data:
            try:
                transaction.transaction_charges = float(data['transaction_charges']) if data['transaction_charges'] else 0.0
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid transaction_charges format'}), 400
        
        if 'payment_method' in data:
            transaction.payment_method = data['payment_method']
        
        if 'reference_id' in data:
            transaction.reference_id = data['reference_id']
        
        if 'status' in data:
            transaction.status = data['status']
            if data['status'] == 'completed' and not transaction.date_processed:
                transaction.date_processed = datetime.now()
        
        if 'notes' in data:
            transaction.notes = data['notes']
        
        db.session.commit()
        
        return jsonify(transaction.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Delete a transaction"""
    try:
        transaction = Transaction.query.get_or_404(transaction_id)
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({'message': 'Transaction deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/stats', methods=['GET'])
def get_transaction_stats():
    """Get transaction statistics"""
    try:
        # Get query parameters for date filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        sportsbook = request.args.get('sportsbook')
        
        # Build base query
        query = Transaction.query.filter(Transaction.status == 'completed')
        
        if start_date:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.date_processed >= start)
        
        if end_date:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.date_processed <= end)
        
        if sportsbook:
            # Filter by sportsbook name through the relationship
            query = query.join(Sportsbook).filter(Sportsbook.name.ilike(f'%{sportsbook}%'))
        
        transactions = query.all()
        
        # Calculate statistics
        total_deposits = sum(t.amount for t in transactions if t.transaction_type == 'deposit')
        total_withdrawals = sum(t.amount for t in transactions if t.transaction_type == 'withdrawal')
        
        # Calculate total tax and charges
        total_tax = sum(t.tax or 0 for t in transactions)
        total_charges = sum(t.transaction_charges or 0 for t in transactions)
        
        # Net position: withdrawals - deposits - tax - charges (money out perspective)
        net_position = total_withdrawals - total_deposits - total_tax - total_charges
        
        deposit_count = len([t for t in transactions if t.transaction_type == 'deposit'])
        withdrawal_count = len([t for t in transactions if t.transaction_type == 'withdrawal'])
        
        # Group by sportsbook
        sportsbook_stats = {}
        for transaction in transactions:
            # Get sportsbook name from relationship
            sb = transaction.sportsbook_rel.name if transaction.sportsbook_rel else 'Unknown'
            if sb not in sportsbook_stats:
                sportsbook_stats[sb] = {
                    'deposits': 0,
                    'withdrawals': 0,
                    'net': 0,
                    'deposit_count': 0,
                    'withdrawal_count': 0
                }
            
            if transaction.transaction_type == 'deposit':
                sportsbook_stats[sb]['deposits'] += transaction.amount
                sportsbook_stats[sb]['deposit_count'] += 1
            else:
                sportsbook_stats[sb]['withdrawals'] += transaction.amount
                sportsbook_stats[sb]['withdrawal_count'] += 1
            
            sportsbook_stats[sb]['net'] = sportsbook_stats[sb]['deposits'] - sportsbook_stats[sb]['withdrawals']
        
        return jsonify({
            'total_deposits': round(total_deposits, 2),
            'total_withdrawals': round(total_withdrawals, 2),
            'net_position': round(net_position, 2),
            'total_tax': round(total_tax, 2),
            'total_charges': round(total_charges, 2),
            'deposit_count': deposit_count,
            'withdrawal_count': withdrawal_count,
            'total_transactions': len(transactions),
            'sportsbook_breakdown': sportsbook_stats
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
