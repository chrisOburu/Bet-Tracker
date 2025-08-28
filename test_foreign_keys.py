#!/usr/bin/env python3
"""
Simple test to check if the API is working after migration.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from app import create_app, db
from app.models.bet import Bet
from app.models.transaction import Transaction
from app.models.sportsbook import Sportsbook
from app.models.account import Account
from sqlalchemy import text

def test_foreign_keys():
    """Test if foreign key columns are working"""
    
    app = create_app()
    
    with app.app_context():
        print("Testing foreign key implementation...")
        
        try:
            # Check bet table schema
            result = db.session.execute(text("PRAGMA table_info(bet)"))
            bet_columns = [row[1] for row in result.fetchall()]
            print(f"Bet table columns: {bet_columns}")
            
            # Check if foreign key columns exist
            has_sportsbook_id = 'sportsbook_id' in bet_columns
            has_account_id = 'account_id' in bet_columns
            
            print(f"Bet table has sportsbook_id: {has_sportsbook_id}")
            print(f"Bet table has account_id: {has_account_id}")
            
            # Try to query bets
            if has_sportsbook_id and has_account_id:
                bets = Bet.query.limit(5).all()
                print(f"Successfully queried {len(bets)} bets")
                
                for bet in bets[:2]:
                    print(f"  Bet {bet.id}: sportsbook_id={bet.sportsbook_id}, account_id={bet.account_id}")
            
            # Check transaction table schema
            result = db.session.execute(text("PRAGMA table_info(`transaction`)"))
            transaction_columns = [row[1] for row in result.fetchall()]
            print(f"Transaction table columns: {transaction_columns}")
            
            # Check sportsbook table
            sportsbooks = Sportsbook.query.all()
            print(f"Sportsbooks in database: {len(sportsbooks)}")
            for sb in sportsbooks[:3]:
                print(f"  {sb.id}: {sb.name}")
            
            # Check account table
            accounts = Account.query.all()
            print(f"Accounts in database: {len(accounts)}")
            for acc in accounts[:3]:
                print(f"  {acc.id}: {acc.account_identifier}")
            
            print("\n✅ Foreign key implementation test completed!")
            return True
            
        except Exception as e:
            print(f"❌ Error during test: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    test_foreign_keys()
