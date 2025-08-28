from app import db
from datetime import datetime

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    account_identifier = db.Column(db.String(100), unique=True, nullable=False)  # Email or phone number
    account_type = db.Column(db.String(20), nullable=False)  # 'email' or 'phone'
    name = db.Column(db.String(100), unique=True, nullable=False)  # Mandatory unique display name
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<Account {self.account_identifier}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'account_identifier': self.account_identifier,
            'account_type': self.account_type,
            'name': self.name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notes': self.notes
        }
    
    @staticmethod
    def detect_account_type(identifier):
        """Detect if identifier is email or phone number"""
        if '@' in identifier and '.' in identifier:
            return 'email'
        elif identifier.replace('+', '').replace('-', '').replace(' ', '').replace('(', '').replace(')', '').isdigit():
            return 'phone'
        else:
            return 'email'  # Default to email if unclear
