from pydantic import BaseModel, EmailStr
from typing import Optional

class FacultySignup(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    department_id: int
    role_id: int
    designation: str
    profile_url: Optional[str] = None

class ClientSignup(BaseModel):
    organization_name: str
    contact_person_name: str
    contact_number: str
    contact_email: EmailStr
    password: str
    state_name: str
    state_code: str
    office_address: str
    gstin_uin: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str

class EmployeeResponse(BaseModel):
    Employee_ID: int
    Full_Name: str
    Designation: str
    Email: str
    PDF_Balance: float
    Role_Name: str
    Profile_URL: Optional[str] = None
    
    class Config:
        from_attributes = True

class ClientResponse(BaseModel):
    Client_ID: int
    Organization_Name: str
    Contact_Email: str
    GSTIN_UIN: Optional[str] = None
    
    class Config:
        from_attributes = True

class FacultySettingsUpdate(BaseModel):
    old_password: str
    name: Optional[str] = None
    profile_url: Optional[str] = None
    new_password: Optional[str] = None
