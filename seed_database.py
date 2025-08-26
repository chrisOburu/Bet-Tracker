#!/usr/bin/env python3
"""
Cross-platform script to seed the database with dummy data
Usage: python seed_database.py
"""

import subprocess
import sys
import os

def run_seed_script():
    """Run the seed script with proper environment setup"""
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    
    if not os.path.exists(backend_dir):
        print("Error: Backend directory not found!")
        return False
    
    os.chdir(backend_dir)
    
    # Check if virtual environment exists
    venv_path = os.path.join('venv', 'Scripts' if os.name == 'nt' else 'bin')
    python_exe = os.path.join(venv_path, 'python.exe' if os.name == 'nt' else 'python')
    
    if not os.path.exists(python_exe):
        print("Error: Virtual environment not found!")
        print("Please run the backend setup first:")
        if os.name == 'nt':
            print("  start-backend.bat")
        else:
            print("  cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt")
        return False
    
    try:
        # Run the seed script
        print("Running seed script...")
        result = subprocess.run([python_exe, 'seed_db.py'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print(result.stdout)
            print("Database seeded successfully!")
            return True
        else:
            print("Error running seed script:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    print("BetTracker Database Seeder")
    print("=" * 30)
    
    success = run_seed_script()
    
    if success:
        print("\nYou can now start the application to see the dummy data!")
    else:
        print("\nSeeding failed. Please check the error messages above.")
    
    if os.name == 'nt':  # Windows
        input("Press Enter to continue...")
    
    sys.exit(0 if success else 1)
