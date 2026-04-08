from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.tables import Project
from schemas.project import Step3AgencyAcceptance

def process_acceptance(project_id: int, payload: Step3AgencyAcceptance, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "ORGANIZATION":
        raise HTTPException(status_code=403, detail="Only organizations can accept fees")
        
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "RESPONSE_BY_FACULTY":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    if not payload.accepted:
        raise HTTPException(status_code=400, detail="Must accept terms to proceed")

    project.Current_Status = "AGENCY_ACCEPTANCE"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
