from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date
from models.tables import Project, Invoice
from schemas.project import Step5Proforma

def process_proforma(project_id: int, payload: Step5Proforma, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can generate proforma invoice")

    # Input sanitization
    if payload.Taxable_Value < 0:
        raise HTTPException(status_code=400, detail="Taxable value cannot be negative")
    if payload.Tax_Amount < 0:
        raise HTTPException(status_code=400, detail="Tax amount cannot be negative")

    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "DIRECTOR_APPROVAL":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    invoice = Invoice(
        Project_ID=project_id,
        Invoice_Type="PROFORMA",
        Invoice_Number=f"PI-{date.today().year}-{project_id}",
        Invoice_Date=date.today(),
        Buyer_Order_No=f"BO-{project_id}",
        Destination="VJTI, Matunga, Mumbai-400019",
        Payment_Terms="Due on Receipt",
        HSN_SAC_Code=payload.HSN_SAC_Code,
        Taxable_Value=payload.Taxable_Value,
        Tax_Amount=payload.Tax_Amount,
        Total_Amount=payload.Taxable_Value + payload.Tax_Amount,
        Inst_PAN="AAATV0127F",
        Bank_Account_No="VJTI-ACC-001",
    )
    db.add(invoice)
    
    project.Current_Status = "PROFORMA_INVOICE"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
