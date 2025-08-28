from app import create_app, db
from init_db import ensure_account_columns
from sqlalchemy import text
import os

app = create_app()

def ensure_clean_schema():
    """Ensure database schema is clean of legacy columns"""
    try:
        import sqlite3
        db_path = os.path.join(app.instance_path, 'bet_tracker.db')
        
        if not os.path.exists(db_path):
            return True
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if legacy columns exist
        cursor.execute("PRAGMA table_info(bet)")
        bet_columns = [col[1] for col in cursor.fetchall()]
        
        cursor.execute("PRAGMA table_info(transaction)")
        transaction_columns = [col[1] for col in cursor.fetchall()]
        
        legacy_in_bet = [col for col in ['sportsbook', 'account'] if col in bet_columns]
        legacy_in_transaction = [col for col in ['sportsbook', 'account'] if col in transaction_columns]
        
        if legacy_in_bet or legacy_in_transaction:
            print("🔧 Cleaning legacy columns from database...")
            
            if legacy_in_bet:
                print("  📝 Fixing bet table...")
                # Get existing data
                cursor.execute("SELECT id, sport, event_name, bet_type, selection, sportsbook_id, account_id, odds, stake, status, potential_payout, actual_payout, profit_loss, date_placed, date_settled, kickoff, notes FROM bet")
                bet_data = cursor.fetchall()
                
                # Recreate table
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
                print("  ✅ Bet table cleaned")
            
            if legacy_in_transaction:
                print("  📝 Fixing transaction table...")
                # Get existing data
                cursor.execute("SELECT id, transaction_type, sportsbook_id, account_id, amount, tax, transaction_charges, payment_method, reference_id, status, date_created, date_processed, notes FROM transaction")
                transaction_data = cursor.fetchall()
                
                # Recreate table
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
                print("  ✅ Transaction table cleaned")
            
            conn.commit()
            print("✅ Database schema cleaned successfully")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"⚠️ Schema cleaning error: {e}")
        return False

def ensure_foreign_key_columns():
    """Ensure foreign key columns exist in bet and transaction tables"""
    try:
        with app.app_context():
            with db.engine.connect() as conn:
                conn.execute(text("PRAGMA foreign_keys = ON"))
                
                # Check and add sportsbook_id and account_id columns if they don't exist
                inspector = db.inspect(db.engine)
                
                # Check bet table
                bet_columns = [col['name'] for col in inspector.get_columns('bet')]
                if 'sportsbook_id' not in bet_columns:
                    conn.execute(text("ALTER TABLE bet ADD COLUMN sportsbook_id INTEGER"))
                if 'account_id' not in bet_columns:
                    conn.execute(text("ALTER TABLE bet ADD COLUMN account_id INTEGER"))
                
                # Check transaction table
                transaction_columns = [col['name'] for col in inspector.get_columns('transaction')]
                if 'sportsbook_id' not in transaction_columns:
                    conn.execute(text("ALTER TABLE transaction ADD COLUMN sportsbook_id INTEGER"))
                if 'account_id' not in transaction_columns:
                    conn.execute(text("ALTER TABLE transaction ADD COLUMN account_id INTEGER"))
                
                conn.commit()
            
            print("✓ Foreign key columns ensured")
            return True
    except Exception as e:
        print(f"Error ensuring foreign key columns: {e}")
        return False
    """Ensure foreign key columns exist in bet and transaction tables"""
    with app.app_context():
        try:
            # Add sportsbook_id column to bet table
            try:
                db.session.execute(text('ALTER TABLE bet ADD COLUMN sportsbook_id INTEGER'))
                print("✓ Added sportsbook_id column to bet table")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    pass  # Column already exists
                else:
                    print(f"Note: {e}")
            
            # Add account_id column to bet table
            try:
                db.session.execute(text('ALTER TABLE bet ADD COLUMN account_id INTEGER'))
                print("✓ Added account_id column to bet table")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    pass  # Column already exists
                else:
                    print(f"Note: {e}")
            
            # Add sportsbook_id column to transaction table
            try:
                db.session.execute(text('ALTER TABLE `transaction` ADD COLUMN sportsbook_id INTEGER'))
                print("✓ Added sportsbook_id column to transaction table")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    pass  # Column already exists
                else:
                    print(f"Note: {e}")
            
            # Add account_id column to transaction table
            try:
                db.session.execute(text('ALTER TABLE `transaction` ADD COLUMN account_id INTEGER'))
                print("✓ Added account_id column to transaction table")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    pass  # Column already exists
                else:
                    print(f"Note: {e}")
            
            # Create all tables to ensure sportsbook and account tables exist
            db.create_all()
            
            db.session.commit()
            print("✓ Foreign key columns ensured")
            return True
            
        except Exception as e:
            print(f"Error ensuring foreign key columns: {e}")
            db.session.rollback()
            return False

