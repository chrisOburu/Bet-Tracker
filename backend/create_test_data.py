#!/usr/bin/env python3
"""
Script to create some test arbitrage data
"""
import sys
import os
from datetime import datetime, timedelta
import json

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.arbitrage import Arbitrage

def create_test_data():
    """Create test arbitrage data"""
    app = create_app()
    
    with app.app_context():
        # Clear existing arbitrage data
        print("Clearing existing arbitrage data...")
        Arbitrage.query.delete()
        db.session.commit()
        
        # Sample arbitrage data
        test_arbitrages = [
            {
                'profit': 5.25,
                'market_name': 'Match Winner',
                'home_team': 'Manchester United',
                'away_team': 'Liverpool',
                'league': 'Premier League',
                'country': 'England',
                'match_signature': 'manchester-united-vs-liverpool-2024-03-15',
                'kickoff_datetime': datetime.now() + timedelta(days=1),
                'combination_details': json.dumps([
                    {'name': 'home', 'odds': 2.1, 'bookmaker': 'Bet365'},
                    {'name': 'away', 'odds': 3.5, 'bookmaker': 'William Hill'},
                    {'name': 'draw', 'odds': 3.2, 'bookmaker': 'Betfair'}
                ])
            },
            {
                'profit': 3.15,
                'market_name': 'Over/Under 2.5',
                'home_team': 'Manchester United',
                'away_team': 'Liverpool',
                'league': 'Premier League',
                'country': 'England',
                'match_signature': 'manchester-united-vs-liverpool-2024-03-15',
                'kickoff_datetime': datetime.now() + timedelta(days=1),
                'combination_details': json.dumps([
                    {'name': 'over', 'odds': 1.9, 'bookmaker': 'Pinnacle'},
                    {'name': 'under', 'odds': 2.2, 'bookmaker': 'Unibet'}
                ])
            },
            {
                'profit': 4.85,
                'market_name': 'Both Teams to Score',
                'home_team': 'Manchester United',
                'away_team': 'Liverpool',
                'league': 'Premier League',
                'country': 'England',
                'match_signature': 'manchester-united-vs-liverpool-2024-03-15',
                'kickoff_datetime': datetime.now() + timedelta(days=1),
                'combination_details': json.dumps([
                    {'name': 'yes', 'odds': 1.75, 'bookmaker': 'Bet365'},
                    {'name': 'no', 'odds': 2.1, 'bookmaker': 'Ladbrokes'}
                ])
            },
            {
                'profit': 6.75,
                'market_name': 'Match Winner',
                'home_team': 'Arsenal',
                'away_team': 'Chelsea',
                'league': 'Premier League',
                'country': 'England',
                'match_signature': 'arsenal-vs-chelsea-2024-03-16',
                'kickoff_datetime': datetime.now() + timedelta(days=2),
                'combination_details': json.dumps([
                    {'name': 'home', 'odds': 2.3, 'bookmaker': 'Betfair'},
                    {'name': 'away', 'odds': 3.1, 'bookmaker': 'William Hill'},
                    {'name': 'draw', 'odds': 3.4, 'bookmaker': 'Bet365'}
                ])
            },
            {
                'profit': 2.95,
                'market_name': 'Over/Under 2.5',
                'home_team': 'Arsenal',
                'away_team': 'Chelsea',
                'league': 'Premier League',
                'country': 'England',
                'match_signature': 'arsenal-vs-chelsea-2024-03-16',
                'kickoff_datetime': datetime.now() + timedelta(days=2),
                'combination_details': json.dumps([
                    {'name': 'over', 'odds': 1.85, 'bookmaker': 'Pinnacle'},
                    {'name': 'under', 'odds': 2.15, 'bookmaker': 'Betfair'}
                ])
            },
            {
                'profit': 7.25,
                'market_name': 'Match Winner',
                'home_team': 'Barcelona',
                'away_team': 'Real Madrid',
                'league': 'La Liga',
                'country': 'Spain',
                'match_signature': 'barcelona-vs-real-madrid-2024-03-17',
                'kickoff_datetime': datetime.now() + timedelta(days=3),
                'combination_details': json.dumps([
                    {'name': 'home', 'odds': 2.05, 'bookmaker': 'Bet365'},
                    {'name': 'away', 'odds': 3.8, 'bookmaker': 'William Hill'},
                    {'name': 'draw', 'odds': 3.6, 'bookmaker': 'Unibet'}
                ])
            },
            {
                'profit': 1.85,
                'market_name': 'Asian Handicap',
                'home_team': 'Barcelona',
                'away_team': 'Real Madrid',
                'league': 'La Liga',
                'country': 'Spain',
                'match_signature': 'barcelona-vs-real-madrid-2024-03-17',
                'kickoff_datetime': datetime.now() + timedelta(days=3),
                'combination_details': json.dumps([
                    {'name': 'home +0.5', 'odds': 1.95, 'bookmaker': 'Pinnacle'},
                    {'name': 'away -0.5', 'odds': 1.98, 'bookmaker': 'Betfair'}
                ])
            },
        ]
        
        print(f"Creating {len(test_arbitrages)} test arbitrage opportunities...")
        
        # Import data
        imported_count = 0
        
        for item in test_arbitrages:
            try:
                arbitrage = Arbitrage(
                    profit=item['profit'],
                    market_name=item['market_name'],
                    home_team=item['home_team'],
                    away_team=item['away_team'],
                    league=item['league'],
                    country=item['country'],
                    match_signature=item['match_signature'],
                    kickoff_datetime=item['kickoff_datetime'],
                    combination_details=item['combination_details'],
                    is_active=True
                )
                
                db.session.add(arbitrage)
                imported_count += 1
                
            except Exception as e:
                print(f"Failed to create arbitrage: {e}")
                continue
        
        # Commit all changes
        db.session.commit()
        
        print(f"""
Test Data Creation Summary:
Successfully created: {imported_count}
Total processed: {len(test_arbitrages)}
""")
        
        # Verify creation
        total_in_db = Arbitrage.query.count()
        print(f"Total arbitrage opportunities in database: {total_in_db}")
        
        # Print grouped summary
        signatures = db.session.query(Arbitrage.match_signature).distinct().all()
        print(f"Unique match signatures: {len(signatures)}")
        for sig in signatures:
            count = Arbitrage.query.filter_by(match_signature=sig[0]).count()
            print(f"  - {sig[0]}: {count} opportunities")

if __name__ == '__main__':
    create_test_data()
