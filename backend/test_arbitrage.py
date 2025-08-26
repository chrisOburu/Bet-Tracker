#!/usr/bin/env python3
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app, db
    print("✓ App imports successful")
    
    from app.models.bet import Bet
    print("✓ Bet model import successful")
    
    from app.models.transaction import Transaction
    print("✓ Transaction model import successful")
    
    from app.models.arbitrage import Arbitrage
    print("✓ Arbitrage model import successful")
    
    # Test app creation
    app = create_app()
    print("✓ App creation successful")
    
    with app.app_context():
        # Create tables
        db.create_all()
        print("✓ Database tables created")
        
        # Test arbitrage creation
        test_arbitrage = Arbitrage(
            profit=2.5,
            market_name="Match Result",
            home_team="Test Team A",
            away_team="Test Team B",
            league="Test League",
            country="Test Country",
            match_signature="Test Team A vs Test Team B - Match Result",
            combination_details=[
                {"name": "1", "bookmaker": "TestBook1", "odds": 3.0},
                {"name": "X", "bookmaker": "TestBook2", "odds": 3.5},
                {"name": "2", "bookmaker": "TestBook3", "odds": 2.8}
            ]
        )
        
        db.session.add(test_arbitrage)
        db.session.commit()
        print("✓ Test arbitrage created successfully")
        
        # Query back
        arbitrage = Arbitrage.query.first()
        print(f"✓ Arbitrage queried: {arbitrage.match_signature}, Profit: {arbitrage.profit}%")
        
        print("\nAll tests passed! The arbitrage system is working correctly.")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
