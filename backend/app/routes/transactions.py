from flask import Blueprint, request, jsonify
from app import db
from app.models.transaction import Transaction
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Get all transactions with optional filtering"""
    try:
        # Get query parameters
        transaction_type = request.args.get('type')  # 'deposit' or 'withdrawal'
        sportsbook = request.args.get('sportsbook')
        status = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Transaction.query
        
        if transaction_type:
            query = query.filter(Transaction.transaction_type == transaction_type)
        
        if sportsbook:
            query = query.filter(Transaction.sportsbook.ilike(f'%{sportsbook}%'))
        
        if status:
            query = query.filter(Transaction.status == status)
        
        if start_date:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.date_created >= start)
        
        if end_date:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Transaction.date_created <= end)
        
        # Order by date_created descending
        transactions = query.order_by(Transaction.date_created.desc()).all()
        
        return jsonify([transaction.to_dict() for transaction in transactions])
    
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
        
        # Create new transaction
        transaction = Transaction(
            transaction_type=data['transaction_type'],
            sportsbook=data['sportsbook'],
            amount=amount,
            payment_method=data.get('payment_method'),
            reference_id=data.get('reference_id'),
            status=data.get('status', 'completed'),
            date_processed=datetime.utcnow() if data.get('status', 'completed') == 'completed' else None,
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
            transaction.sportsbook = data['sportsbook']
        
        if 'amount' in data:
            try:
                amount = float(data['amount'])
                if amount <= 0:
                    return jsonify({'error': 'Amount must be greater than 0'}), 400
                transaction.amount = amount
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid amount format'}), 400
        
        if 'payment_method' in data:
            transaction.payment_method = data['payment_method']
        
        if 'reference_id' in data:
            transaction.reference_id = data['reference_id']
        
        if 'status' in data:
            transaction.status = data['status']
            if data['status'] == 'completed' and not transaction.date_processed:
                transaction.date_processed = datetime.utcnow()
        
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
            query = query.filter(Transaction.sportsbook.ilike(f'%{sportsbook}%'))
        
        transactions = query.all()
        
        # Calculate statistics
        total_deposits = sum(t.amount for t in transactions if t.transaction_type == 'deposit')
        total_withdrawals = sum(t.amount for t in transactions if t.transaction_type == 'withdrawal')
        net_position = total_deposits - total_withdrawals
        
        deposit_count = len([t for t in transactions if t.transaction_type == 'deposit'])
        withdrawal_count = len([t for t in transactions if t.transaction_type == 'withdrawal'])
        
        # Group by sportsbook
        sportsbook_stats = {}
        for transaction in transactions:
            sb = transaction.sportsbook
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
            'deposit_count': deposit_count,
            'withdrawal_count': withdrawal_count,
            'total_transactions': len(transactions),
            'sportsbook_breakdown': sportsbook_stats
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
