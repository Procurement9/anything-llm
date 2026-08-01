from flask import Blueprint, request, jsonify
from src.models.estate import db, Asset, Liability
from src.routes.auth import token_required
from datetime import datetime
import json

assets_bp = Blueprint('assets', __name__)

@assets_bp.route('/assets', methods=['GET'])
@token_required
def get_assets(current_user):
    try:
        assets = Asset.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            'assets': [asset.to_dict() for asset in assets]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assets_bp.route('/assets', methods=['POST'])
@token_required
def create_asset(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['asset_type', 'description', 'current_value']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        asset = Asset(
            user_id=current_user.id,
            asset_type=data['asset_type'],
            description=data['description'],
            current_value=data['current_value'],
            acquisition_cost=data.get('acquisition_cost'),
            location=data.get('location'),
            ownership_type=data.get('ownership_type'),
            additional_details=json.dumps(data.get('additional_details', {}))
        )
        
        # Parse acquisition_date if provided
        if data.get('acquisition_date'):
            asset.acquisition_date = datetime.strptime(data['acquisition_date'], '%Y-%m-%d').date()
        
        db.session.add(asset)
        db.session.commit()
        
        return jsonify({
            'message': 'Asset created successfully',
            'asset': asset.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@assets_bp.route('/assets/<int:asset_id>', methods=['PUT'])
@token_required
def update_asset(current_user, asset_id):
    try:
        asset = Asset.query.filter_by(id=asset_id, user_id=current_user.id).first()
        if not asset:
            return jsonify({'error': 'Asset not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['asset_type', 'description', 'current_value', 'acquisition_cost', 
                         'location', 'ownership_type']
        for field in allowed_fields:
            if field in data:
                setattr(asset, field, data[field])
        
        if 'acquisition_date' in data and data['acquisition_date']:
            asset.acquisition_date = datetime.strptime(data['acquisition_date'], '%Y-%m-%d').date()
        
        if 'additional_details' in data:
            asset.additional_details = json.dumps(data['additional_details'])
        
        asset.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Asset updated successfully',
            'asset': asset.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@assets_bp.route('/assets/<int:asset_id>', methods=['DELETE'])
@token_required
def delete_asset(current_user, asset_id):
    try:
        asset = Asset.query.filter_by(id=asset_id, user_id=current_user.id).first()
        if not asset:
            return jsonify({'error': 'Asset not found'}), 404
        
        db.session.delete(asset)
        db.session.commit()
        
        return jsonify({'message': 'Asset deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@assets_bp.route('/liabilities', methods=['GET'])
@token_required
def get_liabilities(current_user):
    try:
        liabilities = Liability.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            'liabilities': [liability.to_dict() for liability in liabilities]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assets_bp.route('/liabilities', methods=['POST'])
@token_required
def create_liability(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['liability_type', 'description', 'current_balance']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        liability = Liability(
            user_id=current_user.id,
            liability_type=data['liability_type'],
            description=data['description'],
            current_balance=data['current_balance'],
            interest_rate=data.get('interest_rate'),
            monthly_payment=data.get('monthly_payment'),
            creditor_name=data.get('creditor_name')
        )
        
        # Parse maturity_date if provided
        if data.get('maturity_date'):
            liability.maturity_date = datetime.strptime(data['maturity_date'], '%Y-%m-%d').date()
        
        db.session.add(liability)
        db.session.commit()
        
        return jsonify({
            'message': 'Liability created successfully',
            'liability': liability.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@assets_bp.route('/liabilities/<int:liability_id>', methods=['PUT'])
@token_required
def update_liability(current_user, liability_id):
    try:
        liability = Liability.query.filter_by(id=liability_id, user_id=current_user.id).first()
        if not liability:
            return jsonify({'error': 'Liability not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['liability_type', 'description', 'current_balance', 'interest_rate',
                         'monthly_payment', 'creditor_name']
        for field in allowed_fields:
            if field in data:
                setattr(liability, field, data[field])
        
        if 'maturity_date' in data and data['maturity_date']:
            liability.maturity_date = datetime.strptime(data['maturity_date'], '%Y-%m-%d').date()
        
        liability.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Liability updated successfully',
            'liability': liability.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@assets_bp.route('/liabilities/<int:liability_id>', methods=['DELETE'])
@token_required
def delete_liability(current_user, liability_id):
    try:
        liability = Liability.query.filter_by(id=liability_id, user_id=current_user.id).first()
        if not liability:
            return jsonify({'error': 'Liability not found'}), 404
        
        db.session.delete(liability)
        db.session.commit()
        
        return jsonify({'message': 'Liability deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@assets_bp.route('/net-worth', methods=['GET'])
@token_required
def get_net_worth(current_user):
    try:
        # Calculate total assets
        assets = Asset.query.filter_by(user_id=current_user.id).all()
        total_assets = sum(float(asset.current_value) for asset in assets)
        
        # Calculate total liabilities
        liabilities = Liability.query.filter_by(user_id=current_user.id).all()
        total_liabilities = sum(float(liability.current_balance) for liability in liabilities)
        
        net_worth = total_assets - total_liabilities
        
        return jsonify({
            'total_assets': total_assets,
            'total_liabilities': total_liabilities,
            'net_worth': net_worth,
            'asset_breakdown': {
                asset.asset_type: sum(float(a.current_value) for a in assets if a.asset_type == asset.asset_type)
                for asset in assets
            },
            'liability_breakdown': {
                liability.liability_type: sum(float(l.current_balance) for l in liabilities if l.liability_type == liability.liability_type)
                for liability in liabilities
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

