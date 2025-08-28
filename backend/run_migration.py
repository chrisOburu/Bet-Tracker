import sqlite3
import os
import sys

# Add the path to ensure imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("=== Database Migration for Account Columns ===")

try:
    # Try different possible database paths
    possible_paths = [
        'bettracker.db',
        'instance/bettracker.db',
        r'c:\Users\HP\OneDrive\Desktop\Tracker\backend\instance\bettracker.db'
    ]
    
    db_path = None
    for path in possible_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        print("❌ Database file not found in any of these locations:")
        for path in possible_paths:
            print(f"  - {path}")
        print("Please run the backend server first to create the database.")
        sys.exit(1)
    
    print(f"✅ Found database at: {db_path}")
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("📊 Checking current table schemas...")
    
    # Check bet table schema
    cursor.execute("PRAGMA table_info(bet)")
    bet_columns = [column[1] for column in cursor.fetchall()]
    print(f"Bet table columns: {bet_columns}")
    
    # Check transaction table schema
    cursor.execute("PRAGMA table_info(transaction)")
    transaction_columns = [column[1] for column in cursor.fetchall()]
    print(f"Transaction table columns: {transaction_columns}")
    
    # Add account column to bet table if it doesn't exist
    if 'account' not in bet_columns:
        print("➕ Adding account column to bet table...")
        cursor.execute("ALTER TABLE bet ADD COLUMN account VARCHAR(100)")
        print("✅ Account column added to bet table")
    else:
        print("✅ Account column already exists in bet table")
    
    # Add account column to transaction table if it doesn't exist
    if 'account' not in transaction_columns:
        print("➕ Adding account column to transaction table...")
        cursor.execute("ALTER TABLE transaction ADD COLUMN account VARCHAR(100)")
        print("✅ Account column added to transaction table")
    else:
        print("✅ Account column already exists in transaction table")
    
    # Commit changes
    conn.commit()
    
    # Verify the changes
    print("\n📊 Verifying changes...")
    cursor.execute("PRAGMA table_info(bet)")
    new_bet_columns = [column[1] for column in cursor.fetchall()]
    print(f"Updated bet table columns: {new_bet_columns}")
    
    cursor.execute("PRAGMA table_info(transaction)")
    new_transaction_columns = [column[1] for column in cursor.fetchall()]
    print(f"Updated transaction table columns: {new_transaction_columns}")
    
    conn.close()
    print("\n🎉 Migration completed successfully!")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    if 'conn' in locals():
        conn.rollback()
        conn.close()
    sys.exit(1)
