#!/usr/bin/env python3
"""
Initialize or migrate the database to ensure it has the latest schema.
This script will be run automatically when the app starts.
"""

import sqlite3
import os
from pathlib import Path

def ensure_account_columns():
    """Ensure account columns exist in bet and transaction tables, and accounts table exists"""
    
    # Path to the database
    db_path = Path(__file__).parent / 'instance' / 'bettracker.db'
    
    # Only proceed if database exists
    if not db_path.exists():
        print("Database doesn't exist yet - will be created with correct schema")
        return True
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check and add account column to bet table
        cursor.execute("PRAGMA table_info(bet)")
        bet_columns = [column[1] for column in cursor.fetchall()]
        
        if 'account' not in bet_columns:
            print("Adding account column to bet table...")
            cursor.execute('ALTER TABLE bet ADD COLUMN account VARCHAR(100)')
            print("✓ Account column added to bet table")
        
        # Check and add account column to transaction table
        cursor.execute("PRAGMA table_info(`transaction`)")
        transaction_columns = [column[1] for column in cursor.fetchall()]
        
        if 'account' not in transaction_columns:
            print("Adding account column to transaction table...")
            cursor.execute('ALTER TABLE `transaction` ADD COLUMN account VARCHAR(100)')
            print("✓ Account column added to transaction table")
        
        # Check if accounts table exists, create if not
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'")
        accounts_table_exists = cursor.fetchone() is not None
        
        if not accounts_table_exists:
            print("Creating accounts table...")
            cursor.execute('''
                CREATE TABLE accounts (
                    id INTEGER PRIMARY KEY,
                    account_identifier VARCHAR(100) UNIQUE NOT NULL,
                    account_type VARCHAR(20) NOT NULL,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    is_active BOOLEAN DEFAULT 1 NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    notes TEXT
                )
            ''')
            print("✓ Accounts table created")
        else:
            # Check if name column exists and has unique constraint
            cursor.execute("PRAGMA table_info(accounts)")
            accounts_columns = {column[1]: column for column in cursor.fetchall()}
            
            if 'name' not in accounts_columns:
                print("Adding name column to accounts table...")
                cursor.execute('ALTER TABLE accounts ADD COLUMN name VARCHAR(100)')
                print("✓ Name column added to accounts table")
            
            # Check if name column has unique constraint by checking indexes
            cursor.execute("PRAGMA index_list(accounts)")
            indexes = cursor.fetchall()
            name_has_unique = False
            for index in indexes:
                cursor.execute(f"PRAGMA index_info({index[1]})")
                index_info = cursor.fetchall()
                for info in index_info:
                    if info[2] == 'name' and index[2]:  # index[2] is unique flag
                        name_has_unique = True
                        break
            
            if not name_has_unique:
                print("Adding unique constraint to name column...")
                try:
                    # SQLite doesn't support adding constraints to existing columns directly
                    # We need to recreate the table
                    cursor.execute('''
                        CREATE TABLE accounts_new (
                            id INTEGER PRIMARY KEY,
                            account_identifier VARCHAR(100) UNIQUE NOT NULL,
                            account_type VARCHAR(20) NOT NULL,
                            name VARCHAR(100) UNIQUE NOT NULL,
                            is_active BOOLEAN DEFAULT 1 NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            notes TEXT
                        )
                    ''')
                    
                    # Copy data from old table to new table
                    cursor.execute('''
                        INSERT INTO accounts_new (id, account_identifier, account_type, name, is_active, created_at, updated_at, notes)
                        SELECT id, account_identifier, account_type, 
                               COALESCE(name, 'Account_' || id) as name,
                               is_active, created_at, updated_at, notes
                        FROM accounts
                    ''')
                    
                    # Drop old table and rename new table
                    cursor.execute('DROP TABLE accounts')
                    cursor.execute('ALTER TABLE accounts_new RENAME TO accounts')
                    print("✓ Unique constraint added to name column")
                except Exception as e:
                    print(f"Warning: Could not add unique constraint to name column: {e}")
        
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Migration error: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    ensure_account_columns()
