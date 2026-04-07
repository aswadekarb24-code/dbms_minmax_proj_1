from pydantic import BaseModel
from typing import Optional
from datetime import date

class ProjectBase(BaseModel):
    Project_Title: str
    Est_Person_Days: Optional[int] = None
    Contract_Period: Optional[str] = None
    Liability_Period: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

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
