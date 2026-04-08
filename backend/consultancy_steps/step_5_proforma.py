from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date
from models.tables import Project, Invoice
from schemas.project import Step5Proforma

def process_proforma(project_id: int, payload: Step5Proforma, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can generate proforma invoice")
        
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
        HSN_SAC_Code=payload.HSN_SAC_Code,
        Taxable_Value=payload.Taxable_Value,
        Tax_Amount=payload.Tax_Amount,
        Total_Amount=payload.Taxable_Value + payload.Tax_Amount
    )
    db.add(invoice)
    
    project.Current_Status = "PROFORMA_INVOICE"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
