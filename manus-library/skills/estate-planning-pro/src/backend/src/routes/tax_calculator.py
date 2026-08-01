from flask import Blueprint, request, jsonify
from src.models.estate import db, TaxCalculation, Asset, Liability
from src.routes.auth import token_required
from datetime import datetime
import json

tax_bp = Blueprint('tax', __name__)

# 2025 Estate Tax Constants
ESTATE_TAX_EXEMPTION_2025 = 13990000  # $13.99 million
ESTATE_TAX_RATES = [
    (10000, 0.18),
    (20000, 0.20),
    (40000, 0.22),
    (60000, 0.24),
    (80000, 0.26),
    (100000, 0.28),
    (150000, 0.30),
    (250000, 0.32),
    (500000, 0.34),
    (750000, 0.37),
    (1000000, 0.39),
    (float('inf'), 0.40)  # 40% for amounts over $1M above exemption
]

def calculate_estate_tax(taxable_estate):
    """Calculate estate tax based on 2025 tax brackets"""
    if taxable_estate <= ESTATE_TAX_EXEMPTION_2025:
        return 0
    
    taxable_amount = taxable_estate - ESTATE_TAX_EXEMPTION_2025
    tax = 0
    previous_bracket = 0
    
    for bracket_limit, rate in ESTATE_TAX_RATES:
        if taxable_amount <= bracket_limit:
            tax += (taxable_amount - previous_bracket) * rate
            break
        else:
            tax += (bracket_limit - previous_bracket) * rate
            previous_bracket = bracket_limit
    
    return tax

