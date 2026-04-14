"""
Step Revert Logic — allows faculty to undo the most recent workflow step.
Maps each status to the previous status and the cleanup actions needed.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.tables import (
    Project, BudgetEstimation, Invoice, Receipt,
    DistributionMaster, DistributionLineItem, Employee
)

# Ordered status flow
STATUS_ORDER = [
    "REQUEST_BY_EXTERNAL_ORG",
    "RESPONSE_BY_FACULTY",
    "AGENCY_ACCEPTANCE",
    "DIRECTOR_APPROVAL",
    "PROFORMA_INVOICE",
    "TAX_INVOICE_AND_RECEIPT",
    "COMPLETION_REPORTS",
    "AMOUNT_DISTRIBUTION",
    "CLOSED",
]

def process_revert(project_id: int, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can revert steps")

    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    current_status = project.Current_Status
    if current_status not in STATUS_ORDER:
        raise HTTPException(status_code=400, detail="Unknown project status")

    current_idx = STATUS_ORDER.index(current_status)
    if current_idx == 0:
        raise HTTPException(status_code=400, detail="Cannot revert the initial request step")

    prev_status = STATUS_ORDER[current_idx - 1]

    # Cleanup artifacts created by the current step
    _cleanup_step(current_status, project_id, project, db)

    project.Current_Status = prev_status
    db.commit()
    return {"status": "success", "reverted_to": prev_status, "project_status": prev_status}


def _cleanup_step(status: str, project_id: int, project: Project, db: Session):
    """Remove DB records created by the given step."""

    if status == "RESPONSE_BY_FACULTY":
        # Step 2 created a BudgetEstimation
        db.query(BudgetEstimation).filter(BudgetEstimation.Project_ID == project_id).delete()
        project.Proposed_Fee_Pct = None
        project.Cost_Of_Work = 0.00
        project.Est_Site_Visits = None

    elif status == "AGENCY_ACCEPTANCE":
        # Step 3 only changed status — no artifacts to clean
        pass

    elif status == "DIRECTOR_APPROVAL":
        # Step 4 set Director_Approval = True on budget
        budget = db.query(BudgetEstimation).filter(BudgetEstimation.Project_ID == project_id).first()
        if budget:
            budget.Director_Approval = False

    elif status == "PROFORMA_INVOICE":
        # Step 5 created a PROFORMA invoice
        db.query(Invoice).filter(
            Invoice.Project_ID == project_id,
            Invoice.Invoice_Type == "PROFORMA"
        ).delete()

    elif status == "TAX_INVOICE_AND_RECEIPT":
        # Step 6 created a TAX_INVOICE + Receipt
        tax_inv = db.query(Invoice).filter(
            Invoice.Project_ID == project_id,
            Invoice.Invoice_Type == "TAX_INVOICE"
        ).first()
        if tax_inv:
            db.query(Receipt).filter(Receipt.Invoice_ID == tax_inv.Invoice_ID).delete()
            db.delete(tax_inv)

    elif status == "COMPLETION_REPORTS":
        # Step 7 set Physical_Progress
        project.Physical_Progress = None

    elif status == "AMOUNT_DISTRIBUTION":
        # Step 8 created DistributionMaster + LineItems, and may have updated PDF_Balance
        masters = db.query(DistributionMaster).filter(DistributionMaster.Project_ID == project_id).all()
        for master in masters:
            # Reverse any PDF_Balance changes
            pdf_items = db.query(DistributionLineItem).filter(
                DistributionLineItem.Dist_Master_ID == master.Dist_Master_ID,
                DistributionLineItem.Payee_Type == "PDF"
            ).all()
            for pdf_item in pdf_items:
                coordinator = db.query(Employee).filter(Employee.Employee_ID == project.Coordinator_ID).first()
                if coordinator:
                    pdf_decrement = round(float(pdf_item.Allocated_Amt) * 0.10, 2)
                    coordinator.PDF_Balance = max(0, float(coordinator.PDF_Balance or 0) - pdf_decrement)

            db.query(DistributionLineItem).filter(
                DistributionLineItem.Dist_Master_ID == master.Dist_Master_ID
            ).delete()
            db.delete(master)

    elif status == "CLOSED":
        # Step 9 only changed status — no artifacts to clean
        pass
