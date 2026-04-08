from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.tables import Project, DistributionMaster, DistributionLineItem, Receipt, Invoice
from schemas.project import Step8Distribution

def process_distribution(project_id: int, payload: Step8Distribution, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can process distribution")
        
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "COMPLETION_REPORTS":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    # Find the receipt connected to this project
    receipt = db.query(Receipt).join(Invoice).filter(Invoice.Project_ID == project_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Payment receipt not found, cannot distribute")

    total_dist_amt = float(receipt.Total_Received)
    staff_pool = total_dist_amt * 0.7
    inst_pool = total_dist_amt * 0.3

    sum_allocations = sum([float(i.Allocated_Amt) for i in payload.distributions])
    if abs(sum_allocations - total_dist_amt) > 0.01:
         raise HTTPException(status_code=400, detail=f"Allocations ({sum_allocations}) do not match total amount ({total_dist_amt})")

    master = DistributionMaster(
        Project_ID=project_id,
        Receipt_ID=receipt.Receipt_ID,
        Total_Dist_Amt=total_dist_amt,
        Staff_Pool_70=staff_pool,
        Inst_Pool_30=inst_pool,
        Approval_Status=True
    )
    db.add(master)
    db.flush()

    for item in payload.distributions:
        line_item = DistributionLineItem(
            Dist_Master_ID=master.Dist_Master_ID,
            Payee_Type=item.Payee_Type,
            Employee_ID=item.Employee_ID,
            Percentage_Rule=0.0, # optional per business logic
            Allocated_Amt=item.Allocated_Amt
        )
        db.add(line_item)

    project.Current_Status = "AMOUNT_DISTRIBUTION"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
