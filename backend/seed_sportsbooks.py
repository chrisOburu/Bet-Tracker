#!/usr/bin/env python3
"""
Seed script to populate the sportsbooks table with common sportsbooks.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.sportsbook import Sportsbook

def seed_sportsbooks():
    """Seed the database with common sportsbooks"""
    
    # Common sportsbooks data
    sportsbooks_data = [
        {
            'name': 'Bet365',
            'display_name': 'bet365',
            'website_url': 'https://www.bet365.com',
            'country': 'UK',
            'description': 'One of the world\'s leading online gambling companies'
        },
        {
            'name': 'William Hill',
            'display_name': 'William Hill',
            'website_url': 'https://www.williamhill.com',
            'country': 'UK',
            'description': 'British gambling company'
        },
        {
            'name': 'DraftKings',
            'display_name': 'DraftKings Sportsbook',
            'website_url': 'https://www.draftkings.com',
            'country': 'USA',
            'description': 'American daily fantasy sports and sports betting company'
        },
        {
            'name': 'FanDuel',
            'display_name': 'FanDuel Sportsbook',
            'website_url': 'https://www.fanduel.com',
            'country': 'USA',
            'description': 'American fantasy sports and sports betting company'
        },
        {
            'name': 'BetMGM',
            'display_name': 'BetMGM',
            'website_url': 'https://www.betmgm.com',
            'country': 'USA',
            'description': 'American online sports betting and casino company'
        },
        {
            'name': 'Caesars',
            'display_name': 'Caesars Sportsbook',
            'website_url': 'https://www.caesars.com/sportsbook',
            'country': 'USA',
            'description': 'Caesars Entertainment online sportsbook'
        },
        {
            'name': 'PointsBet',
            'display_name': 'PointsBet',
            'website_url': 'https://www.pointsbet.com',
            'country': 'Australia',
            'description': 'Australian corporate bookmaker'
        },
        {
            'name': 'Betway',
            'display_name': 'Betway',
            'website_url': 'https://www.betway.com',
            'country': 'Malta',
            'description': 'Online gambling company'
        },
        {
            'name': 'Unibet',
            'display_name': 'Unibet',
            'website_url': 'https://www.unibet.com',
            'country': 'Malta',
            'description': 'International online gambling operator'
        },
        {
            'name': 'Ladbrokes',
            'display_name': 'Ladbrokes',
            'website_url': 'https://www.ladbrokes.com',
            'country': 'UK',
            'description': 'British betting and gambling company'
        },
        {
            'name': 'Coral',
            'display_name': 'Coral',
            'website_url': 'https://www.coral.co.uk',
            'country': 'UK',
            'description': 'British bookmaker'
        },
        {
            'name': 'Paddy Power',
            'display_name': 'Paddy Power',
            'website_url': 'https://www.paddypower.com',
            'country': 'Ireland',
            'description': 'Irish bookmaker'
        },
        {
            'name': 'Betfair',
            'display_name': 'Betfair',
            'website_url': 'https://www.betfair.com',
            'country': 'UK',
            'description': 'British betting exchange'
        },
        {
            'name': '888sport',
            'display_name': '888sport',
            'website_url': 'https://www.888sport.com',
            'country': 'Gibraltar',
            'description': 'Online sports betting site'
        },
        {
            'name': 'Bwin',
            'display_name': 'bwin',
            'website_url': 'https://www.bwin.com',
            'country': 'Austria',
            'description': 'Austrian online gambling company'
        },
        {
            'name': 'SportsBet',
            'display_name': 'SportsBet',
            'website_url': 'https://www.sportsbet.com.au',
            'country': 'Australia',
            'description': 'Australian online bookmaker'
        },
        {
            'name': 'TAB',
            'display_name': 'TAB',
            'website_url': 'https://www.tab.com.au',
            'country': 'Australia',
            'description': 'Australian totalisator agency'
        },
        {
            'name': '1xBet',
            'display_name': '1xBet',
            'website_url': 'https://www.1xbet.com',
            'country': 'Russia',
            'description': 'Russian online gambling company'
        },
        {
            'name': 'Pinnacle',
            'display_name': 'Pinnacle',
            'website_url': 'https://www.pinnacle.com',
            'country': 'Curacao',
            'description': 'Online sportsbook known for high limits and low margins'
        },
        {
            'name': 'Bovada',
            'display_name': 'Bovada',
            'website_url': 'https://www.bovada.lv',
            'country': 'Costa Rica',
            'description': 'Online gambling site serving US customers'
        }
    ]
    
    app = create_app()
    
    with app.app_context():
        print("Starting sportsbooks seeding...")
        
        created_count = 0
        skipped_count = 0
        
        for sportsbook_data in sportsbooks_data:
            # Check if sportsbook already exists
            existing = Sportsbook.get_by_name(sportsbook_data['name'])
            
            if existing:
                print(f"Skipping {sportsbook_data['name']} - already exists")
                skipped_count += 1
                continue
            
            # Create new sportsbook
            sportsbook = Sportsbook(**sportsbook_data)
            db.session.add(sportsbook)
            created_count += 1
            print(f"Added {sportsbook_data['name']}")
        
        try:
            db.session.commit()
            print(f"\nSeeding completed successfully!")
            print(f"Created: {created_count} sportsbooks")
            print(f"Skipped: {skipped_count} existing sportsbooks")
            
            # Display current count
            total_count = Sportsbook.query.count()
            active_count = Sportsbook.query.filter_by(is_active=True).count()
            print(f"Total sportsbooks in database: {total_count}")
            print(f"Active sportsbooks: {active_count}")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error during seeding: {str(e)}")
            return False
    
    return True

if __name__ == "__main__":
    if seed_sportsbooks():
        print("Sportsbooks seeding completed successfully!")
        sys.exit(0)
    else:
        print("Sportsbooks seeding failed!")
        sys.exit(1)
