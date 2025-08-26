from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'dev-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bettracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Import models
    from app.models.bet import Bet
    from app.models.transaction import Transaction
    from app.models.arbitrage import Arbitrage
    
    # Register blueprints
    from app.routes.bets import bets_bp
    from app.routes.transactions import transactions_bp
    from app.routes.arbitrages import arbitrages_bp
    app.register_blueprint(bets_bp, url_prefix='/api')
    app.register_blueprint(transactions_bp, url_prefix='/api')
    app.register_blueprint(arbitrages_bp, url_prefix='/api')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app
