from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date
from models.tables import Project, Invoice, Receipt
from schemas.project import Step6TaxReceipt

def process_tax(project_id: int, payload: Step6TaxReceipt, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can log tax receipt")
        
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
        HSN_SAC_Code=proforma.HSN_SAC_Code,
        Taxable_Value=proforma.Taxable_Value,
        Tax_Amount=proforma.Tax_Amount,
        Total_Amount=proforma.Total_Amount
    )
    db.add(tax_invoice)
    db.flush() # to get tax_invoice.Invoice_ID

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
