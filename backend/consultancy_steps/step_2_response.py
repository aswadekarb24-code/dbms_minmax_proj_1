from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.tables import Project, BudgetEstimation
from schemas.project import Step2FacultyResponse
from deps import get_current_user

def process_response(project_id: int, payload: Step2FacultyResponse, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    if user_type != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can respond to requests")
        
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "REQUEST_BY_EXTERNAL_ORG":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    cost_of_work = payload.Est_Faculty_Fees + payload.Est_External_Fees + payload.Operational_Exp

    project.Coordinator_ID = payload.Coordinator_ID
    project.Department_ID = current_user["user"].Department_ID # Updating the dummy department to actual
    project.Proposed_Fee_Pct = payload.Proposed_Fee_Pct
    project.Cost_Of_Work = cost_of_work
    project.Current_Status = "RESPONSE_BY_FACULTY"

    budget = BudgetEstimation(
        Project_ID=project_id,
        Faculty_Fees=payload.Est_Faculty_Fees,
        External_Fees=payload.Est_External_Fees,
        Operational_Exp=payload.Operational_Exp,
        Net_Project_Cost=cost_of_work,
        Institute_Share=cost_of_work * 0.3,
        Total_Project_Cost=cost_of_work
    )
    db.add(budget)
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
