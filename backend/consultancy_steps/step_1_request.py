from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.tables import Project
from schemas.project import ProjectCreate, ProjectResponse
from deps import get_current_user

def process_request(project_data: ProjectCreate, db: Session, current_user: dict):
    user_type = current_user["user_type"]
    user = current_user["user"]
    if user_type != "ORGANIZATION":
        raise HTTPException(status_code=403, detail="Only organizations can request projects")
    
    from models.tables import Department, Employee
    selected_dept = db.query(Department).filter(Department.Department_ID == project_data.Department_ID).first()
    if not selected_dept:
        raise HTTPException(status_code=404, detail="Selected department not found")
        
    coordinator_id = selected_dept.HOD_Employee_ID
    if not coordinator_id:
        raise HTTPException(status_code=400, detail="Selected department does not have an HOD assigned to act as interim coordinator")

    num_projects = db.query(Project).count()
    project_number = f"REQ-2026-{num_projects + 1:03d}"
    
    new_project = Project(
        Project_Number=project_number,
        Client_ID=user.Client_ID,
        Department_ID=selected_dept.Department_ID,
        Coordinator_ID=coordinator_id,
        Project_Title=project_data.Project_Title,
        Current_Status="REQUEST_BY_EXTERNAL_ORG",
        Est_Person_Days=project_data.Est_Person_Days,
        Contract_Period=project_data.Contract_Period,
        Liability_Period=project_data.Liability_Period
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project
