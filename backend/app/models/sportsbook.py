from app import db
from datetime import datetime

class Sportsbook(db.Model):
    __tablename__ = 'sportsbook'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    display_name = db.Column(db.String(100), nullable=True)  # Optional friendly display name
    website_url = db.Column(db.String(500), nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    country = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    def __repr__(self):
        return f'<Sportsbook {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'display_name': self.display_name or self.name,
            'website_url': self.website_url,
            'logo_url': self.logo_url,
            'is_active': self.is_active,
            'country': self.country,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def get_active_sportsbooks(cls):
        """Get all active sportsbooks"""
        return cls.query.filter_by(is_active=True).order_by(cls.name).all()
    
    @classmethod
    def get_by_name(cls, name):
        """Get sportsbook by name (case insensitive)"""
        return cls.query.filter(db.func.lower(cls.name) == name.lower()).first()
    
    @classmethod
    def create_if_not_exists(cls, name, **kwargs):
        """Create a sportsbook if it doesn't already exist"""
        existing = cls.get_by_name(name)
        if existing:
            return existing
        
        sportsbook = cls(name=name, **kwargs)
        db.session.add(sportsbook)
        return sportsbook
