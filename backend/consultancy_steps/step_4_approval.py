from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.tables import Project, BudgetEstimation
from schemas.project import Step4DirectorApproval

def process_approval(project_id: int, payload: Step4DirectorApproval, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    user = current_user["user"]
    user_role = user.role.Role_Name if hasattr(user, 'role') and user.role else None
    
    if user_type != "COLLEGE_OFFICIAL" or user_role != "DIRECTOR":
        raise HTTPException(status_code=403, detail="Only Director can grant approval")
        
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "AGENCY_ACCEPTANCE":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    if not payload.approved:
        raise HTTPException(status_code=400, detail="Must approve to proceed")

    budget = db.query(BudgetEstimation).filter(BudgetEstimation.Project_ID == project_id).first()
    if budget:
        budget.Director_Approval = True

    project.Current_Status = "DIRECTOR_APPROVAL"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
