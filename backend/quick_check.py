#!/usr/bin/env python3
"""
Quick database check and creation
"""
import sys
import os
from datetime import datetime, timedelta

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def quick_check_and_create():
    from app import create_app, db
    from app.models.arbitrage import Arbitrage
    
    app = create_app()
    
    with app.app_context():
        # Check existing data
        existing_count = Arbitrage.query.count()
        print(f"Current arbitrages in database: {existing_count}")
        
        if existing_count == 0:
            print("No data found. Creating test data...")
            
            # Create simple test arbitrages
            test_arbitrages = [
                Arbitrage(
                    profit=2.5,
                    market_name='Match Result',
                    home_team='Manchester United',
                    away_team='Arsenal',
                    league='Premier League',
                    country='England',
                    match_signature='Manchester United vs Arsenal - Match Result',
                    kickoff_datetime=datetime.now() + timedelta(days=1),
                    combination_details='[{"name": "1", "bookmaker": "Bet365", "odds": 2.5}, {"name": "X", "bookmaker": "William Hill", "odds": 3.2}, {"name": "2", "bookmaker": "Ladbrokes", "odds": 2.8}]',
                    is_active=True
                ),
                Arbitrage(
                    profit=1.8,
                    market_name='Total Goals',
                    home_team='Barcelona',
                    away_team='Real Madrid',
                    league='La Liga',
                    country='Spain',
                    match_signature='Barcelona vs Real Madrid - Total Goals',
                    kickoff_datetime=datetime.now() + timedelta(days=2),
                    combination_details='[{"name": "Over 2.5", "bookmaker": "Betfair", "odds": 1.9}, {"name": "Under 2.5", "bookmaker": "Coral", "odds": 2.1}]',
                    is_active=True
                ),
                Arbitrage(
                    profit=3.2,
                    market_name='Both Teams to Score',
                    home_team='Liverpool',
                    away_team='Chelsea',
                    league='Premier League',
                    country='England',
                    match_signature='Liverpool vs Chelsea - Both Teams to Score',
                    kickoff_datetime=datetime.now() + timedelta(days=3),
                    combination_details='[{"name": "Yes", "bookmaker": "SkyBet", "odds": 1.8}, {"name": "No", "bookmaker": "888Sport", "odds": 2.0}]',
                    is_active=True
                )
            ]
            
            # Add to database
            db.session.add_all(test_arbitrages)
            db.session.commit()
            
            print(f"Added {len(test_arbitrages)} test arbitrages!")
        
        # Display current data
        arbitrages = Arbitrage.query.all()
        print(f"\nTotal arbitrages: {len(arbitrages)}")
        
        if arbitrages:
            print("\nFirst arbitrage:")
            first = arbitrages[0]
            print(f"  Profit: {first.profit}%")
            print(f"  Match: {first.home_team} vs {first.away_team}")
            print(f"  Market: {first.market_name}")
            print(f"  Signature: {first.match_signature}")
            print(f"  Combination details: {first.combination_details}")
            
            # Test the to_dict method
            print(f"\nAs dict: {first.to_dict()}")

if __name__ == '__main__':
    quick_check_and_create()
