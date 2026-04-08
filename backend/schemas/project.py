from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class ProjectBase(BaseModel):
    Project_Title: str
    Est_Person_Days: Optional[int] = None
    Contract_Period: Optional[str] = None
    Liability_Period: Optional[str] = None

class ProjectCreate(ProjectBase):
    Department_ID: int

class ProjectResponse(ProjectBase):
    Project_ID: int
    Project_Number: str
    Client_ID: int
    Department_ID: int
    Coordinator_ID: int
    Current_Status: str
    Cost_Of_Work: float
    Start_Date: Optional[date] = None

    class Config:
        from_attributes = True

# Step 2
class Step2FacultyResponse(BaseModel):
    Coordinator_ID: int
    Proposed_Fee_Pct: float
    Est_Faculty_Fees: float
    Est_External_Fees: float
    Operational_Exp: float

# Step 3 (Client Acceptance doesn't strictly need a payload if it's just accepting the fees already stored, but we can accept a simple confirm flag)
class Step3AgencyAcceptance(BaseModel):
    accepted: bool = True

# Step 4
class Step4DirectorApproval(BaseModel):
    approved: bool = True

# Step 5
class Step5Proforma(BaseModel):
    HSN_SAC_Code: str
    Taxable_Value: float
    Tax_Amount: float

# Step 6
class Step6TaxReceipt(BaseModel):
    Voucher_Number: str
    Receipt_Date: date
    Total_Received: float
    TDS_Deducted: float
    Bank_Trans_Ref: str

# Step 7
class Step7Completion(BaseModel):
    report_url: str = "placeholder_url_until_file_upload"

# Step 8
class DistributionItem(BaseModel):
    Payee_Type: str
    Employee_ID: Optional[int] = None
    Allocated_Amt: float

class Step8Distribution(BaseModel):
    distributions: List[DistributionItem]

class Step9Close(BaseModel):
    pass