def populate_sample_data():
    """Populate comprehensive sample data for development"""
    with app.app_context():
        try:
            # Clear and recreate sample data
            print("🌱 Seeding database with comprehensive sample data...")
            
            # Import Sportsbook model
            from app.models.sportsbook import Sportsbook

            # Create sportsbooks with more variety
            sportsbook_names = [
                "DraftKings", "FanDuel", "BetMGM", "Caesars", "PointsBet", 
                "BetRivers", "WynnBET", "Unibet", "Barstool", "FOX Bet"
            ]
            
            created_sportsbooks = []
            for name in sportsbook_names:
                existing = Sportsbook.get_by_name(name)
                if not existing:
                    sportsbook = Sportsbook.create_if_not_exists(name)
                    db.session.add(sportsbook)
                    db.session.flush()
                    created_sportsbooks.append(sportsbook)
                    print(f"✓ Created sportsbook: {name}")
                else:
                    created_sportsbooks.append(existing)
            
            # Create more diverse accounts
            from app.models.account import Account
            
            sample_accounts = [
                {"identifier": "john.doe@gmail.com", "name": "John Doe Main Account"},
                {"identifier": "jane.smith@yahoo.com", "name": "Jane Smith Primary"},
                {"identifier": "mike.trader@outlook.com", "name": "Mike Trading Account"},
                {"identifier": "sarah.wilson@hotmail.com", "name": "Sarah Wilson Sports"},
                {"identifier": "alex.johnson@gmail.com", "name": "Alex Johnson Betting"},
                {"identifier": "+1-555-0123", "name": "Mobile Account Alpha"},
                {"identifier": "+1-555-0456", "name": "Mobile Account Beta"},
                {"identifier": "+1-555-0789", "name": "Mobile Account Gamma"},
                {"identifier": "pro.bettor@protonmail.com", "name": "Professional Bettor"},
                {"identifier": "casual.fan@gmail.com", "name": "Casual Sports Fan"}
            ]
            
            created_accounts = []
            for acc_data in sample_accounts:
                existing = Account.query.filter_by(account_identifier=acc_data["identifier"]).first()
                if not existing:
                    account = Account(
                        account_identifier=acc_data["identifier"],
                        account_type=Account.detect_account_type(acc_data["identifier"]),
                        name=acc_data["name"],
                        is_active=True,
                        notes=f"Sample account for {acc_data['name']}"
                    )
                    db.session.add(account)
                    db.session.flush()
                    created_accounts.append(account)
                    print(f"✓ Created account: {acc_data['name']}")
                else:
                    created_accounts.append(existing)
            
            # Populate all existing records with foreign keys
            from app.models.transaction import Transaction
            from app.models.bet import Bet
            import random
            
            # Link all transactions without foreign keys
            all_transactions = Transaction.query.filter(
                (Transaction.sportsbook_id.is_(None)) | (Transaction.account_id.is_(None))
            ).all()
            
            if all_transactions and created_sportsbooks and created_accounts:
                print(f"✓ Linking {len(all_transactions)} transactions to sportsbooks and accounts...")
                for i, transaction in enumerate(all_transactions):
                    if transaction.sportsbook_id is None:
                        transaction.sportsbook_id = created_sportsbooks[i % len(created_sportsbooks)].id
                    if transaction.account_id is None:
                        transaction.account_id = created_accounts[i % len(created_accounts)].id
            
            # Link all bets without foreign keys
            all_bets = Bet.query.filter(
                (Bet.sportsbook_id.is_(None)) | (Bet.account_id.is_(None))
            ).all()
            
            if all_bets and created_sportsbooks and created_accounts:
                print(f"✓ Linking {len(all_bets)} bets to sportsbooks and accounts...")
                for i, bet in enumerate(all_bets):
                    if bet.sportsbook_id is None:
                        bet.sportsbook_id = created_sportsbooks[i % len(created_sportsbooks)].id
                    if bet.account_id is None:
                        bet.account_id = created_accounts[i % len(created_accounts)].id
            
            db.session.commit()
            
            # Print summary
            total_sportsbooks = len(Sportsbook.query.all())
            total_accounts = len(Account.query.all())
            total_transactions = len(Transaction.query.all())
            total_bets = len(Bet.query.all())
            
            print(f"🎉 Database seeded successfully!")
            print(f"   📊 {total_sportsbooks} sportsbooks")
            print(f"   👤 {total_accounts} accounts") 
            print(f"   💰 {total_transactions} transactions")
            print(f"   🎯 {total_bets} bets")
            
            return True
            
        except Exception as e:
            print(f"❌ Seeding error: {e}")
            db.session.rollback()
            return False

