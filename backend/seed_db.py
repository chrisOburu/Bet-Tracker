import sys
import os
from datetime import datetime, timedelta
import random

# Add the parent directory to the path to import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.bet import Bet

def create_dummy_bets():
    """Create dummy betting records for testing and demonstration"""
    
    app = create_app()
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing bets...")
        Bet.query.delete()
        db.session.commit()
        
        # Sample data
        sports = ['Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer', 'Tennis', 'Golf', 'Boxing', 'MMA']
        
        bet_types = ['Moneyline', 'Point Spread', 'Over/Under', 'Prop Bet', 'Parlay', 'Future']
        
        football_events = [
            'Chiefs vs Bills', 'Cowboys vs Giants', 'Packers vs Bears', 'Patriots vs Jets',
            'Rams vs 49ers', 'Steelers vs Ravens', 'Saints vs Falcons', 'Bengals vs Browns'
        ]
        
        basketball_events = [
            'Lakers vs Warriors', 'Celtics vs Heat', 'Bucks vs Nets', 'Nuggets vs Suns',
            'Clippers vs Mavericks', 'Sixers vs Knicks', 'Bulls vs Pistons', 'Jazz vs Kings'
        ]
        
        baseball_events = [
            'Yankees vs Red Sox', 'Dodgers vs Padres', 'Astros vs Rangers', 'Braves vs Mets',
            'Cardinals vs Cubs', 'Giants vs Diamondbacks', 'Phillies vs Nationals', 'Blue Jays vs Orioles'
        ]
        
        hockey_events = [
            'Rangers vs Islanders', 'Bruins vs Canadiens', 'Lightning vs Panthers', 'Kings vs Ducks',
            'Blackhawks vs Red Wings', 'Penguins vs Flyers', 'Avalanche vs Stars', 'Oilers vs Flames'
        ]
        
        soccer_events = [
            'Manchester United vs Arsenal', 'Barcelona vs Real Madrid', 'Liverpool vs Chelsea',
            'Bayern Munich vs Dortmund', 'PSG vs Marseille', 'Juventus vs AC Milan'
        ]
        
        tennis_events = [
            'Djokovic vs Nadal', 'Federer vs Murray', 'Serena Williams vs Naomi Osaka',
            'Ashleigh Barty vs Simona Halep', 'Stefanos Tsitsipas vs Alexander Zverev'
        ]
        
        golf_events = [
            'The Masters Tournament', 'US Open Championship', 'British Open', 'PGA Championship',
            'Players Championship', 'FedEx Cup Playoffs'
        ]
        
        boxing_events = [
            'Fury vs Wilder III', 'Canelo vs GGG', 'Joshua vs Usyk', 'Davis vs Garcia',
            'Crawford vs Spence', 'Lopez vs Haney'
        ]
        
        mma_events = [
            'UFC 280: Oliveira vs Makhachev', 'UFC 281: Adesanya vs Pereira', 'UFC 282: Blachowicz vs Ankalaev',
            'UFC 283: Teixeira vs Hill', 'UFC 284: Makhachev vs Volkanovski'
        ]
        
        events_by_sport = {
            'Football': football_events,
            'Basketball': basketball_events,
            'Baseball': baseball_events,
            'Hockey': hockey_events,
            'Soccer': soccer_events,
            'Tennis': tennis_events,
            'Golf': golf_events,
            'Boxing': boxing_events,
            'MMA': mma_events
        }
        
        selections = {
            'Moneyline': ['Team A to Win', 'Team B to Win', 'Draw'],
            'Point Spread': ['Team A -3.5', 'Team B +3.5', 'Team A -7', 'Team B +7'],
            'Over/Under': ['Over 45.5 Points', 'Under 45.5 Points', 'Over 2.5 Goals', 'Under 2.5 Goals'],
            'Prop Bet': ['Player to Score First', 'Over 2.5 Touchdowns', 'Player Over 100 Yards', 'First Half Winner'],
            'Parlay': ['3-Team Parlay', '4-Team Parlay', '5-Team Parlay'],
            'Future': ['Season Winner', 'MVP Award', 'Rookie of the Year', 'Championship Winner']
        }
        
        # Generate 50 dummy bets
        bets_to_create = []
        
        for i in range(50):
            sport = random.choice(sports)
            event_name = random.choice(events_by_sport[sport])
            bet_type = random.choice(bet_types)
            selection = random.choice(selections[bet_type])
            
            # Generate realistic odds (1.5 to 5.0)
            odds = round(random.uniform(1.5, 5.0), 2)
            
            # Generate stake between $10 and $500
            stake = round(random.uniform(10, 500), 2)
            
            # Calculate potential payout
            potential_payout = round(stake * odds, 2)
            
            # Random date within last 3 months
            days_ago = random.randint(0, 90)
            date_placed = datetime.utcnow() - timedelta(days=days_ago)
            
            # Determine status (70% settled, 30% pending)
            if random.random() < 0.7:  # 70% chance of being settled
                status = random.choices(['won', 'lost', 'void'], weights=[40, 55, 5])[0]
                date_settled = date_placed + timedelta(days=random.randint(0, 7))
                
                if status == 'won':
                    actual_payout = potential_payout
                    profit_loss = actual_payout - stake
                elif status == 'lost':
                    actual_payout = 0
                    profit_loss = -stake
                else:  # void
                    actual_payout = stake
                    profit_loss = 0
            else:  # pending
                status = 'pending'
                date_settled = None
                actual_payout = 0
                profit_loss = 0
            
            # Random notes (30% chance of having notes)
            notes = ''
            if random.random() < 0.3:
                note_options = [
                    'Good value bet', 'Injury concern', 'Weather factor', 'Home advantage',
                    'Strong recent form', 'Head to head record', 'Playoff implications',
                    'Late lineup change', 'Public money on opponent', 'Sharp money'
                ]
                notes = random.choice(note_options)
            
            bet = Bet(
                sport=sport,
                event_name=event_name,
                bet_type=bet_type,
                selection=selection,
                odds=odds,
                stake=stake,
                status=status,
                potential_payout=potential_payout,
                actual_payout=actual_payout,
                profit_loss=profit_loss,
                date_placed=date_placed,
                date_settled=date_settled,
                notes=notes
            )
            
            bets_to_create.append(bet)
        
        # Add all bets to the database
        print(f"Creating {len(bets_to_create)} dummy bets...")
        db.session.add_all(bets_to_create)
        db.session.commit()
        
        print("Dummy data created successfully!")
        
        # Print summary statistics
        total_bets = len(bets_to_create)
        settled_bets = [bet for bet in bets_to_create if bet.status != 'pending']
        won_bets = [bet for bet in bets_to_create if bet.status == 'won']
        lost_bets = [bet for bet in bets_to_create if bet.status == 'lost']
        
        total_staked = sum(bet.stake for bet in bets_to_create)
        total_profit_loss = sum(bet.profit_loss for bet in settled_bets)
        
        print(f"\nSummary:")
        print(f"Total Bets: {total_bets}")
        print(f"Settled Bets: {len(settled_bets)}")
        print(f"Won: {len(won_bets)}")
        print(f"Lost: {len(lost_bets)}")
        print(f"Pending: {total_bets - len(settled_bets)}")
        print(f"Total Staked: ${total_staked:.2f}")
        print(f"Total P&L: ${total_profit_loss:.2f}")
        if len(settled_bets) > 0:
            win_rate = len(won_bets) / len(settled_bets) * 100
            print(f"Win Rate: {win_rate:.1f}%")
        if total_staked > 0:
            roi = total_profit_loss / total_staked * 100
            print(f"ROI: {roi:.1f}%")

if __name__ == '__main__':
    create_dummy_bets()
