from datetime import datetime
from app import db
import json

class Arbitrage(db.Model):
    __tablename__ = 'arbitrage'
    
    id = db.Column(db.Integer, primary_key=True)
    match_signature = db.Column(db.String(255), nullable=False, index=True)
    profit = db.Column(db.Float, nullable=False, index=True)
    kickoff_datetime = db.Column(db.String(50), nullable=False, index=True)
    combination_details = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    def to_dict(self):
        try:
            combination_data = json.loads(self.combination_details) if self.combination_details else []
        except json.JSONDecodeError:
            combination_data = []
            
        return {
            'id': self.id,
            'match_signature': self.match_signature,
            'profit': self.profit,
            'kickoff_datetime': self.kickoff_datetime,
            'combination_details': combination_data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Arbitrage {self.match_signature} - {self.profit}% profit>'
