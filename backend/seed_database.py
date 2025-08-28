#!/usr/bin/env python3
"""
Database seeding script for Bet Tracker application
Creates sample data for development and testing
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.sportsbook import Sportsbook
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.bet import Bet

def seed_sportsbooks():
    """Create sample sportsbooks"""
    sportsbooks_data = [
        {"name": "DraftKings", "website": "https://draftkings.com", "is_active": True},
        {"name": "FanDuel", "website": "https://fanduel.com", "is_active": True},
        {"name": "BetMGM", "website": "https://betmgm.com", "is_active": True},
        {"name": "Caesars", "website": "https://caesars.com", "is_active": True},
        {"name": "PointsBet", "website": "https://pointsbet.com", "is_active": True},
        {"name": "BetRivers", "website": "https://betrivers.com", "is_active": True},
        {"name": "WynnBET", "website": "https://wynnbet.com", "is_active": True},
        {"name": "Unibet", "website": "https://unibet.com", "is_active": True},
        {"name": "FOX Bet", "website": "https://foxbet.com", "is_active": False},
        {"name": "Barstool", "website": "https://barstool.com", "is_active": True}
    ]
    
    created_sportsbooks = []
    print("🏈 Creating sportsbooks...")
    
    for data in sportsbooks_data:
        existing = Sportsbook.query.filter_by(name=data["name"]).first()
        if not existing:
            sportsbook = Sportsbook(
                name=data["name"],
                website=data.get("website"),
                is_active=data.get("is_active", True)
            )
            db.session.add(sportsbook)
            created_sportsbooks.append(sportsbook)
            print(f"  ✓ Created: {data['name']}")
        else:
            created_sportsbooks.append(existing)
            print(f"  → Exists: {data['name']}")
    
    db.session.commit()
    return created_sportsbooks

def seed_accounts():
    """Create sample accounts"""
    accounts_data = [
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
    print("👤 Creating accounts...")
    
    for data in accounts_data:
        existing = Account.query.filter_by(account_identifier=data["identifier"]).first()
        if not existing:
            account = Account(
                account_identifier=data["identifier"],
                account_type=Account.detect_account_type(data["identifier"]),
                name=data["name"],
                is_active=True,
                notes=f"Sample account created for {data['name']}"
            )
            db.session.add(account)
            created_accounts.append(account)
            print(f"  ✓ Created: {data['name']} ({data['identifier']})")
        else:
            created_accounts.append(existing)
            print(f"  → Exists: {data['name']}")
    
    db.session.commit()
    return created_accounts

def seed_transactions(sportsbooks, accounts):
    """Create sample transactions"""
    transaction_types = ['deposit', 'withdrawal']
    payment_methods = ['bank_transfer', 'credit_card', 'crypto', 'paypal', 'venmo']
    statuses = ['completed', 'pending', 'failed']
    
    print("💰 Creating transactions...")
    
    # Create 50 sample transactions
    for i in range(50):
        sportsbook = random.choice(sportsbooks)
        account = random.choice(accounts)
        transaction_type = random.choice(transaction_types)
        
        # Generate realistic amounts
        if transaction_type == 'deposit':
            base_amount = random.choice([50, 100, 250, 500, 1000, 2500])
        else:  # withdrawal
            base_amount = random.choice([25, 75, 150, 300, 750, 1500])
        
        amount = base_amount + random.uniform(-10, 50)
        tax = amount * 0.05 if transaction_type == 'withdrawal' else 0
        charges = random.choice([0, 2.50, 5.00, 115.00]) if transaction_type == 'withdrawal' else 0
        
        # Random date within last 90 days
        days_ago = random.randint(1, 90)
        date_created = datetime.now() - timedelta(days=days_ago)
        
        status = random.choices(statuses, weights=[85, 10, 5])[0]  # 85% completed, 10% pending, 5% failed
        
        transaction = Transaction(
            transaction_type=transaction_type,
            sportsbook_id=sportsbook.id,
            account_id=account.id,
            amount=round(amount, 2),
            tax=round(tax, 2),
            transaction_charges=charges,
            payment_method=random.choice(payment_methods),
            reference_id=f"TXN-{random.randint(100000, 999999)}",
            status=status,
            date_created=date_created,
            date_processed=date_created + timedelta(minutes=random.randint(1, 60)) if status == 'completed' else None,
            notes=f"Sample {transaction_type} transaction"
        )
        
        db.session.add(transaction)
        
        if (i + 1) % 10 == 0:
            print(f"  ✓ Created {i + 1}/50 transactions...")
    
    db.session.commit()
    print("  ✓ Completed all transactions")

def seed_bets(sportsbooks, accounts):
    """Create sample bets"""
    sports = ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis', 'UFC', 'College Football', 'College Basketball']
    bet_types = ['Moneyline', 'Spread', 'Over/Under', 'Prop Bet', 'Parlay', 'Futures']
    statuses = ['won', 'lost', 'pending', 'void']
    
    # Sample events
    events = [
        "Chiefs vs Bills", "Lakers vs Warriors", "Yankees vs Red Sox", "Rangers vs Bruins",
        "Manchester United vs Chelsea", "Federer vs Nadal", "Jon Jones vs Stipe Miocic",
        "Alabama vs Georgia", "Duke vs North Carolina", "Cowboys vs Giants", "Nets vs Heat",
        "Dodgers vs Padres", "Lightning vs Panthers", "Barcelona vs Real Madrid",
        "Djokovic vs Alcaraz", "UFC 300 Main Event", "Michigan vs Ohio State", "Gonzaga vs Kentucky"
    ]
    
    print("🎯 Creating bets...")
    
    # Create 100 sample bets
    for i in range(100):
        sportsbook = random.choice(sportsbooks)
        account = random.choice(accounts)
        sport = random.choice(sports)
        event = random.choice(events)
        bet_type = random.choice(bet_types)
        
        # Generate realistic odds (American style converted to decimal)
        american_odds = random.choice([-200, -150, -110, +100, +150, +200, +300, +500])
        if american_odds < 0:
            decimal_odds = round((100 / abs(american_odds)) + 1, 2)
        else:
            decimal_odds = round((american_odds / 100) + 1, 2)
        
        stake = random.choice([25, 50, 100, 250, 500, 1000])
        potential_payout = round(stake * decimal_odds, 2)
        
        # Random date within last 30 days
        days_ago = random.randint(1, 30)
        date_placed = datetime.now() - timedelta(days=days_ago)
        
        # Determine status based on age (older bets more likely to be settled)
        if days_ago > 7:
            status = random.choices(statuses, weights=[45, 45, 5, 5])[0]  # Older bets mostly settled
        else:
            status = random.choices(statuses, weights=[20, 20, 55, 5])[0]  # Newer bets mostly pending
        
        # Calculate payouts for settled bets
        if status == 'won':
            actual_payout = potential_payout
            profit_loss = actual_payout - stake
            date_settled = date_placed + timedelta(hours=random.randint(2, 48))
        elif status == 'lost':
            actual_payout = 0
            profit_loss = -stake
            date_settled = date_placed + timedelta(hours=random.randint(2, 48))
        elif status == 'void':
            actual_payout = stake  # Stake returned
            profit_loss = 0
            date_settled = date_placed + timedelta(hours=random.randint(1, 24))
        else:  # pending
            actual_payout = 0
            profit_loss = 0
            date_settled = None
        
        # Generate selection based on bet type
        if bet_type == 'Moneyline':
            selection = random.choice([event.split(' vs ')[0], event.split(' vs ')[1]])
        elif bet_type == 'Spread':
            spread = random.choice([-7.5, -3.5, -1.5, +1.5, +3.5, +7.5])
            team = random.choice([event.split(' vs ')[0], event.split(' vs ')[1]])
            selection = f"{team} {spread:+.1f}"
        elif bet_type == 'Over/Under':
            total = random.choice([42.5, 47.5, 52.5, 210.5, 225.5, 2.5, 6.5])
            selection = f"{'Over' if random.choice([True, False]) else 'Under'} {total}"
        else:
            selection = f"{bet_type} selection"
        
        bet = Bet(
            sport=sport,
            event_name=event,
            bet_type=bet_type,
            selection=selection,
            sportsbook_id=sportsbook.id,
            account_id=account.id,
            odds=decimal_odds,
            stake=stake,
            status=status,
            potential_payout=potential_payout,
            actual_payout=actual_payout,
            profit_loss=profit_loss,
            date_placed=date_placed,
            date_settled=date_settled,
            kickoff=date_placed + timedelta(hours=random.randint(1, 72)),
            notes=f"Sample {bet_type} bet on {sport}"
        )
        
        db.session.add(bet)
        
        if (i + 1) % 20 == 0:
            print(f"  ✓ Created {i + 1}/100 bets...")
    
    db.session.commit()
    print("  ✓ Completed all bets")

def clear_existing_data():
    """Clear existing sample data"""
    print("🧹 Clearing existing data...")
    
    # Delete in order of dependencies
    Bet.query.delete()
    Transaction.query.delete()
    Account.query.delete()
    Sportsbook.query.delete()
    
    db.session.commit()
    print("  ✓ Cleared all existing data")

def main():
    """Main seeding function"""
    app = create_app()
    
    with app.app_context():
        print("🌱 Starting database seeding...")
        print("=" * 50)
        
        # Ask user if they want to clear existing data
        choice = input("Clear existing data first? (y/N): ").lower().strip()
        if choice == 'y':
            clear_existing_data()
            print()
        
        # Create tables if they don't exist
        db.create_all()
        
        # Seed data
        sportsbooks = seed_sportsbooks()
        print()
        
        accounts = seed_accounts()
        print()
        
        seed_transactions(sportsbooks, accounts)
        print()
        
        seed_bets(sportsbooks, accounts)
        print()
        
        print("=" * 50)
        print("🎉 Database seeding completed successfully!")
        print(f"Created:")
        print(f"  • {len(sportsbooks)} sportsbooks")
        print(f"  • {len(accounts)} accounts")
        print(f"  • 50 transactions")
        print(f"  • 100 bets")

if __name__ == "__main__":
    main()
