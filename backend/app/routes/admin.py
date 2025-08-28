from flask import Blueprint, jsonify
import sqlite3
import os
from app import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/fix-schema', methods=['GET', 'POST'])
def fix_database_schema():
    """Special endpoint to fix database schema"""
    try:
        from flask import current_app
        
        # Get database path
        db_path = os.path.join(current_app.instance_path, 'bettracker.db')
        
        if not os.path.exists(db_path):
            return jsonify({'error': f'Database not found at {db_path}'}), 404
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check bet table schema
        cursor.execute("PRAGMA table_info(bet)")
        bet_columns = cursor.fetchall()
        bet_column_names = [col[1] for col in bet_columns]
        
        result = {'message': 'Schema check completed', 'changes': []}
        
        if 'sportsbook' in bet_column_names:
            result['changes'].append('Found legacy sportsbook column in bet table')
            
            # Get existing data
            cursor.execute("""
                SELECT id, sport, event_name, bet_type, selection, 
                       sportsbook_id, account_id, odds, stake, status, 
                       potential_payout, actual_payout, profit_loss, 
                       date_placed, date_settled, kickoff, notes 
                FROM bet
            """)
            bet_data = cursor.fetchall()
            
            # Drop and recreate table
            cursor.execute("DROP TABLE bet")
            cursor.execute("""
                CREATE TABLE bet (
                    id INTEGER NOT NULL PRIMARY KEY,
                    sport VARCHAR(100) NOT NULL,
                    event_name VARCHAR(200) NOT NULL,
                    bet_type VARCHAR(100) NOT NULL,
                    selection VARCHAR(200) NOT NULL,
                    sportsbook_id INTEGER,
                    account_id INTEGER,
                    odds FLOAT NOT NULL,
                    stake FLOAT NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'pending',
                    potential_payout FLOAT NOT NULL,
                    actual_payout FLOAT DEFAULT 0.0,
                    profit_loss FLOAT DEFAULT 0.0,
                    date_placed DATETIME NOT NULL,
                    date_settled DATETIME,
                    kickoff DATETIME,
                    notes TEXT,
                    FOREIGN KEY(sportsbook_id) REFERENCES sportsbook (id),
                    FOREIGN KEY(account_id) REFERENCES accounts (id)
                )
            """)
            
            # Restore data
            for row in bet_data:
                cursor.execute("""
                    INSERT INTO bet VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, row)
            
            result['changes'].append(f'Fixed bet table - restored {len(bet_data)} records')
        else:
            result['changes'].append('No legacy columns found in bet table')
        
        # Check transaction table
        cursor.execute("PRAGMA table_info(transaction)")
        transaction_columns = cursor.fetchall()
        transaction_column_names = [col[1] for col in transaction_columns]
        
        if 'sportsbook' in transaction_column_names:
            result['changes'].append('Found legacy sportsbook column in transaction table')
            
            # Get existing data  
            cursor.execute("""
                SELECT id, transaction_type, sportsbook_id, account_id, 
                       amount, tax, transaction_charges, payment_method, 
                       reference_id, status, date_created, date_processed, notes 
                FROM transaction
            """)
            transaction_data = cursor.fetchall()
            
            # Drop and recreate
            cursor.execute("DROP TABLE transaction")
            cursor.execute("""
                CREATE TABLE transaction (
                    id INTEGER NOT NULL PRIMARY KEY,
                    transaction_type VARCHAR(20) NOT NULL,
                    sportsbook_id INTEGER,
                    account_id INTEGER,
                    amount FLOAT NOT NULL,
                    tax FLOAT NOT NULL DEFAULT 0.0,
                    transaction_charges FLOAT NOT NULL DEFAULT 0.0,
                    payment_method VARCHAR(50),
                    reference_id VARCHAR(100),
                    status VARCHAR(20) DEFAULT 'completed',
                    date_created DATETIME,
                    date_processed DATETIME,
                    notes TEXT,
                    FOREIGN KEY(sportsbook_id) REFERENCES sportsbook (id),
                    FOREIGN KEY(account_id) REFERENCES accounts (id)
                )
            """)
            
            # Restore data
            for row in transaction_data:
                cursor.execute("""
                    INSERT INTO transaction VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, row)
            
            result['changes'].append(f'Fixed transaction table - restored {len(transaction_data)} records')
        else:
            result['changes'].append('No legacy columns found in transaction table')
        
        conn.commit()
        conn.close()
        
        # Verify the fix
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(bet)")
        new_bet_columns = [col[1] for col in cursor.fetchall()]
        cursor.execute("PRAGMA table_info(transaction)")
        new_transaction_columns = [col[1] for col in cursor.fetchall()]
        conn.close()
        
        result['new_bet_columns'] = new_bet_columns
        result['new_transaction_columns'] = new_transaction_columns
        result['success'] = True
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
