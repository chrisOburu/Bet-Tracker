#!/usr/bin/env python3
"""
Script to import arbitrage opportunities from JSON file into the database
"""
import sys
import os
import json
import requests

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.arbitrage import Arbitrage

def import_arbitrage_data():
    """Import arbitrage data from JSON file"""
    app = create_app()
    
    with app.app_context():
        # Clear existing arbitrage data
        print("Clearing existing arbitrage data...")
        Arbitrage.query.delete()
        db.session.commit()
        
        # Load JSON data
        json_file_path = os.path.join(os.path.dirname(__file__), 'data', 'arbitrage_opportunities.json')
        
        if not os.path.exists(json_file_path):
            print(f"Error: {json_file_path} not found!")
            return
        
        print(f"Loading data from {json_file_path}...")
        with open(json_file_path, 'r', encoding='utf-8') as f:
            arbitrage_data = json.load(f)
        
        print(f"Found {len(arbitrage_data)} arbitrage opportunities")
        
        # Import data
        imported_count = 0
        failed_count = 0
        
        for item in arbitrage_data:
            try:
                # Ensure combination_details is properly formatted
                combination_details = item.get('combination_details', [])
                if isinstance(combination_details, list):
                    combination_details = json.dumps(combination_details)
                elif not isinstance(combination_details, str):
                    combination_details = json.dumps([])
                
                arbitrage = Arbitrage(
                    profit=item['profit'],
                    match_signature=item['match_signature'],
                    kickoff_datetime=item['kickoff_datetime'],
                    combination_details=combination_details
                )
                
                db.session.add(arbitrage)
                imported_count += 1
                
            except Exception as e:
                print(f"Failed to import item: {e}")
                failed_count += 1
                continue
        
        # Commit all changes
        db.session.commit()
        
        print(f"""
Import Summary:
Successfully imported: {imported_count}
Failed: {failed_count}
Total processed: {len(arbitrage_data)}
""")
        
        # Verify import
        total_in_db = Arbitrage.query.count()
        print(f"Total arbitrage opportunities in database: {total_in_db}")

if __name__ == '__main__':
    import_arbitrage_data()