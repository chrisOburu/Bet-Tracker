#!/usr/bin/env python3
"""
Create simple test arbitrage data directly
"""
import sys
import os
from datetime import datetime, timedelta

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_simple_test_data():
    from app import create_app, db
    from app.models.arbitrage import Arbitrage
    
    app = create_app()
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing arbitrages...")
        Arbitrage.query.delete()
        db.session.commit()
        
        # Create simple test arbitrages
        test_arbitrages = [
            {
                'profit': 2.5,
                'market_name': 'Match Result',
                'home_team': 'Manchester United',
                'away_team': 'Arsenal',
                'league': 'Premier League',
                'country': 'England',
                'kickoff_datetime': datetime.utcnow() + timedelta(days=1),
                'combination_details': [
                    {'name': '1', 'bookmaker': 'Bet365', 'odds': 2.5},
                    {'name': 'X', 'bookmaker': 'William Hill', 'odds': 3.2},
                    {'name': '2', 'bookmaker': 'Ladbrokes', 'odds': 2.8}
                ],
                'is_active': True
            },
            {
                'profit': 1.8,
                'market_name': 'Total Goals',
                'home_team': 'Barcelona',
                'away_team': 'Real Madrid',
                'league': 'La Liga',
                'country': 'Spain',
                'kickoff_datetime': datetime.utcnow() + timedelta(days=2),
                'combination_details': [
                    {'name': 'Over 2.5', 'bookmaker': 'Betfair', 'odds': 1.9},
                    {'name': 'Under 2.5', 'bookmaker': 'Coral', 'odds': 2.1}
                ],
                'is_active': True
            },
            {
                'profit': 3.2,
                'market_name': 'Both Teams to Score',
                'home_team': 'Liverpool',
                'away_team': 'Chelsea',
                'league': 'Premier League',
                'country': 'England',
                'kickoff_datetime': datetime.utcnow() + timedelta(days=3),
                'combination_details': [
                    {'name': 'Yes', 'bookmaker': 'SkyBet', 'odds': 1.8},
                    {'name': 'No', 'bookmaker': '888Sport', 'odds': 2.0}
                ],
                'is_active': True
            }
        ]
        
        arbitrages = []
        for data in test_arbitrages:
            # Create match signature
            match_signature = f"{data['home_team']} vs {data['away_team']} - {data['market_name']}"
            
            arbitrage = Arbitrage(
                profit=data['profit'],
                market_name=data['market_name'],
                home_team=data['home_team'],
                away_team=data['away_team'],
                league=data['league'],
                country=data['country'],
                match_signature=match_signature,
                kickoff_datetime=data['kickoff_datetime'],
                combination_details=data['combination_details'],
                is_active=data['is_active']
            )
            arbitrages.append(arbitrage)
        
        # Add to database
        print(f"Creating {len(arbitrages)} test arbitrage opportunities...")
        db.session.add_all(arbitrages)
        db.session.commit()
        
        print("Test data created successfully!")
        
        # Check what we created
        total_arbitrages = Arbitrage.query.count()
        active_arbitrages = Arbitrage.query.filter_by(is_active=True).count()
        
        print(f"Total arbitrages: {total_arbitrages}")
        print(f"Active arbitrages: {active_arbitrages}")

if __name__ == '__main__':
    create_simple_test_data()
