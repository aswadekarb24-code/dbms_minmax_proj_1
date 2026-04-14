from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from core.database import get_db
from core.security import hash_password, verify_password, create_access_token
from models.tables import Employee, Client, Role
from schemas.auth import FacultySignup, ClientSignup, LoginRequest, Token, EmployeeResponse, ClientResponse, FacultySettingsUpdate
from deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup/faculty", response_model=Token)
def signup_faculty(user: FacultySignup, db: Session = Depends(get_db)):
    db_user = db.query(Employee).filter(Employee.Email == user.email).first()
    if db_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    new_employee = Employee(
        Full_Name=user.full_name,
        Email=user.email,
        Auth_Hash=hashed_password,
        Department_ID=user.department_id,
        Role_ID=user.role_id,
        Designation=user.designation,
        Profile_URL=user.profile_url
    )
    db.add(new_employee)
    try:
        db.commit()
        db.refresh(new_employee)
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Database error")
    
    access_token = create_access_token(subject=new_employee.Employee_ID, user_type="COLLEGE_OFFICIAL")
    return {"access_token": access_token, "token_type": "bearer", "user_type": "COLLEGE_OFFICIAL"}

@router.post("/signup/client", response_model=Token)
def signup_client(user: ClientSignup, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.Contact_Email == user.contact_email).first()
    if db_client:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = hash_password(user.password)
    new_client = Client(
        Organization_Name=user.organization_name,
        Contact_Person_Name=user.contact_person_name,
        Contact_Number=user.contact_number,
        Contact_Email=user.contact_email,
        Auth_Hash=hashed_password,
        State_Name=user.state_name,
        State_Code=user.state_code,
        Office_Address=user.office_address,
        GSTIN_UIN=user.gstin_uin
    )
    db.add(new_client)
    try:
        db.commit()
        db.refresh(new_client)
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    
    access_token = create_access_token(subject=new_client.Client_ID, user_type="ORGANIZATION")
    return {"access_token": access_token, "token_type": "bearer", "user_type": "ORGANIZATION"}

@router.post("/login/faculty", response_model=dict)
def login_faculty(request: LoginRequest, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.Email == request.email).first()
    if not employee:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(request.password, employee.Auth_Hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    access_token = create_access_token(subject=employee.Employee_ID, user_type="COLLEGE_OFFICIAL")
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_type": "COLLEGE_OFFICIAL",
        "user": {
            "Employee_ID": employee.Employee_ID,
            "Full_Name": employee.Full_Name,
            "Designation": employee.Designation,
            "PDF_Balance": employee.PDF_Balance,
            "Role_Name": employee.role.Role_Name if employee.role else "UNKNOWN",
            "Profile_URL": employee.Profile_URL
        }
    }

@router.post("/login/client", response_model=dict)
def login_client(request: LoginRequest, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.Contact_Email == request.email).first()
    if not client:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(request.password, client.Auth_Hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    access_token = create_access_token(subject=client.Client_ID, user_type="ORGANIZATION")
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_type": "ORGANIZATION",
        "user": {
            "Client_ID": client.Client_ID,
            "Organization_Name": client.Organization_Name,
            "Contact_Email": client.Contact_Email,
            "GSTIN_UIN": client.GSTIN_UIN
        }
    }

@router.post("/login/admin", response_model=dict)
def login_admin(request: LoginRequest):
    if request.email != "admin@internal.tpqa" or request.password != "123976":
        raise HTTPException(status_code=401, detail="Incorrect admin credentials")
    
    access_token = create_access_token(subject="ADMIN", user_type="ADMIN")
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_type": "ADMIN",
        "user": {
            "name": "Super Admin"
        }
    }

@router.get("/faculty/profile")
def get_faculty_profile(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can view profile")
    
    employee = current_user["user"]
    dept_name = employee.department.Department_Name if employee.department else "Unknown"
    role_name = employee.role.Role_Name if employee.role else "Unknown"
    
    return {
        "Employee_ID": employee.Employee_ID,
        "Full_Name": employee.Full_Name,
        "Email": employee.Email,
        "Designation": employee.Designation,
        "Department_Name": dept_name,
        "Role_Name": role_name,
        "PDF_Balance": float(employee.PDF_Balance) if employee.PDF_Balance else 0.00,
        "Profile_URL": employee.Profile_URL,
        "Created_At": str(employee.Created_At) if employee.Created_At else None,
    }

@router.put("/faculty/settings")
def update_faculty_settings(payload: FacultySettingsUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["user_type"] != "COLLEGE_OFFICIAL":
        raise HTTPException(status_code=403, detail="Only faculty can update settings")
    
    employee = current_user["user"]
    if not verify_password(payload.old_password, employee.Auth_Hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    if payload.name is not None:
        employee.Full_Name = payload.name
    if payload.profile_url is not None:
        employee.Profile_URL = payload.profile_url
    if payload.new_password is not None:
        employee.Auth_Hash = hash_password(payload.new_password)
    
    db.commit()
    db.refresh(employee)
    
    return {
        "message": "Settings updated successfully",
        "user": {
            "Employee_ID": employee.Employee_ID,
            "Full_Name": employee.Full_Name,
            "Designation": employee.Designation,
            "PDF_Balance": employee.PDF_Balance,
            "Role_Name": employee.role.Role_Name if employee.role else "UNKNOWN",
            "Profile_URL": employee.Profile_URL
        }
    }