@tax_bp.route('/tax/calculate', methods=['POST'])
@token_required
def calculate_taxes(current_user):
    try:
        data = request.get_json()
        tax_year = data.get('tax_year', datetime.now().year)
        
        # Get user's assets and liabilities
        assets = Asset.query.filter_by(user_id=current_user.id).all()
        liabilities = Liability.query.filter_by(user_id=current_user.id).all()
        
        # Calculate gross estate value
        gross_estate_value = sum(float(asset.current_value) for asset in assets)
        
        # Calculate deductions
        total_liabilities = sum(float(liability.current_balance) for liability in liabilities)
        
        # Additional deductions (can be customized)
        funeral_expenses = data.get('funeral_expenses', 0)
        administration_expenses = data.get('administration_expenses', 0)
        charitable_deductions = data.get('charitable_deductions', 0)
        marital_deductions = data.get('marital_deductions', 0)
        
        total_deductions = (total_liabilities + funeral_expenses + 
                          administration_expenses + charitable_deductions + 
                          marital_deductions)
        
        # Calculate taxable estate
        taxable_estate = max(0, gross_estate_value - total_deductions)
        
        # Calculate estate tax liability
        estate_tax_liability = calculate_estate_tax(taxable_estate)
        
        # Calculate gift tax (simplified - would need more complex logic for actual implementation)
        gift_tax_liability = data.get('gift_tax_liability', 0)
        
        # Prepare calculation details
        calculation_details = {
            'gross_estate_breakdown': {
                asset.asset_type: sum(float(a.current_value) for a in assets if a.asset_type == asset.asset_type)
                for asset in assets
            },
            'deductions_breakdown': {
                'liabilities': total_liabilities,
                'funeral_expenses': funeral_expenses,
                'administration_expenses': administration_expenses,
                'charitable_deductions': charitable_deductions,
                'marital_deductions': marital_deductions
            },
            'tax_calculation': {
                'exemption_amount': ESTATE_TAX_EXEMPTION_2025,
                'taxable_amount': max(0, taxable_estate - ESTATE_TAX_EXEMPTION_2025),
                'effective_tax_rate': (estate_tax_liability / taxable_estate * 100) if taxable_estate > 0 else 0
            }
        }
        
        # Save calculation to database
        tax_calculation = TaxCalculation(
            user_id=current_user.id,
            tax_year=tax_year,
            gross_estate_value=gross_estate_value,
            total_deductions=total_deductions,
            taxable_estate=taxable_estate,
            estate_tax_liability=estate_tax_liability,
            gift_tax_liability=gift_tax_liability,
            calculation_details=json.dumps(calculation_details)
        )
        
        db.session.add(tax_calculation)
        db.session.commit()
        
        return jsonify({
            'message': 'Tax calculation completed successfully',
            'calculation': tax_calculation.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tax_bp.route('/tax/calculations', methods=['GET'])
@token_required
def get_tax_calculations(current_user):
    try:
        calculations = TaxCalculation.query.filter_by(user_id=current_user.id).order_by(
            TaxCalculation.created_at.desc()
        ).all()
        
        return jsonify({
            'calculations': [calc.to_dict() for calc in calculations]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tax_bp.route('/tax/calculations/<int:calculation_id>', methods=['GET'])
@token_required
def get_tax_calculation(current_user, calculation_id):
    try:
        calculation = TaxCalculation.query.filter_by(
            id=calculation_id, 
            user_id=current_user.id
        ).first()
        
        if not calculation:
            return jsonify({'error': 'Tax calculation not found'}), 404
        
        return jsonify({
            'calculation': calculation.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tax_bp.route('/tax/optimization', methods=['POST'])
@token_required
def get_tax_optimization_suggestions(current_user):
    try:
        data = request.get_json()
        
        # Get current estate value
        assets = Asset.query.filter_by(user_id=current_user.id).all()
        liabilities = Liability.query.filter_by(user_id=current_user.id).all()
        
        gross_estate_value = sum(float(asset.current_value) for asset in assets)
        total_liabilities = sum(float(liability.current_balance) for liability in liabilities)
        net_estate_value = gross_estate_value - total_liabilities
        
        suggestions = []
        
        # Generate optimization suggestions based on estate value
        if net_estate_value > ESTATE_TAX_EXEMPTION_2025:
            potential_tax = calculate_estate_tax(net_estate_value)
            
            suggestions.append({
                'strategy': 'Annual Gift Tax Exclusion',
                'description': 'Give up to $18,000 per recipient per year (2024 limit) to reduce estate value',
                'potential_savings': min(potential_tax * 0.1, 50000),
                'complexity': 'Low'
            })
            
            suggestions.append({
                'strategy': 'Charitable Remainder Trust',
                'description': 'Transfer assets to charity while retaining income stream',
                'potential_savings': min(potential_tax * 0.3, 200000),
                'complexity': 'High'
            })
            
            suggestions.append({
                'strategy': 'Irrevocable Life Insurance Trust (ILIT)',
                'description': 'Remove life insurance proceeds from taxable estate',
                'potential_savings': min(potential_tax * 0.2, 100000),
                'complexity': 'Medium'
            })
            
            if data.get('has_business_interests'):
                suggestions.append({
                    'strategy': 'Family Limited Partnership',
                    'description': 'Transfer business interests at discounted values',
                    'potential_savings': min(potential_tax * 0.25, 150000),
                    'complexity': 'High'
                })
        
        elif net_estate_value > ESTATE_TAX_EXEMPTION_2025 * 0.8:
            suggestions.append({
                'strategy': 'Monitor Estate Growth',
                'description': 'Your estate is approaching the exemption limit. Consider planning strategies.',
                'potential_savings': 0,
                'complexity': 'Low'
            })
        
        return jsonify({
            'current_estate_value': net_estate_value,
            'exemption_amount': ESTATE_TAX_EXEMPTION_2025,
            'potential_tax_liability': calculate_estate_tax(net_estate_value),
            'optimization_suggestions': suggestions
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tax_bp.route('/tax/forms/706', methods=['POST'])
@token_required
def generate_form_706_data(current_user):
    try:
        # This would generate data for IRS Form 706 (Estate Tax Return)
        # In a real implementation, this would create a properly formatted form
        
        assets = Asset.query.filter_by(user_id=current_user.id).all()
        liabilities = Liability.query.filter_by(user_id=current_user.id).all()
        
        form_data = {
            'decedent_info': {
                'name': f"{current_user.first_name} {current_user.last_name}",
                'address': current_user.address,
                'date_of_death': datetime.now().strftime('%Y-%m-%d')  # This would be actual date
            },
            'schedule_a_real_estate': [
                asset.to_dict() for asset in assets if asset.asset_type == 'real_estate'
            ],
            'schedule_b_stocks_bonds': [
                asset.to_dict() for asset in assets if asset.asset_type in ['stock', 'bond', 'investment']
            ],
            'schedule_c_mortgages': [
                liability.to_dict() for liability in liabilities if liability.liability_type == 'mortgage'
            ],
            'schedule_f_other_property': [
                asset.to_dict() for asset in assets if asset.asset_type not in ['real_estate', 'stock', 'bond', 'investment']
            ]
        }
        
        return jsonify({
            'message': 'Form 706 data generated successfully',
            'form_data': form_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

