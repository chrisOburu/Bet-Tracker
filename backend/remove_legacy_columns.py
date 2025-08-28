#!/usr/bin/env python3
"""
Remove legacy sportsbook and account columns from bet and transaction tables
"""

import sqlite3
import os
import sys

def remove_legacy_columns():
    """Remove old sportsbook and account columns from database"""
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'bet_tracker.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🗑️ Removing legacy columns...")
        
        # Check if legacy columns exist in bet table
        cursor.execute("PRAGMA table_info(bet)")
        bet_columns = [col[1] for col in cursor.fetchall()]
        
        legacy_bet_columns = []
        if 'sportsbook' in bet_columns:
            legacy_bet_columns.append('sportsbook')
        if 'account' in bet_columns:
            legacy_bet_columns.append('account')
        
        # Check if legacy columns exist in transaction table
        cursor.execute("PRAGMA table_info(transaction)")
        transaction_columns = [col[1] for col in cursor.fetchall()]
        
        legacy_transaction_columns = []
        if 'sportsbook' in transaction_columns:
            legacy_transaction_columns.append('sportsbook')
        if 'account' in transaction_columns:
            legacy_transaction_columns.append('account')
        
        if not legacy_bet_columns and not legacy_transaction_columns:
            print("✅ No legacy columns found - database is already clean!")
            return True
        
        # For SQLite, we need to recreate tables without the legacy columns
        # This is because SQLite doesn't support DROP COLUMN directly
        
        if legacy_bet_columns:
            print(f"📝 Recreating bet table without: {', '.join(legacy_bet_columns)}")
            
            # Create new bet table without legacy columns
            cursor.execute("""
                CREATE TABLE bet_new (
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
                    date_placed DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    date_settled DATETIME,
                    kickoff DATETIME,
                    notes TEXT,
                    FOREIGN KEY(sportsbook_id) REFERENCES sportsbook (id),
                    FOREIGN KEY(account_id) REFERENCES accounts (id)
                )
            """)
            
            # Copy data from old table (excluding legacy columns)
            cursor.execute("""
                INSERT INTO bet_new (
                    id, sport, event_name, bet_type, selection, sportsbook_id, account_id,
                    odds, stake, status, potential_payout, actual_payout, profit_loss,
                    date_placed, date_settled, kickoff, notes
                )
                SELECT 
                    id, sport, event_name, bet_type, selection, sportsbook_id, account_id,
                    odds, stake, status, potential_payout, actual_payout, profit_loss,
                    date_placed, date_settled, kickoff, notes
                FROM bet
            """)
            
            # Drop old table and rename new one
            cursor.execute("DROP TABLE bet")
            cursor.execute("ALTER TABLE bet_new RENAME TO bet")
            
            print("✅ Bet table recreated successfully")
        
        if legacy_transaction_columns:
            print(f"📝 Recreating transaction table without: {', '.join(legacy_transaction_columns)}")
            
            # Create new transaction table without legacy columns
            cursor.execute("""
                CREATE TABLE transaction_new (
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
                    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
                    date_processed DATETIME,
                    notes TEXT,
                    FOREIGN KEY(sportsbook_id) REFERENCES sportsbook (id),
                    FOREIGN KEY(account_id) REFERENCES accounts (id)
                )
            """)
            
            # Copy data from old table (excluding legacy columns)
            cursor.execute("""
                INSERT INTO transaction_new (
                    id, transaction_type, sportsbook_id, account_id, amount, tax,
                    transaction_charges, payment_method, reference_id, status,
                    date_created, date_processed, notes
                )
                SELECT 
                    id, transaction_type, sportsbook_id, account_id, amount, tax,
                    transaction_charges, payment_method, reference_id, status,
                    date_created, date_processed, notes
                FROM transaction
            """)
            
            # Drop old table and rename new one
            cursor.execute("DROP TABLE transaction")
            cursor.execute("ALTER TABLE transaction_new RENAME TO transaction")
            
            print("✅ Transaction table recreated successfully")
        
        conn.commit()
        conn.close()
        
        print("🎉 Legacy columns removed successfully!")
        print("   Database is now clean and ready for foreign key operations")
        return True
        
    except Exception as e:
        print(f"❌ Error removing legacy columns: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    success = remove_legacy_columns()
    sys.exit(0 if success else 1)
