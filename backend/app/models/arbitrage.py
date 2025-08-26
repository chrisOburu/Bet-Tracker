from datetime import datetime
from app import db
import json

class Arbitrage(db.Model):
    __tablename__ = 'arbitrage'
    
    id = db.Column(db.Integer, primary_key=True)
    profit = db.Column(db.Float, nullable=False)  # Profit percentage
    market_name = db.Column(db.String(200), nullable=False)
    home_team = db.Column(db.String(200), nullable=False)
    away_team = db.Column(db.String(200), nullable=False)
    league = db.Column(db.String(200), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    match_signature = db.Column(db.String(500), nullable=False)
    kickoff_datetime = db.Column(db.DateTime, nullable=False)
    combination_details = db.Column(db.Text, nullable=False)  # JSON string of betting opportunities
    date_created = db.Column(db.DateTime, default=datetime.now)
    is_active = db.Column(db.Boolean, default=True)  # Whether the arbitrage is still available
    
    def to_dict(self):
        try:
            combination_data = json.loads(self.combination_details) if self.combination_details else []
        except json.JSONDecodeError:
            combination_data = []
            
        return {
            'id': self.id,
            'profit': self.profit,
            'market_name': self.market_name,
            'home_team': self.home_team,
            'away_team': self.away_team,
            'league': self.league,
            'country': self.country,
            'match_signature': self.match_signature,
            'kickoff_datetime': self.kickoff_datetime.isoformat() if self.kickoff_datetime else None,
            'combination_details': combination_data,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'is_active': self.is_active
        }
    
    def __repr__(self):
        return f'<Arbitrage {self.home_team} vs {self.away_team} - {self.profit}% profit>'
