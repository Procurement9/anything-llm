from flask import Blueprint, request, jsonify
from src.models.estate import db, Beneficiary
from src.routes.auth import token_required
from datetime import datetime

beneficiaries_bp = Blueprint('beneficiaries', __name__)

@beneficiaries_bp.route('/beneficiaries', methods=['GET'])
@token_required
def get_beneficiaries(current_user):
    try:
        beneficiaries = Beneficiary.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            'beneficiaries': [beneficiary.to_dict() for beneficiary in beneficiaries]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@beneficiaries_bp.route('/beneficiaries', methods=['POST'])
@token_required
def create_beneficiary(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'relationship', 'percentage_share']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate percentage_share
        percentage_share = float(data['percentage_share'])
        if percentage_share < 0 or percentage_share > 100:
            return jsonify({'error': 'Percentage share must be between 0 and 100'}), 400
        
        # Check if total percentage would exceed 100%
        existing_beneficiaries = Beneficiary.query.filter_by(
            user_id=current_user.id, 
            is_contingent=data.get('is_contingent', False)
        ).all()
        current_total = sum(float(b.percentage_share) for b in existing_beneficiaries)
        
        if current_total + percentage_share > 100:
            return jsonify({'error': 'Total percentage share cannot exceed 100%'}), 400
        
        beneficiary = Beneficiary(
            user_id=current_user.id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            relationship=data['relationship'],
            percentage_share=percentage_share,
            address=data.get('address'),
            phone=data.get('phone'),
            is_contingent=data.get('is_contingent', False)
        )
        
        # Parse date_of_birth if provided
        if data.get('date_of_birth'):
            beneficiary.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        
        db.session.add(beneficiary)
        db.session.commit()
        
        return jsonify({
            'message': 'Beneficiary created successfully',
            'beneficiary': beneficiary.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@beneficiaries_bp.route('/beneficiaries/<int:beneficiary_id>', methods=['PUT'])
@token_required
def update_beneficiary(current_user, beneficiary_id):
    try:
        beneficiary = Beneficiary.query.filter_by(id=beneficiary_id, user_id=current_user.id).first()
        if not beneficiary:
            return jsonify({'error': 'Beneficiary not found'}), 404
        
        data = request.get_json()
        
        # Validate percentage_share if provided
        if 'percentage_share' in data:
            percentage_share = float(data['percentage_share'])
            if percentage_share < 0 or percentage_share > 100:
                return jsonify({'error': 'Percentage share must be between 0 and 100'}), 400
            
            # Check if total percentage would exceed 100%
            existing_beneficiaries = Beneficiary.query.filter_by(
                user_id=current_user.id, 
                is_contingent=beneficiary.is_contingent
            ).filter(Beneficiary.id != beneficiary_id).all()
            current_total = sum(float(b.percentage_share) for b in existing_beneficiaries)
            
            if current_total + percentage_share > 100:
                return jsonify({'error': 'Total percentage share cannot exceed 100%'}), 400
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'relationship', 'percentage_share',
                         'address', 'phone', 'is_contingent']
        for field in allowed_fields:
            if field in data:
                setattr(beneficiary, field, data[field])
        
        if 'date_of_birth' in data and data['date_of_birth']:
            beneficiary.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        
        beneficiary.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Beneficiary updated successfully',
            'beneficiary': beneficiary.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@beneficiaries_bp.route('/beneficiaries/<int:beneficiary_id>', methods=['DELETE'])
@token_required
def delete_beneficiary(current_user, beneficiary_id):
    try:
        beneficiary = Beneficiary.query.filter_by(id=beneficiary_id, user_id=current_user.id).first()
        if not beneficiary:
            return jsonify({'error': 'Beneficiary not found'}), 404
        
        db.session.delete(beneficiary)
        db.session.commit()
        
        return jsonify({'message': 'Beneficiary deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@beneficiaries_bp.route('/beneficiaries/summary', methods=['GET'])
@token_required
def get_beneficiaries_summary(current_user):
    try:
        primary_beneficiaries = Beneficiary.query.filter_by(
            user_id=current_user.id, 
            is_contingent=False
        ).all()
        
        contingent_beneficiaries = Beneficiary.query.filter_by(
            user_id=current_user.id, 
            is_contingent=True
        ).all()
        
        primary_total = sum(float(b.percentage_share) for b in primary_beneficiaries)
        contingent_total = sum(float(b.percentage_share) for b in contingent_beneficiaries)
        
        return jsonify({
            'primary_beneficiaries': {
                'count': len(primary_beneficiaries),
                'total_percentage': primary_total,
                'remaining_percentage': 100 - primary_total,
                'beneficiaries': [b.to_dict() for b in primary_beneficiaries]
            },
            'contingent_beneficiaries': {
                'count': len(contingent_beneficiaries),
                'total_percentage': contingent_total,
                'remaining_percentage': 100 - contingent_total,
                'beneficiaries': [b.to_dict() for b in contingent_beneficiaries]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

