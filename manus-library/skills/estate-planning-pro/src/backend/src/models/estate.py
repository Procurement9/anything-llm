from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date)
    ssn_encrypted = db.Column(db.String(255))  # Should be encrypted in production
    address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assets = db.relationship('Asset', backref='owner', lazy=True, cascade='all, delete-orphan')
    liabilities = db.relationship('Liability', backref='owner', lazy=True, cascade='all, delete-orphan')
    beneficiaries = db.relationship('Beneficiary', backref='owner', lazy=True, cascade='all, delete-orphan')
    documents = db.relationship('Document', backref='owner', lazy=True, cascade='all, delete-orphan')
    tax_calculations = db.relationship('TaxCalculation', backref='owner', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'address': self.address,
            'phone': self.phone,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Asset(db.Model):
    __tablename__ = 'assets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    asset_type = db.Column(db.String(50), nullable=False)  # real_estate, bank_account, investment, etc.
    description = db.Column(db.String(255), nullable=False)
    current_value = db.Column(db.Numeric(15, 2), nullable=False)
    acquisition_date = db.Column(db.Date)
    acquisition_cost = db.Column(db.Numeric(15, 2))
    location = db.Column(db.String(255))
    ownership_type = db.Column(db.String(50))  # sole, joint, community_property
    additional_details = db.Column(db.Text)  # JSON string for flexible data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'asset_type': self.asset_type,
            'description': self.description,
            'current_value': float(self.current_value),
            'acquisition_date': self.acquisition_date.isoformat() if self.acquisition_date else None,
            'acquisition_cost': float(self.acquisition_cost) if self.acquisition_cost else None,
            'location': self.location,
            'ownership_type': self.ownership_type,
            'additional_details': json.loads(self.additional_details) if self.additional_details else {},
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Liability(db.Model):
    __tablename__ = 'liabilities'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    liability_type = db.Column(db.String(50), nullable=False)  # mortgage, loan, credit_card, etc.
    description = db.Column(db.String(255), nullable=False)
    current_balance = db.Column(db.Numeric(15, 2), nullable=False)
    interest_rate = db.Column(db.Numeric(5, 4))
    monthly_payment = db.Column(db.Numeric(10, 2))
    creditor_name = db.Column(db.String(255))
    maturity_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'liability_type': self.liability_type,
            'description': self.description,
            'current_balance': float(self.current_balance),
            'interest_rate': float(self.interest_rate) if self.interest_rate else None,
            'monthly_payment': float(self.monthly_payment) if self.monthly_payment else None,
            'creditor_name': self.creditor_name,
            'maturity_date': self.maturity_date.isoformat() if self.maturity_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Beneficiary(db.Model):
    __tablename__ = 'beneficiaries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    relationship = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date)
    ssn_encrypted = db.Column(db.String(255))  # Should be encrypted in production
    address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    percentage_share = db.Column(db.Numeric(5, 2), nullable=False)  # 0.00 to 100.00
    is_contingent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'relationship': self.relationship,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'address': self.address,
            'phone': self.phone,
            'percentage_share': float(self.percentage_share),
            'is_contingent': self.is_contingent,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)  # will, poa, healthcare_directive, trust
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)  # JSON string containing document data
    status = db.Column(db.String(20), default='draft')  # draft, completed, executed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'document_type': self.document_type,
            'title': self.title,
            'content': json.loads(self.content) if self.content else {},
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TaxCalculation(db.Model):
    __tablename__ = 'tax_calculations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tax_year = db.Column(db.Integer, nullable=False)
    gross_estate_value = db.Column(db.Numeric(15, 2), nullable=False)
    total_deductions = db.Column(db.Numeric(15, 2), default=0)
    taxable_estate = db.Column(db.Numeric(15, 2), nullable=False)
    estate_tax_liability = db.Column(db.Numeric(15, 2), default=0)
    gift_tax_liability = db.Column(db.Numeric(15, 2), default=0)
    calculation_details = db.Column(db.Text)  # JSON string with detailed calculations
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tax_year': self.tax_year,
            'gross_estate_value': float(self.gross_estate_value),
            'total_deductions': float(self.total_deductions),
            'taxable_estate': float(self.taxable_estate),
            'estate_tax_liability': float(self.estate_tax_liability),
            'gift_tax_liability': float(self.gift_tax_liability),
            'calculation_details': json.loads(self.calculation_details) if self.calculation_details else {},
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

