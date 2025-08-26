# BetTracker Web Application

A personal betting tracker web application built with Flask (backend) and React (frontend) for tracking and analyzing your betting activity.

## Features

- **Dashboard**: View your betting statistics, profit/loss, win rate, and ROI
- **Bet Management**: Add, edit, and delete bets
- **Bet Settlement**: Mark bets as won, lost, or void
- **Filtering**: Filter bets by status and sport
- **Statistics**: Comprehensive betting analytics
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Flask
- SQLAlchemy
- SQLite
- Flask-CORS

### Frontend
- React
- Vite
- Material-UI
- Tailwind CSS
- Axios

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```cmd
   cd backend
   ```

2. Create a virtual environment:
   ```cmd
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```cmd
   venv\Scripts\activate
   ```

4. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```

5. Run the Flask application:
   ```cmd
   python run.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```cmd
   cd frontend
   ```

2. Install dependencies:
   ```cmd
   npm install
   ```

3. Start the Vite development server:
   ```cmd
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Seeding the Database (Optional)

To populate the database with dummy data for testing and demonstration:

### Option 1: Using Batch Script (Windows)
```cmd
seed-database.bat
```

### Option 2: Using Python Script (Cross-platform)
```cmd
python seed_database.py
```

### Option 3: Manual (from backend directory)
```cmd
cd backend
venv\Scripts\activate
python seed_db.py
```

This will create 50 dummy betting records with realistic data including:
- Various sports (Football, Basketball, Baseball, etc.)
- Different bet types (Moneyline, Spread, Over/Under, etc.)
- Mix of won, lost, void, and pending bets
- Realistic odds and stake amounts
- Random dates over the last 3 months

## Usage

1. Start both the backend and frontend servers
2. (Optional) Seed the database with dummy data
3. Open your browser and go to `http://localhost:3000`
4. Use the navigation to switch between Dashboard and My Bets
5. Add new bets using the "Add Bet" button
6. Settle pending bets by clicking the actions menu (three dots) and selecting "Settle"
7. View your statistics on the Dashboard

## Database

The application uses SQLite database (`bettracker.db`) which will be created automatically when you first run the backend. The database includes:

- **Bets table**: Stores all bet information including sport, event, odds, stakes, and results

## API Endpoints

- `GET /api/bets` - Get all bets with optional filtering
- `POST /api/bets` - Create a new bet
- `PUT /api/bets/<id>` - Update a bet
- `DELETE /api/bets/<id>` - Delete a bet
- `GET /api/stats` - Get betting statistics

## Features Explained

### Bet Types
- Moneyline
- Point Spread
- Over/Under
- Prop Bet
- Parlay
- Teaser
- Future
- Other

### Sports Supported
- Football
- Basketball
- Baseball
- Hockey
- Soccer
- Tennis
- Golf
- Boxing
- MMA
- Other

### Bet Status
- **Pending**: Bet is placed but not yet settled
- **Won**: Bet was successful
- **Lost**: Bet was unsuccessful
- **Void**: Bet was cancelled/pushed

## Contributing

This is a personal project, but feel free to fork and modify for your own use.

## License

This project is for personal use only.
"# Bet-Tracker" 
