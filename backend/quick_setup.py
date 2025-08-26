#!/usr/bin/env python3
import sys
import os
from datetime import datetime, timedelta

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.arbitrage import Arbitrage

def quick_db_setup():
    app = create_app()
    
    with app.app_context():
        # Check current count
        current_count = Arbitrage.query.count()
        print(f"Current arbitrages in database: {current_count}")
        
        if current_count == 0:
            print("Database is empty, creating test data...")
            
            # Simple test data
            test_arb = Arbitrage(
                profit=5.25,
                market_name='Match Winner',
                home_team='Manchester United',
                away_team='Liverpool',
                league='Premier League',
                country='England',
                match_signature='manchester-united-vs-liverpool-2024-03-15',
                kickoff_datetime=datetime.now() + timedelta(days=1),
                combination_details='[{"name": "home", "odds": 2.1, "bookmaker": "Bet365", "home_team": "Manchester United", "away_team": "Liverpool", "league": "Premier League", "country": "England", "market": "Match Winner"}, {"name": "away", "odds": 3.5, "bookmaker": "William Hill", "home_team": "Manchester United", "away_team": "Liverpool", "league": "Premier League", "country": "England", "market": "Match Winner"}]',
                is_active=True
            )
            
            db.session.add(test_arb)
            db.session.commit()
            
            print("Test data created successfully!")
            print(f"New count: {Arbitrage.query.count()}")
        else:
            print("Database already has data")

if __name__ == '__main__':
    quick_db_setup()
