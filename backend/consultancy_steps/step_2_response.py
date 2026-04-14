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

    # Input sanitization
    if payload.Est_Faculty_Fees < 0 or payload.Est_External_Fees < 0 or payload.Operational_Exp < 0:
        raise HTTPException(status_code=400, detail="Fee values cannot be negative")
    if not (0 <= payload.Proposed_Fee_Pct <= 100):
        raise HTTPException(status_code=400, detail="Proposed fee percentage must be between 0 and 100")

    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.Current_Status != "REQUEST_BY_EXTERNAL_ORG":
        raise HTTPException(status_code=400, detail="Invalid project status for this action")

    cost_of_work = payload.Est_Faculty_Fees + payload.Est_External_Fees + payload.Operational_Exp

    project.Coordinator_ID = payload.Coordinator_ID
    project.Department_ID = current_user["user"].Department_ID
    project.Proposed_Fee_Pct = payload.Proposed_Fee_Pct
    project.Cost_Of_Work = cost_of_work
    project.Current_Status = "RESPONSE_BY_FACULTY"
    # Fill Est_Site_Visits from person days if available
    if project.Est_Person_Days and project.Est_Person_Days > 0:
        project.Est_Site_Visits = max(1, project.Est_Person_Days // 5)

    institute_share = cost_of_work * 0.3
    cpts_charges = cost_of_work * 0.02  # 2% institutional charge
    office_share = institute_share

    budget = BudgetEstimation(
        Project_ID=project_id,
        Faculty_Fees=payload.Est_Faculty_Fees,
        External_Fees=payload.Est_External_Fees,
        Operational_Exp=payload.Operational_Exp,
        CPTS_Charges=cpts_charges,
        Capital_Equip=0.00,
        CNL_Expenses=0.00,
        Office_Share_Amt=office_share,
        Net_Project_Cost=cost_of_work,
        Institute_Share=institute_share,
        Total_Project_Cost=cost_of_work,
    )
    db.add(budget)
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
