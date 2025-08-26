from app import db
from datetime import datetime

class Bet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sport = db.Column(db.String(100), nullable=False)
    event_name = db.Column(db.String(200), nullable=False)
    bet_type = db.Column(db.String(100), nullable=False)  # e.g., 'Moneyline', 'Spread', 'Over/Under'
    selection = db.Column(db.String(200), nullable=False)  # What you bet on
    odds = db.Column(db.Float, nullable=False)  # Decimal odds
    stake = db.Column(db.Float, nullable=False)  # Amount wagered
    status = db.Column(db.String(20), nullable=False, default='pending')  # 'pending', 'won', 'lost', 'void'
    potential_payout = db.Column(db.Float, nullable=False)  # stake * odds
    actual_payout = db.Column(db.Float, default=0.0)  # Actual amount received if won
    profit_loss = db.Column(db.Float, default=0.0)  # Profit or loss
    date_placed = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    date_settled = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    def __repr__(self):
        return f'<Bet {self.event_name} - {self.selection}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'sport': self.sport,
            'event_name': self.event_name,
            'bet_type': self.bet_type,
            'selection': self.selection,
            'odds': self.odds,
            'stake': self.stake,
            'status': self.status,
            'potential_payout': self.potential_payout,
            'actual_payout': self.actual_payout,
            'profit_loss': self.profit_loss,
            'date_placed': self.date_placed.isoformat() if self.date_placed else None,
            'date_settled': self.date_settled.isoformat() if self.date_settled else None,
            'notes': self.notes
        }
