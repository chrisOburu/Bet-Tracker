from datetime import datetime
from app import db

class Transaction(db.Model):
    __tablename__ = 'transaction'
    
    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'deposit' or 'withdrawal'
    sportsbook = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=True)  # 'bank_transfer', 'credit_card', 'crypto', etc.
    reference_id = db.Column(db.String(100), nullable=True)  # transaction reference from sportsbook
    status = db.Column(db.String(20), default='completed')  # 'pending', 'completed', 'failed'
    date_created = db.Column(db.DateTime, default=datetime.now)
    date_processed = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'transaction_type': self.transaction_type,
            'sportsbook': self.sportsbook,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'reference_id': self.reference_id,
            'status': self.status,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'date_processed': self.date_processed.isoformat() if self.date_processed else None,
            'notes': self.notes
        }
    
    def __repr__(self):
        return f'<Transaction {self.transaction_type}: ${self.amount} - {self.sportsbook}>'
