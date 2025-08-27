#!/usr/bin/env python3
"""
Migration script to add tax and transaction_charges columns to the transaction table
"""
import sqlite3
import os
from pathlib import Path

def migrate_database():
    # Path to the database
    db_path = Path(__file__).parent / 'instance' / 'bettracker.db'
    
    if not db_path.exists():
        print(f"Database file not found at {db_path}")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the columns already exist
        cursor.execute('PRAGMA table_info("transaction")')
        columns = [column[1] for column in cursor.fetchall()]
        
        print(f"Current columns in transaction table: {columns}")
        
        # Add tax column if it doesn't exist
        if 'tax' not in columns:
            print("Adding 'tax' column...")
            cursor.execute('ALTER TABLE "transaction" ADD COLUMN tax REAL NOT NULL DEFAULT 0.0')
            
            # Calculate tax for existing records (5% of amount)
            cursor.execute('UPDATE "transaction" SET tax = amount * 0.05')
            print("Updated existing records with calculated tax values")
        else:
            print("'tax' column already exists")
        
        # Add transaction_charges column if it doesn't exist
        if 'transaction_charges' not in columns:
            print("Adding 'transaction_charges' column...")
            cursor.execute('ALTER TABLE "transaction" ADD COLUMN transaction_charges REAL NOT NULL DEFAULT 1.150')
            print("Added transaction_charges column with default value 115.0")
        else:
            print("'transaction_charges' column already exists")
            cursor.execute('UPDATE "transaction" SET transaction_charges = 1.150')
            print("Updated existing records with transaction_charges value 1.150")
        # Commit the changes
        conn.commit()
        print("Migration completed successfully!")
        
        # Verify the changes
        cursor.execute('PRAGMA table_info("transaction")')
        updated_columns = [column[1] for column in cursor.fetchall()]
        print(f"Updated columns in transaction table: {updated_columns}")
        
        return True
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Starting database migration...")
    success = migrate_database()
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
