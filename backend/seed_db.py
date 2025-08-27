import sys
import os
from datetime import datetime, timedelta
import random

# Add the parent directory to the path to import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.bet import Bet
from app.models.transaction import Transaction
from app.models.arbitrage import Arbitrage

def create_dummy_bets():
    """Create dummy betting records for testing and demons        # Create dummy data
        create_dummy_bets()
        create_dummy_transactions()
        create_dummy_arbitrages()
        
        print("
All dummy data created successfully!")ration"""
    
    app = create_app()
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing bets...")
        Bet.query.delete()
        db.session.commit()
        
        # Sample data
        sports = ['Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer', 'Tennis', 'Golf', 'Boxing', 'MMA']
        
        bet_types = ['Moneyline', 'Point Spread', 'Over/Under', 'Prop Bet', 'Parlay', 'Future']
        
        sportsbooks = [
            'DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet', 
            'BetRivers', 'Unibet', 'WynnBET', 'Barstool', 'FOX Bet',
            'ESPN BET', 'bet365', 'Hard Rock Bet', 'Fanatics'
        ]
        
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
            sportsbook = random.choice(sportsbooks)
            
            # Generate realistic odds (1.5 to 5.0)
            odds = round(random.uniform(1.5, 5.0), 2)
            
            # Generate stake between $10 and $500
            stake = round(random.uniform(10, 500), 2)
            
            # Calculate potential payout
            potential_payout = round(stake * odds, 2)
            
            # Random date within last 3 months with time
            days_ago = random.randint(0, 90)
            hours = random.randint(0, 23)
            minutes = random.randint(0, 59)
            seconds = random.randint(0, 59)
            date_placed = datetime.utcnow() - timedelta(days=days_ago, hours=hours, minutes=minutes, seconds=seconds)
            
            # Determine status (70% settled, 30% pending)
            if random.random() < 0.7:  # 70% chance of being settled
                status = random.choices(['won', 'lost', 'void'], weights=[40, 55, 5])[0]
                # Settlement date is 1-7 days after placement, with random time
                settlement_hours = random.randint(1, 168)  # 1 hour to 7 days
                settlement_minutes = random.randint(0, 59)
                settlement_seconds = random.randint(0, 59)
                date_settled = date_placed + timedelta(hours=settlement_hours, minutes=settlement_minutes, seconds=settlement_seconds)
                
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
            
            # Generate kickoff time (usually 1-14 days in the future from bet placement)
            kickoff_days_ahead = random.randint(1, 14)
            kickoff_hours = random.randint(0, 23)
            kickoff_minutes = random.choice([0, 15, 30, 45])  # Common kickoff times
            kickoff = date_placed + timedelta(days=kickoff_days_ahead, hours=kickoff_hours, minutes=kickoff_minutes)
            
            bet = Bet(
                sport=sport,
                event_name=event_name,
                bet_type=bet_type,
                selection=selection,
                sportsbook=sportsbook,
                odds=odds,
                stake=stake,
                status=status,
                potential_payout=potential_payout,
                actual_payout=actual_payout,
                profit_loss=profit_loss,
                date_placed=date_placed,
                date_settled=date_settled,
                kickoff=kickoff,
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


def create_dummy_transactions():
    """Create dummy transaction data"""
    print("Creating 30 dummy transactions...")
    
    sportsbooks = [
        'DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet',
        'WynnBET', 'BetRivers', 'Unibet', 'FOX Bet', 'Barstool',
        'Hard Rock Bet', 'ESPN BET', 'bet365', 'Other'
    ]
    
    payment_methods = [
        'Bank Transfer', 'Credit Card', 'Debit Card', 'PayPal',
        'Crypto', 'Check', 'Cash App', 'Venmo', 'Skrill'
    ]
    
    statuses = ['completed', 'pending', 'failed']
    transaction_types = ['deposit', 'withdrawal']
    
    # Clear existing transactions
    print("Clearing existing transactions...")
    Transaction.query.delete()
    
    transactions = []
    
    for i in range(30):
        # Random date in the past 90 days
        days_ago = random.randint(0, 90)
        hours = random.randint(0, 23)
        minutes = random.randint(0, 59)
        seconds = random.randint(0, 59)
        
        date_created = datetime.utcnow() - timedelta(days=days_ago, hours=hours, minutes=minutes, seconds=seconds)
        
        transaction_type = random.choice(transaction_types)
        sportsbook = random.choice(sportsbooks)
        status = random.choices(statuses, weights=[85, 10, 5], k=1)[0]  # Weighted towards completed
        
        # Amount varies by transaction type
        if transaction_type == 'deposit':
            amount = round(random.uniform(50, 2000), 2)  # Deposits: $50-$2000
        else:
            amount = round(random.uniform(25, 1500), 2)  # Withdrawals: $25-$1500
        
        # Date processed (for completed transactions)
        date_processed = None
        if status == 'completed':
            # Process within a few hours to a few days
            process_delay = random.randint(1, 72)  # 1-72 hours
            date_processed = date_created + timedelta(hours=process_delay)
        
        # Reference ID (more likely for larger amounts)
        reference_id = None
        if amount > 500 or random.random() < 0.3:
            reference_id = f"TXN{random.randint(100000, 999999)}"
        
        # Payment method (more likely for deposits)
        payment_method = None
        if transaction_type == 'deposit' or random.random() < 0.4:
            payment_method = random.choice(payment_methods)
        
        # Notes (occasional)
        notes = None
        if random.random() < 0.2:  # 20% chance of having notes
            note_options = [
                "Welcome bonus deposit",
                "Monthly bankroll top-up", 
                "Profit withdrawal",
                "End of month cashout",
                "Bonus clearing withdrawal",
                "Quick deposit for live bet"
            ]
            notes = random.choice(note_options)
        
        transaction = Transaction(
            transaction_type=transaction_type,
            sportsbook=sportsbook,
            amount=amount,
            payment_method=payment_method,
            reference_id=reference_id,
            status=status,
            date_created=date_created,
            date_processed=date_processed,
            notes=notes
        )
        
        transactions.append(transaction)
    
    # Bulk insert
    db.session.add_all(transactions)
    db.session.commit()
    
    # Calculate and display summary
    completed_transactions = [t for t in transactions if t.status == 'completed']
    total_deposits = sum(t.amount for t in completed_transactions if t.transaction_type == 'deposit')
    total_withdrawals = sum(t.amount for t in completed_transactions if t.transaction_type == 'withdrawal')
    
    print(f"""
Transaction Summary:
Total Transactions: {len(transactions)}
Completed: {len(completed_transactions)}
Pending: {len([t for t in transactions if t.status == 'pending'])}
Failed: {len([t for t in transactions if t.status == 'failed'])}
Total Deposits: ${total_deposits:,.2f}
Total Withdrawals: ${total_withdrawals:,.2f}
Net Position: ${total_deposits - total_withdrawals:,.2f}
""")


def create_dummy_arbitrages():
    """Create dummy arbitrage data"""
    print("Creating 15 dummy arbitrage opportunities...")
    
    # Clear existing arbitrages
    print("Clearing existing arbitrages...")
    Arbitrage.query.delete()
    
    markets = ['Match Result', 'Total Goals', 'Both Teams to Score', 'Over/Under 2.5', 'Asian Handicap', 'Double Chance']
    leagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Europa League']
    countries = ['England', 'Spain', 'Italy', 'Germany', 'France', 'International']
    
    teams = [
        ('Manchester United', 'Arsenal'),
        ('Barcelona', 'Real Madrid'),
        ('Liverpool', 'Chelsea'),
        ('Bayern Munich', 'Dortmund'),
        ('PSG', 'Marseille'),
        ('Juventus', 'AC Milan'),
        ('Manchester City', 'Tottenham'),
        ('Atletico Madrid', 'Valencia'),
        ('Inter Milan', 'Roma'),
        ('RB Leipzig', 'Bayer Leverkusen'),
        ('Lyon', 'Monaco'),
        ('Napoli', 'Atalanta'),
        ('Leicester City', 'West Ham'),
        ('Sevilla', 'Real Betis'),
        ('Lazio', 'Fiorentina')
    ]
    
    bookmakers = ['Bet365', 'William Hill', 'Ladbrokes', 'Paddy Power', 'Betfair', 'Coral', 'SkyBet', '888Sport', 'Unibet', 'Betway']
    
    arbitrages = []
    
    for i in range(15):
        home_team, away_team = random.choice(teams)
        market = random.choice(markets)
        league = random.choice(leagues)
        country = random.choice(countries)
        
        # Generate profit between 0.5% and 5%
        profit = round(random.uniform(0.5, 5.0), 2)
        
        # Generate kickoff time (1-30 days in the future)
        kickoff_days = random.randint(1, 30)
        kickoff_hours = random.randint(12, 22)  # Typical match times
        kickoff_minutes = random.choice([0, 15, 30, 45])
        kickoff = datetime.now() + timedelta(days=kickoff_days, hours=kickoff_hours, minutes=kickoff_minutes)
        
        # Create match signature
        match_signature = f"{home_team} vs {away_team} - {market}"
        
        # Generate combination details based on market type
        if market == 'Match Result':
            combinations = [
                {'name': '1', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(2.5, 4.0), 2)},
                {'name': 'X', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(3.0, 3.8), 2)},
                {'name': '2', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(2.2, 5.0), 2)}
            ]
        elif market == 'Total Goals' or market == 'Over/Under 2.5':
            combinations = [
                {'name': 'Over 2.5', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.8, 2.3), 2)},
                {'name': 'Under 2.5', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.6, 2.1), 2)}
            ]
        elif market == 'Both Teams to Score':
            combinations = [
                {'name': 'Yes', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.7, 2.2), 2)},
                {'name': 'No', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.6, 2.0), 2)}
            ]
        elif market == 'Asian Handicap':
            handicap = random.choice(['-0.5', '+0.5', '-1.0', '+1.0', '-1.5', '+1.5'])
            combinations = [
                {'name': f'{home_team} {handicap}', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.8, 2.2), 2)},
                {'name': f'{away_team} {handicap[1:] if handicap.startswith("-") else "-" + handicap[1:]}', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.8, 2.2), 2)}
            ]
        else:  # Double Chance
            combinations = [
                {'name': '1X', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.3, 1.8), 2)},
                {'name': '12', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.2, 1.5), 2)},
                {'name': 'X2', 'bookmaker': random.choice(bookmakers), 'odds': round(random.uniform(1.4, 2.0), 2)}
            ]
        
        # Make sure bookmakers are different for each combination
        used_bookmakers = []
        for combo in combinations:
            while combo['bookmaker'] in used_bookmakers:
                combo['bookmaker'] = random.choice(bookmakers)
            used_bookmakers.append(combo['bookmaker'])
        
        arbitrage = Arbitrage(
            profit=profit,
            market_name=market,
            home_team=home_team,
            away_team=away_team,
            league=league,
            country=country,
            match_signature=match_signature,
            kickoff_datetime=kickoff,
            combination_details=combinations,
            is_active=random.choice([True, True, True, False])  # 75% chance of being active
        )
        
        arbitrages.append(arbitrage)
    
    # Bulk insert
    db.session.add_all(arbitrages)
    db.session.commit()
    
    # Calculate summary
    active_arbitrages = [a for a in arbitrages if a.is_active]
    avg_profit = sum(a.profit for a in arbitrages) / len(arbitrages)
    max_profit = max(a.profit for a in arbitrages)
    
    print(f"""
Arbitrage Summary:
Total Opportunities: {len(arbitrages)}
Active: {len(active_arbitrages)}
Inactive: {len(arbitrages) - len(active_arbitrages)}
Average Profit: {avg_profit:.2f}%
Maximum Profit: {max_profit:.2f}%
""")


if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create dummy data
        create_dummy_bets()
        create_dummy_transactions()
        #create_dummy_arbitrages()
        
        print("\nAll dummy data created successfully!")
