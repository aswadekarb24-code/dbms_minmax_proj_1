from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from core.database import get_db
from models.tables import Employee, Department, Role
from core.security import hash_password
from deps import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])

class DirectorCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    designation: str

class DepartmentBundleCreate(BaseModel):
    department_name: str
    hod_name: str
    hod_email: EmailStr
    hod_password: str
    hod_designation: str
    coord_name: str
    coord_email: EmailStr
    coord_password: str
    coord_designation: str

@router.post("/director")
def add_director(data: DirectorCreate, db: Session = Depends(get_db)):
    # Create or get Administration department
    admin_dept = db.query(Department).filter(Department.Department_Name == "Administration").first()
    if not admin_dept:
        admin_dept = Department(Department_Name="Administration")
        db.add(admin_dept)
        db.commit()
        db.refresh(admin_dept)
    
    # Check if Director already exists
    director_role = db.query(Role).filter(Role.Role_Name == "DIRECTOR").first()
    if not director_role:
        raise HTTPException(status_code=500, detail="DIRECTOR role missing in database")
        
    existing_director = db.query(Employee).filter(Employee.Role_ID == director_role.Role_ID).first()
    if existing_director:
        raise HTTPException(status_code=400, detail="A Director already exists.")
        
    if db.query(Employee).filter(Employee.Email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already taken.")

    new_emp = Employee(
        Department_ID=admin_dept.Department_ID,
        Role_ID=director_role.Role_ID,
        Full_Name=data.name,
        Designation=data.designation,
        Email=data.email,
        Auth_Hash=hash_password(data.password)
    )
    db.add(new_emp)
    db.commit()
    return {"message": "Director added successfully"}

@router.post("/department-bundle")
def add_department_bundle(data: DepartmentBundleCreate, db: Session = Depends(get_db)):
    if data.department_name.lower() == "administration":
        raise HTTPException(status_code=400, detail="Cannot create 'Administration' department. Reserved for Director.")
        
    if db.query(Department).filter(Department.Department_Name == data.department_name).first():
        raise HTTPException(status_code=400, detail="Department already exists.")
        
    if db.query(Employee).filter(Employee.Email.in_([data.hod_email, data.coord_email])).first():
        raise HTTPException(status_code=400, detail="One of the provided emails is already taken.")
        
    hod_role = db.query(Role).filter(Role.Role_Name == "HOD").first()
    coord_role = db.query(Role).filter(Role.Role_Name == "PROJECT_COORDINATOR").first()

    # 1. Create Department
    new_dept = Department(Department_Name=data.department_name)
    db.add(new_dept)
    db.flush() # flush to get Dept ID
    
    # 2. Create HOD
    hod_emp = Employee(
        Department_ID=new_dept.Department_ID,
        Role_ID=hod_role.Role_ID,
        Full_Name=data.hod_name,
        Designation=data.hod_designation,
        Email=data.hod_email,
        Auth_Hash=hash_password(data.hod_password)
    )
    db.add(hod_emp)
    db.flush()
    
    # Update Dept with HOD id
    new_dept.HOD_Employee_ID = hod_emp.Employee_ID
    
    # 3. Create Coordinator
    coord_emp = Employee(
        Department_ID=new_dept.Department_ID,
        Role_ID=coord_role.Role_ID,
        Full_Name=data.coord_name,
        Designation=data.coord_designation,
        Email=data.coord_email,
        Auth_Hash=hash_password(data.coord_password)
    )
    db.add(coord_emp)
    
    db.commit()
    return {"message": "Department bundle fully curated."}
