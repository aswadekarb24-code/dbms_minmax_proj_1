from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.tables import Project, BudgetEstimation, Invoice, Receipt, DistributionMaster, Department, Role
from schemas.project import ProjectCreate, ProjectResponse
from deps import get_current_user

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
    user_type = current_user["user_type"]
    user = current_user["user"]
    if user_type != "ORGANIZATION":
        raise HTTPException(status_code=403, detail="Only organizations can request projects")
    
    # Needs a unique project number
    num_projects = db.query(Project).count()
    project_number = f"REQ-2026-{num_projects + 1:03d}"
    
    new_project = Project(
        Project_Number=project_number,
        Client_ID=user.Client_ID,
        Department_ID=1, # Default or chosen by UI
        Coordinator_ID=1, # Placeholder ID
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

@router.post("/{project_id}/faculty-response")
def step2_faculty_response(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # ... placeholder for step 2 ...
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    project.Current_Status = "AGENCY_ACCEPTANCE"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}

@router.post("/{project_id}/agency-acceptance")
def step3_agency_acceptance(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    project.Current_Status = "DIRECTOR_APPROVAL"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}

@router.post("/{project_id}/director-approval")
def step4_director_approval(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    project.Current_Status = "PROFORMA_INVOICE"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}

@router.post("/{project_id}/proforma-invoice")
def step5_proforma(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    project.Current_Status = "TAX_INVOICE_AND_RECEIPT"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}

@router.post("/{project_id}/tax-invoice-receipt")
def step6_tax_receipt(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    project.Current_Status = "COMPLETION_REPORTS"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}

@router.post("/{project_id}/completion-report")
def step7_completion_report(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    project.Current_Status = "AMOUNT_DISTRIBUTION"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}

@router.post("/{project_id}/distribution")
def step8_distribution(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    project.Current_Status = "CLOSED"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}

@router.post("/{project_id}/close")
def step9_closing(project_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.query(Project).filter(Project.Project_ID == project_id).first()
    project.Current_Status = "CLOSED"
    db.commit()
    return {"status": "success", "project_status": project.Current_Status}
