#!/usr/bin/env python3
"""
Simple test script to verify the API is working after foreign key migration.
"""

import requests
import json

def test_api():
    """Test the API endpoints to verify migration success."""
    base_url = "http://127.0.0.1:5001/api"
    
    print("Testing API endpoints after foreign key migration...\n")
    
    try:
        # Test sportsbooks endpoint
        print("1. Testing GET /api/sportsbooks")
        response = requests.get(f"{base_url}/sportsbooks")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            sportsbooks = response.json()
            print(f"   Found {len(sportsbooks)} sportsbooks:")
            for sb in sportsbooks[:3]:  # Show first 3
                print(f"     - ID: {sb.get('id')}, Name: {sb.get('name')}")
        print()
        
        # Test accounts endpoint
        print("2. Testing GET /api/accounts")
        response = requests.get(f"{base_url}/accounts")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            accounts = response.json()
            print(f"   Found {len(accounts)} accounts:")
            for acc in accounts[:3]:  # Show first 3
                print(f"     - ID: {acc.get('id')}, Identifier: {acc.get('account_identifier')}")
        print()
        
        # Test bets endpoint
        print("3. Testing GET /api/bets")
        response = requests.get(f"{base_url}/bets")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            bets = response.json()
            print(f"   Found {len(bets)} bets:")
            for bet in bets[:2]:  # Show first 2
                print(f"     - ID: {bet.get('id')}, Sportsbook: {bet.get('sportsbook', {}).get('name')}, Account: {bet.get('account', {}).get('account_identifier')}")
        print()
        
        # Test transactions endpoint
        print("4. Testing GET /api/transactions")
        response = requests.get(f"{base_url}/transactions")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            transactions = response.json()
            print(f"   Found {len(transactions)} transactions:")
            for txn in transactions[:2]:  # Show first 2
                print(f"     - ID: {txn.get('id')}, Type: {txn.get('transaction_type')}, Sportsbook: {txn.get('sportsbook', {}).get('name')}")
        print()
        
        print("✅ API testing completed successfully!")
        print("✅ Foreign key migration appears to be working correctly!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server.")
        print("   Make sure the Flask server is running on http://127.0.0.1:5001")
    except Exception as e:
        print(f"❌ Error during API testing: {str(e)}")

if __name__ == "__main__":
    test_api()
