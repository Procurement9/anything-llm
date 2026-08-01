from flask import Blueprint, request, jsonify, send_file
from datetime import datetime
import os
import tempfile
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from src.models.estate import db, User, Asset, Liability, Beneficiary

documents_bp = Blueprint('documents', __name__)

@documents_bp.route('/documents/will', methods=['POST'])
def generate_will():
    """Generate a basic will document"""
    try:
        data = request.get_json()
        user_id = 1  # In a real app, get from JWT token
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        doc = SimpleDocTemplate(temp_file.name, pagesize=letter)
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        # Content
        story = []
        
        # Title
        story.append(Paragraph("LAST WILL AND TESTAMENT", title_style))
        story.append(Spacer(1, 20))
        
        # Testator information
        story.append(Paragraph(f"I, {user.first_name} {user.last_name}, of {user.address or '[Address]'}, being of sound mind and disposing memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils made by me.", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Article I - Funeral and Burial
        story.append(Paragraph("ARTICLE I - FUNERAL AND BURIAL", styles['Heading2']))
        story.append(Paragraph("I direct that my remains be disposed of in the following manner: [To be specified by testator]", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Article II - Payment of Debts
        story.append(Paragraph("ARTICLE II - PAYMENT OF DEBTS", styles['Heading2']))
        story.append(Paragraph("I direct my Executor to pay all of my just debts, funeral expenses, and the expenses of administering my estate.", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Article III - Specific Bequests
        story.append(Paragraph("ARTICLE III - SPECIFIC BEQUESTS", styles['Heading2']))
        
        # Get beneficiaries
        beneficiaries = Beneficiary.query.filter_by(user_id=user_id).all()
        if beneficiaries:
            for beneficiary in beneficiaries:
                story.append(Paragraph(f"I give and bequeath to {beneficiary.first_name} {beneficiary.last_name} ({beneficiary.relationship}), {beneficiary.percentage}% of my estate.", styles['Normal']))
        else:
            story.append(Paragraph("[Specific bequests to be added]", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Article IV - Residuary Estate
        story.append(Paragraph("ARTICLE IV - RESIDUARY ESTATE", styles['Heading2']))
        story.append(Paragraph("All the rest, residue, and remainder of my estate, both real and personal, of every kind and description, I give, devise, and bequeath to my beneficiaries as specified above.", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Article V - Executor
        story.append(Paragraph("ARTICLE V - EXECUTOR", styles['Heading2']))
        story.append(Paragraph("I hereby nominate and appoint [Executor Name] as the Executor of this Will. If [Executor Name] is unable or unwilling to serve, I nominate [Alternate Executor] as alternate Executor.", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Signature section
        story.append(Spacer(1, 30))
        story.append(Paragraph("IN WITNESS WHEREOF, I have hereunto set my hand this _____ day of __________, 2025.", styles['Normal']))
        story.append(Spacer(1, 30))
        story.append(Paragraph("_________________________", styles['Normal']))
        story.append(Paragraph(f"{user.first_name} {user.last_name}, Testator", styles['Normal']))
        
        # Witness section
        story.append(Spacer(1, 30))
        story.append(Paragraph("WITNESSES:", styles['Heading3']))
        story.append(Paragraph("The foregoing instrument was signed by the Testator in our presence, and we, at the Testator's request and in the Testator's presence, and in the presence of each other, have subscribed our names as witnesses.", styles['Normal']))
        story.append(Spacer(1, 20))
        
        for i in range(2):
            story.append(Paragraph(f"Witness {i+1}:", styles['Normal']))
            story.append(Paragraph("_________________________", styles['Normal']))
            story.append(Paragraph("Signature", styles['Normal']))
            story.append(Spacer(1, 10))
            story.append(Paragraph("_________________________", styles['Normal']))
            story.append(Paragraph("Print Name", styles['Normal']))
            story.append(Spacer(1, 10))
            story.append(Paragraph("_________________________", styles['Normal']))
            story.append(Paragraph("Address", styles['Normal']))
            story.append(Spacer(1, 20))
        
        # Build PDF
        doc.build(story)
        temp_file.close()
        
        return send_file(temp_file.name, as_attachment=True, download_name=f'will_{user.first_name}_{user.last_name}.pdf', mimetype='application/pdf')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/documents/net-worth-statement', methods=['POST'])
def generate_net_worth_statement():
    """Generate a net worth statement report"""
    try:
        user_id = 1  # In a real app, get from JWT token
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        assets = Asset.query.filter_by(user_id=user_id).all()
        liabilities = Liability.query.filter_by(user_id=user_id).all()
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        doc = SimpleDocTemplate(temp_file.name, pagesize=letter)
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1
        )
        
        story = []
        
        # Title
        story.append(Paragraph("NET WORTH STATEMENT", title_style))
        story.append(Paragraph(f"Prepared for: {user.first_name} {user.last_name}", styles['Normal']))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        story.append(Spacer(1, 30))
        
        # Assets section
        story.append(Paragraph("ASSETS", styles['Heading2']))
        
        if assets:
            asset_data = [['Description', 'Type', 'Current Value']]
            total_assets = 0
            
            for asset in assets:
                asset_data.append([
                    asset.description,
                    asset.asset_type.replace('_', ' ').title(),
                    f"${asset.current_value:,.2f}"
                ])
                total_assets += asset.current_value
            
            asset_data.append(['', 'TOTAL ASSETS', f"${total_assets:,.2f}"])
            
            asset_table = Table(asset_data, colWidths=[3*inch, 2*inch, 1.5*inch])
            asset_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(asset_table)
        else:
            story.append(Paragraph("No assets recorded.", styles['Normal']))
            total_assets = 0
        
        story.append(Spacer(1, 30))
        
        # Liabilities section
        story.append(Paragraph("LIABILITIES", styles['Heading2']))
        
        if liabilities:
            liability_data = [['Description', 'Type', 'Current Balance']]
            total_liabilities = 0
            
            for liability in liabilities:
                liability_data.append([
                    liability.description,
                    liability.liability_type.replace('_', ' ').title(),
                    f"${liability.current_balance:,.2f}"
                ])
                total_liabilities += liability.current_balance
            
            liability_data.append(['', 'TOTAL LIABILITIES', f"${total_liabilities:,.2f}"])
            
            liability_table = Table(liability_data, colWidths=[3*inch, 2*inch, 1.5*inch])
            liability_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(liability_table)
        else:
            story.append(Paragraph("No liabilities recorded.", styles['Normal']))
            total_liabilities = 0
        
        story.append(Spacer(1, 30))
        
        # Net Worth Summary
        net_worth = total_assets - total_liabilities
        
        summary_data = [
            ['Total Assets', f"${total_assets:,.2f}"],
            ['Total Liabilities', f"${total_liabilities:,.2f}"],
            ['NET WORTH', f"${net_worth:,.2f}"]
        ]
        
        summary_table = Table(summary_data, colWidths=[4*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 14),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(Paragraph("NET WORTH SUMMARY", styles['Heading2']))
        story.append(summary_table)
        
        # Build PDF
        doc.build(story)
        temp_file.close()
        
        return send_file(temp_file.name, as_attachment=True, download_name=f'net_worth_statement_{user.first_name}_{user.last_name}.pdf', mimetype='application/pdf')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/documents/tax-summary', methods=['POST'])
def generate_tax_summary():
    """Generate a tax summary report"""
    try:
        from src.models.estate import TaxCalculation
        
        user_id = 1  # In a real app, get from JWT token
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the most recent tax calculation
        tax_calculation = TaxCalculation.query.filter_by(user_id=user_id).order_by(TaxCalculation.created_at.desc()).first()
        
        if not tax_calculation:
            return jsonify({'error': 'No tax calculations found'}), 404
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        doc = SimpleDocTemplate(temp_file.name, pagesize=letter)
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1
        )
        
        story = []
        
        # Title
        story.append(Paragraph("ESTATE TAX SUMMARY", title_style))
        story.append(Paragraph(f"Prepared for: {user.first_name} {user.last_name}", styles['Normal']))
        story.append(Paragraph(f"Tax Year: {tax_calculation.tax_year}", styles['Normal']))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        story.append(Spacer(1, 30))
        
        # Tax Calculation Summary
        story.append(Paragraph("TAX CALCULATION SUMMARY", styles['Heading2']))
        
        tax_data = [
            ['Gross Estate Value', f"${tax_calculation.gross_estate_value:,.2f}"],
            ['Funeral Expenses', f"${tax_calculation.funeral_expenses:,.2f}"],
            ['Administration Expenses', f"${tax_calculation.administration_expenses:,.2f}"],
            ['Charitable Deductions', f"${tax_calculation.charitable_deductions:,.2f}"],
            ['Marital Deductions', f"${tax_calculation.marital_deductions:,.2f}"],
            ['Total Deductions', f"${tax_calculation.total_deductions:,.2f}"],
            ['Taxable Estate', f"${tax_calculation.taxable_estate:,.2f}"],
            ['Federal Estate Tax Liability', f"${tax_calculation.estate_tax_liability:,.2f}"]
        ]
        
        tax_table = Table(tax_data, colWidths=[4*inch, 2*inch])
        tax_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightcoral if tax_calculation.estate_tax_liability > 0 else colors.lightgreen),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(tax_table)
        story.append(Spacer(1, 30))
        
        # Tax Planning Notes
        story.append(Paragraph("TAX PLANNING NOTES", styles['Heading2']))
        
        if tax_calculation.estate_tax_liability > 0:
            story.append(Paragraph("⚠️ Your estate may be subject to federal estate tax. Consider the following strategies:", styles['Normal']))
            story.append(Paragraph("• Annual gift tax exclusions to reduce estate size", styles['Normal']))
            story.append(Paragraph("• Charitable giving strategies", styles['Normal']))
            story.append(Paragraph("• Trust structures for tax efficiency", styles['Normal']))
            story.append(Paragraph("• Life insurance planning", styles['Normal']))
        else:
            story.append(Paragraph("✅ Your estate is currently below the federal exemption limit.", styles['Normal']))
            story.append(Paragraph("Continue monitoring as your estate grows and tax laws change.", styles['Normal']))
        
        story.append(Spacer(1, 20))
        story.append(Paragraph("Consult with a qualified estate planning attorney and tax professional for personalized advice.", styles['Italic']))
        
        # Build PDF
        doc.build(story)
        temp_file.close()
        
        return send_file(temp_file.name, as_attachment=True, download_name=f'tax_summary_{user.first_name}_{user.last_name}.pdf', mimetype='application/pdf')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/documents/list', methods=['GET'])
def list_available_documents():
    """List available document types"""
    documents = [
        {
            'type': 'will',
            'name': 'Last Will and Testament',
            'description': 'Basic will document template'
        },
        {
            'type': 'net_worth_statement',
            'name': 'Net Worth Statement',
            'description': 'Comprehensive asset and liability report'
        },
        {
            'type': 'tax_summary',
            'name': 'Estate Tax Summary',
            'description': 'Tax calculation summary and planning notes'
        }
    ]
    
    return jsonify({'documents': documents})

