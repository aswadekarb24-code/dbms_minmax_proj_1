from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from core.database import get_db
from core.security import hash_password, verify_password, create_access_token
from models.tables import Employee, Client, Role
from schemas.auth import FacultySignup, ClientSignup, LoginRequest, Token, EmployeeResponse, ClientResponse

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
        Designation=user.designation
    )
    db.add(new_employee)
    try:
        db.commit()
        db.refresh(new_employee)
    except Exception as e:
        db.rollback()
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
            "Role_Name": employee.role.Role_Name if employee.role else "UNKNOWN"
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
