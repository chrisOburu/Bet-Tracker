from datetime import datetime
from app import db

class Transaction(db.Model):
    __tablename__ = 'transaction'
    
    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'deposit' or 'withdrawal'
    
    # Foreign key references
    sportsbook_id = db.Column(db.Integer, db.ForeignKey('sportsbook.id'), nullable=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    
    amount = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, nullable=False, default=0.0)  # 5% of amount
    transaction_charges = db.Column(db.Float, nullable=False, default=0.0)  # defaults to 115
    payment_method = db.Column(db.String(50), nullable=True)  # 'bank_transfer', 'credit_card', 'crypto', etc.
    reference_id = db.Column(db.String(100), nullable=True)  # transaction reference from sportsbook
    status = db.Column(db.String(20), default='completed')  # 'pending', 'completed', 'failed'
    date_created = db.Column(db.DateTime, default=datetime.now)
    date_processed = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    # Relationships
    sportsbook_rel = db.relationship('Sportsbook', backref='transactions', lazy=True, foreign_keys=[sportsbook_id])
    account_rel = db.relationship('Account', backref='transactions', lazy=True, foreign_keys=[account_id])
    
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
            'transaction_type': self.transaction_type,
            'sportsbook_id': self.sportsbook_id,
            'sportsbook': sportsbook_name,
            'account_id': self.account_id,
            'account': account_identifier,
            'account_name': account_name,
            'amount': self.amount,
            'tax': self.tax,
            'transaction_charges': self.transaction_charges,
            'payment_method': self.payment_method,
            'reference_id': self.reference_id,
            'status': self.status,
            'date_created': self.date_created.isoformat() if self.date_created else None,
            'date_processed': self.date_processed.isoformat() if self.date_processed else None,
            'notes': self.notes
        }
    
    def __repr__(self):
        sportsbook_name = self.sportsbook_rel.name if self.sportsbook_rel else 'Unknown'
        return f'<Transaction {self.transaction_type}: ${self.amount} - {sportsbook_name}>'