if __name__ == '__main__':
    # Run database migration/initialization before starting the server
    print("Checking database schema...")
    
    # Force clean schema
    # try:
    #     import sqlite3
    #     db_path = os.path.join(app.instance_path, 'bettracker.db')
    #     if os.path.exists(db_path):
    #         conn = sqlite3.connect(db_path)
    #         cursor = conn.cursor()
            
    #         # Check bet table for legacy columns
    #         cursor.execute("PRAGMA table_info(bet)")
    #         bet_columns = [col[1] for col in cursor.fetchall()]
            
    #         if 'sportsbook' in bet_columns:
    #             print("🔧 Removing legacy sportsbook column from bet table...")
                
    #             # Get existing data
    #             cursor.execute("SELECT id, sport, event_name, bet_type, selection, sportsbook_id, account_id, odds, stake, status, potential_payout, actual_payout, profit_loss, date_placed, date_settled, kickoff, notes FROM bet")
    #             bet_data = cursor.fetchall()
                
    #             # Drop and recreate table
    #             cursor.execute("DROP TABLE bet")
    #             cursor.execute("""
    #                 CREATE TABLE bet (
    #                     id INTEGER NOT NULL PRIMARY KEY,
    #                     sport VARCHAR(100) NOT NULL,
    #                     event_name VARCHAR(200) NOT NULL,
    #                     bet_type VARCHAR(100) NOT NULL,
    #                     selection VARCHAR(200) NOT NULL,
    #                     sportsbook_id INTEGER,
    #                     account_id INTEGER,
    #                     odds FLOAT NOT NULL,
    #                     stake FLOAT NOT NULL,
    #                     status VARCHAR(20) NOT NULL DEFAULT 'pending',
    #                     potential_payout FLOAT NOT NULL,
    #                     actual_payout FLOAT DEFAULT 0.0,
    #                     profit_loss FLOAT DEFAULT 0.0,
    #                     date_placed DATETIME NOT NULL,
    #                     date_settled DATETIME,
    #                     kickoff DATETIME,
    #                     notes TEXT,
    #                     FOREIGN KEY(sportsbook_id) REFERENCES sportsbook (id),
    #                     FOREIGN KEY(account_id) REFERENCES accounts (id)
    #                 )
    #             """)
                
    #             # Restore data
    #             for row in bet_data:
    #                 cursor.execute("INSERT INTO bet VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", row)
                
    #             conn.commit()
    #             print("✅ Legacy columns removed successfully!")
            
    #         conn.close()
    # except Exception as e:
    #     print(f"Schema cleaning error: {e}")
    
    # ensure_clean_schema()
    # ensure_account_columns()
    # ensure_foreign_key_columns()
    
    # # Import Sportsbook here to avoid circular imports
    # from app.models.sportsbook import Sportsbook
    # populate_sample_data()
    
    print("Starting server...")
    app.run(debug=True, host='0.0.0.0', port=5001)
