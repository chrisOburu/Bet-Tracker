#!/usr/bin/env python3
"""
Migration script to update database from old to new arbitrage model structure
"""
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db

def migrate_database():
    """Migrate database to new structure"""
    app = create_app()
    
    with app.app_context():
        print("Starting database migration...")
        
        # Drop all tables and recreate with new structure
        print("Dropping existing tables...")
        db.drop_all()
        
        print("Creating new tables with updated structure...")
        db.create_all()
        
        print("Database migration completed successfully!")
        print("Note: All existing data has been cleared. You will need to re-import your arbitrage data.")

if __name__ == '__main__':
    migrate_database()
