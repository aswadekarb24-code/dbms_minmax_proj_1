from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.tables import Project
from schemas.project import Step9Close

def process_close(project_id: int, payload: Step9Close, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can close the project")
        
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "AMOUNT_DISTRIBUTION":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    project.Current_Status = "CLOSED"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
