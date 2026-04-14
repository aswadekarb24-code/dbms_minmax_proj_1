from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date
from models.tables import Project, Invoice, Receipt
from schemas.project import Step6TaxReceipt

def process_tax(project_id: int, payload: Step6TaxReceipt, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can log tax receipt")

    # Input sanitization
    if payload.Total_Received <= 0:
        raise HTTPException(status_code=400, detail="Total received must be greater than zero")
    if payload.TDS_Deducted < 0:
        raise HTTPException(status_code=400, detail="TDS deducted cannot be negative")
    if payload.TDS_Deducted > payload.Total_Received:
        raise HTTPException(status_code=400, detail="TDS deducted cannot exceed total received")

    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "PROFORMA_INVOICE":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    # The original flow needs a tax invoice and a receipt. Let's create the tax invoice first from the proforma.
    proforma = db.query(Invoice).filter(Invoice.Project_ID == project_id, Invoice.Invoice_Type == "PROFORMA").first()
    if not proforma:
        raise HTTPException(status_code=404, detail="Proforma invoice not found")

    tax_invoice = Invoice(
        Project_ID=project_id,
        Invoice_Type="TAX_INVOICE",
        Invoice_Number=f"TI-{date.today().year}-{project_id}",
        Invoice_Date=date.today(),
        Buyer_Order_No=proforma.Buyer_Order_No or f"BO-{project_id}",
        Destination=proforma.Destination or "VJTI, Matunga, Mumbai-400019",
        Payment_Terms=proforma.Payment_Terms or "Due on Receipt",
        HSN_SAC_Code=proforma.HSN_SAC_Code,
        Taxable_Value=proforma.Taxable_Value,
        Tax_Amount=proforma.Tax_Amount,
        Total_Amount=proforma.Total_Amount,
        Inst_PAN=proforma.Inst_PAN or "AAATV0127F",
        Bank_Account_No=proforma.Bank_Account_No or "VJTI-ACC-001",
    )
    db.add(tax_invoice)
    db.flush()  # to get tax_invoice.Invoice_ID

    receipt = Receipt(
        Invoice_ID=tax_invoice.Invoice_ID,
        Voucher_Number=payload.Voucher_Number,
        Receipt_Date=payload.Receipt_Date,
        Total_Received=payload.Total_Received,
        TDS_Deducted=payload.TDS_Deducted,
        Trans_Mode="BANK",
        Bank_Trans_Ref=payload.Bank_Trans_Ref
    )
    db.add(receipt)
    
    project.Current_Status = "TAX_INVOICE_AND_RECEIPT"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
