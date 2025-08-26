import requests
import json

def test_api():
    try:
        # Test the grouped arbitrages endpoint
        url = 'http://localhost:5000/api/arbitrages/grouped'
        params = {
            'page': 1,
            'per_page': 10,
            'sort_by': 'profit',
            'sort_order': 'desc'
        }
        
        print("Testing grouped arbitrages endpoint...")
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Groups count: {len(data.get('groups', []))}")
            print(f"Pagination: {data.get('pagination', {})}")
        
        # Test the stats endpoint
        stats_url = 'http://localhost:5000/api/arbitrages/stats'
        print("\nTesting stats endpoint...")
        stats_response = requests.get(stats_url)
        print(f"Stats Status Code: {stats_response.status_code}")
        print(f"Stats Response: {stats_response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
