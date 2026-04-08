from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.tables import Project
from schemas.project import Step7Completion

def process_completion(project_id: int, payload: Step7Completion, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can log completion reports")
        
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "TAX_INVOICE_AND_RECEIPT":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    # Future integration: actual file upload logic would populate physical progress here
    project.Physical_Progress = "Completed - Report sent"
    project.Current_Status = "COMPLETION_REPORTS"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
