#!/usr/bin/env python3
"""
Simple test script to check API endpoints
"""
import requests
import json

def test_api():
    base_url = "http://127.0.0.1:5001/api"
    
    print("Testing API endpoints...")
    print("=" * 50)
    
    # Test basic health
    try:
        response = requests.get(f"{base_url}/arbitrages", timeout=5)
        print(f"GET /arbitrages - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            print(f"Data keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
        else:
            print(f"Error response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to API: {e}")
    
    print("-" * 50)
    
    # Test grouped endpoint
    try:
        response = requests.get(f"{base_url}/arbitrages/grouped?page=1&per_page=5", timeout=5)
        print(f"GET /arbitrages/grouped - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            if isinstance(data, dict):
                print(f"Response keys: {list(data.keys())}")
                if 'groups' in data:
                    print(f"Groups count: {len(data['groups'])}")
                    if data['groups']:
                        first_group = data['groups'][0]
                        print(f"First group keys: {list(first_group.keys())}")
                        if 'best_arbitrage' in first_group:
                            best = first_group['best_arbitrage']
                            print(f"Best arbitrage keys: {list(best.keys())}")
                            print(f"Profit: {best.get('profit', 'NOT FOUND')}")
        else:
            print(f"Error response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to grouped API: {e}")
    
    print("-" * 50)
    
    # Test stats endpoint
    try:
        response = requests.get(f"{base_url}/arbitrages/stats", timeout=5)
        print(f"GET /arbitrages/stats - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Stats: {json.dumps(data, indent=2)}")
        else:
            print(f"Error response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to stats API: {e}")

if __name__ == '__main__':
    test_api()
