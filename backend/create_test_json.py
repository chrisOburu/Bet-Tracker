#!/usr/bin/env python3
"""
Create test data via API calls
"""
import json
from datetime import datetime, timedelta

# Define test data
test_arbitrages = [
    {
        "profit": 2.5,
        "market_name": "Match Result",
        "home_team": "Manchester United",
        "away_team": "Arsenal",
        "league": "Premier League",
        "country": "England",
        "match_signature": "Manchester United vs Arsenal - Match Result",
        "kickoff_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "combination_details": [
            {"name": "1", "bookmaker": "Bet365", "odds": 2.5},
            {"name": "X", "bookmaker": "William Hill", "odds": 3.2},
            {"name": "2", "bookmaker": "Ladbrokes", "odds": 2.8}
        ],
        "is_active": True
    },
    {
        "profit": 1.8,
        "market_name": "Total Goals",
        "home_team": "Barcelona",
        "away_team": "Real Madrid",
        "league": "La Liga",
        "country": "Spain",
        "match_signature": "Barcelona vs Real Madrid - Total Goals",
        "kickoff_datetime": (datetime.utcnow() + timedelta(days=2)).isoformat(),
        "combination_details": [
            {"name": "Over 2.5", "bookmaker": "Betfair", "odds": 1.9},
            {"name": "Under 2.5", "bookmaker": "Coral", "odds": 2.1}
        ],
        "is_active": True
    },
    {
        "profit": 3.2,
        "market_name": "Both Teams to Score",
        "home_team": "Liverpool",
        "away_team": "Chelsea",
        "league": "Premier League",
        "country": "England",
        "match_signature": "Liverpool vs Chelsea - Both Teams to Score",
        "kickoff_datetime": (datetime.utcnow() + timedelta(days=3)).isoformat(),
        "combination_details": [
            {"name": "Yes", "bookmaker": "SkyBet", "odds": 1.8},
            {"name": "No", "bookmaker": "888Sport", "odds": 2.0}
        ],
        "is_active": True
    }
]

# Convert to JSON
json_data = json.dumps(test_arbitrages, indent=2)

print("Test Arbitrage Data:")
print("=" * 50)
print(json_data)
print("\n" + "=" * 50)
print("You can use this data with curl:")
print('curl -X POST http://127.0.0.1:5001/api/arbitrages/import \\')
print('  -H "Content-Type: application/json" \\')
print(f'  -d \'{json_data}\'')
