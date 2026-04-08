from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.tables import Project, Department, Role
from schemas.project import (
    ProjectCreate, ProjectResponse, Step2FacultyResponse, Step3AgencyAcceptance,
    Step4DirectorApproval, Step5Proforma, Step6TaxReceipt, Step7Completion,
    Step8Distribution, Step9Close
)
from deps import get_current_user

# Import step handlers
from consultancy_steps.step_1_request import process_request
from consultancy_steps.step_2_response import process_response
from consultancy_steps.step_3_acceptance import process_acceptance
from consultancy_steps.step_4_approval import process_approval
from consultancy_steps.step_5_proforma import process_proforma
from consultancy_steps.step_6_tax import process_tax
from consultancy_steps.step_7_completion import process_completion
from consultancy_steps.step_8_distribution import process_distribution
from consultancy_steps.step_9_close import process_close

router = APIRouter(prefix="/api/consultancy", tags=["consultancy"])

@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    return [{"Department_ID": d.Department_ID, "Department_Name": d.Department_Name} for d in departments]

@router.get("/roles")
def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    return [{"Role_ID": r.Role_ID, "Role_Name": r.Role_Name} for r in roles]

@router.get("/employees")
def get_employees(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from models.tables import Employee
    employees = db.query(Employee).all()
    return [{"Employee_ID": e.Employee_ID, "Full_Name": e.Full_Name, "Designation": e.Designation} for e in employees]

@router.get("/projects", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    user_type = current_user["user_type"]
    if user_type == "COLLEGE_OFFICIAL":
        projects = db.query(Project).all()
    else:
        projects = db.query(Project).filter(Project.Client_ID == user.Client_ID).all()
    return projects

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/request")
def step1_request(project_data: ProjectCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_request(project_data, db, current_user)

@router.post("/{project_id}/faculty-response")
def step2_faculty_response(project_id: int, payload: Step2FacultyResponse, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_response(project_id, payload, db, current_user)

@router.post("/{project_id}/agency-acceptance")
def step3_agency_acceptance(project_id: int, payload: Step3AgencyAcceptance, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_acceptance(project_id, payload, db, current_user)

@router.post("/{project_id}/director-approval")
def step4_director_approval(project_id: int, payload: Step4DirectorApproval, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_approval(project_id, payload, db, current_user)

@router.post("/{project_id}/proforma-invoice")
def step5_proforma(project_id: int, payload: Step5Proforma, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_proforma(project_id, payload, db, current_user)

@router.post("/{project_id}/tax-invoice-receipt")
def step6_tax_receipt(project_id: int, payload: Step6TaxReceipt, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_tax(project_id, payload, db, current_user)

@router.post("/{project_id}/completion-report")
def step7_completion_report(project_id: int, payload: Step7Completion, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_completion(project_id, payload, db, current_user)

@router.post("/{project_id}/distribution")
def step8_distribution(project_id: int, payload: Step8Distribution, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_distribution(project_id, payload, db, current_user)

@router.post("/{project_id}/close")
def step9_closing(project_id: int, payload: Step9Close, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return process_close(project_id, payload, db, current_user)
