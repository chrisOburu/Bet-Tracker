from app import db
from datetime import datetime

class Bet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sport = db.Column(db.String(100), nullable=False)
    event_name = db.Column(db.String(200), nullable=False)
    bet_type = db.Column(db.String(100), nullable=False)  # e.g., 'Moneyline', 'Spread', 'Over/Under'
    selection = db.Column(db.String(200), nullable=False)  # What you bet on
    
    # Foreign key references
    sportsbook_id = db.Column(db.Integer, db.ForeignKey('sportsbook.id'), nullable=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    
    odds = db.Column(db.Float, nullable=False)  # Decimal odds
    stake = db.Column(db.Float, nullable=False)  # Amount wagered
    status = db.Column(db.String(20), nullable=False, default='pending')  # 'pending', 'won', 'lost', 'void'
    potential_payout = db.Column(db.Float, nullable=False)  # stake * odds
    actual_payout = db.Column(db.Float, default=0.0)  # Actual amount received if won
    profit_loss = db.Column(db.Float, default=0.0)  # Profit or loss
    date_placed = db.Column(db.DateTime, nullable=False, default=datetime.now)
    date_settled = db.Column(db.DateTime)
    kickoff = db.Column(db.DateTime)  # Event start time
    notes = db.Column(db.Text)
    
    # Relationships
    sportsbook_rel = db.relationship('Sportsbook', backref='bets', lazy=True, foreign_keys=[sportsbook_id])
    account_rel = db.relationship('Account', backref='bets', lazy=True, foreign_keys=[account_id])
    
    def __repr__(self):
        return f'<Bet {self.event_name} - {self.selection}>'
    
    def to_dict(self):
        # Get sportsbook name from relationship
        sportsbook_name = None
        if self.sportsbook_rel:
            sportsbook_name = self.sportsbook_rel.name
        
        # Get account name and identifier from relationship
        account_name = None
        account_identifier = None
        if self.account_rel:
            account_name = self.account_rel.name
            account_identifier = self.account_rel.account_identifier
        
        return {
            'id': self.id,
            'sport': self.sport,
            'event_name': self.event_name,
            'bet_type': self.bet_type,
            'selection': self.selection,
            'sportsbook_id': self.sportsbook_id,
            'sportsbook': sportsbook_name,
            'account_id': self.account_id,
            'account': account_identifier,
            'account_name': account_name,
            'odds': self.odds,
            'stake': self.stake,
            'status': self.status,
            'potential_payout': self.potential_payout,
            'actual_payout': self.actual_payout,
            'profit_loss': self.profit_loss,
            'date_placed': self.date_placed.isoformat() if self.date_placed else None,
            'date_settled': self.date_settled.isoformat() if self.date_settled else None,
            'kickoff': self.kickoff.isoformat() if self.kickoff else None,
            'notes': self.notes
        }
