from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, ForeignKey, DateTime, func, CheckConstraint
from sqlalchemy.orm import relationship
from core.database import Base

class Role(Base):
    __tablename__ = "roles"
    Role_ID = Column("role_id", Integer, primary_key=True, index=True)
    Role_Name = Column("role_name", String(50), nullable=False, unique=True)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class Department(Base):
    __tablename__ = "departments"
    Department_ID = Column("department_id", Integer, primary_key=True, index=True)
    Department_Name = Column("department_name", String(150), nullable=False, unique=True)
    HOD_Employee_ID = Column("hod_employee_id", Integer, ForeignKey("employees.employee_id"), nullable=True)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class Employee(Base):
    __tablename__ = "employees"
    Employee_ID = Column("employee_id", Integer, primary_key=True, index=True)
    Department_ID = Column("department_id", Integer, ForeignKey("departments.department_id"), nullable=False)
    Role_ID = Column("role_id", Integer, ForeignKey("roles.role_id"), nullable=False)
    Full_Name = Column("full_name", String(200), nullable=False)
    Designation = Column("designation", String(100), nullable=False)
    PDF_Balance = Column("pdf_balance", Numeric(15, 2), default=0.00, nullable=False)
    Email = Column("email", String(254), nullable=False, unique=True)
    Auth_Hash = Column("auth_hash", String(512), nullable=False)
    Profile_URL = Column("profile_url", String(255), nullable=True)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    role = relationship("Role")
    department = relationship("Department", foreign_keys=[Department_ID])

class Client(Base):
    __tablename__ = "clients"
    Client_ID = Column("client_id", Integer, primary_key=True, index=True)
    Organization_Name = Column("organization_name", String(300), nullable=False)
    Office_Address = Column("office_address", String, nullable=False)
    Contact_Person_Name = Column("contact_person_name", String(200), nullable=False)
    Contact_Number = Column("contact_number", String(20), nullable=False)
    Contact_Email = Column("contact_email", String(254), nullable=False, unique=True)
    GSTIN_UIN = Column("gstin_uin", String(25), nullable=True)
    State_Name = Column("state_name", String(100), nullable=False)
    State_Code = Column("state_code", String(25), nullable=False)
    Auth_Hash = Column("auth_hash", String(512), nullable=False)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class ExternalAgency(Base):
    __tablename__ = "external_agencies"
    Ext_Agency_ID = Column("ext_agency_id", Integer, primary_key=True, index=True)
    Agency_Name = Column("agency_name", String(300), nullable=False)
    Services_Scope = Column("services_scope", String, nullable=False)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class Project(Base):
    __tablename__ = "projects"
    Project_ID = Column("project_id", Integer, primary_key=True, index=True)
    Project_Number = Column("project_number", String(50), nullable=False, unique=True)
    Client_ID = Column("client_id", Integer, ForeignKey("clients.client_id"), nullable=False)
    Department_ID = Column("department_id", Integer, ForeignKey("departments.department_id"), nullable=False)
    Coordinator_ID = Column("coordinator_id", Integer, ForeignKey("employees.employee_id"), nullable=False)
    Project_Title = Column("project_title", String(500), nullable=False)
    Current_Status = Column("current_status", String, default="REQUEST_BY_EXTERNAL_ORG", nullable=False)
    Agency_Appointed = Column("agency_appointed", String(300), nullable=True)
    Cost_Of_Work = Column("cost_of_work", Numeric(15, 2), default=0.00, nullable=False)
    Contract_Period = Column("contract_period", String(100), nullable=True)
    Liability_Period = Column("liability_period", String(100), nullable=True)
    Proof_Consultant = Column("proof_consultant", String(300), nullable=True)
    PM_Consultant = Column("pm_consultant", String(300), nullable=True)
    Physical_Progress = Column("physical_progress", String(200), nullable=True)
    Est_Person_Days = Column("est_person_days", Integer, nullable=True)
    Est_Site_Visits = Column("est_site_visits", Integer, nullable=True)
    Proposed_Fee_Pct = Column("proposed_fee_pct", Numeric(5, 2), nullable=True)
    Start_Date = Column("start_date", Date, nullable=True)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class BudgetEstimation(Base):
    __tablename__ = "budget_estimations"
    Budget_ID = Column("budget_id", Integer, primary_key=True, index=True)
    Project_ID = Column("project_id", Integer, ForeignKey("projects.project_id"), nullable=False)
    Faculty_Fees = Column("faculty_fees", Numeric(15, 2), default=0.00, nullable=False)
    External_Fees = Column("external_fees", Numeric(15, 2), default=0.00, nullable=False)
    Ext_Agency_ID = Column("ext_agency_id", Integer, ForeignKey("external_agencies.ext_agency_id"), nullable=True)
    CPTS_Charges = Column("cpts_charges", Numeric(15, 2), default=0.00, nullable=False)
    Operational_Exp = Column("operational_exp", Numeric(15, 2), default=0.00, nullable=False)
    Capital_Equip = Column("capital_equip", Numeric(15, 2), default=0.00, nullable=False)
    CNL_Expenses = Column("cnl_expenses", Numeric(15, 2), default=0.00, nullable=False)
    Office_Share_Amt = Column("office_share_amt", Numeric(15, 2), default=0.00, nullable=False)
    Net_Project_Cost = Column("net_project_cost", Numeric(15, 2), default=0.00, nullable=False)
    Institute_Share = Column("institute_share", Numeric(15, 2), default=0.00, nullable=False)
    Total_Project_Cost = Column("total_project_cost", Numeric(15, 2), default=0.00, nullable=False)
    Director_Approval = Column("director_approval", Boolean, default=False, nullable=False)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class Invoice(Base):
    __tablename__ = "invoices"
    Invoice_ID = Column("invoice_id", Integer, primary_key=True, index=True)
    Project_ID = Column("project_id", Integer, ForeignKey("projects.project_id"), nullable=False)
    Invoice_Type = Column("invoice_type", String, nullable=False)
    Invoice_Number = Column("invoice_number", String(50), nullable=False, unique=True)
    Invoice_Date = Column("invoice_date", Date, nullable=False)
    Buyer_Order_No = Column("buyer_order_no", String(100), nullable=True)
    Destination = Column("destination", String(300), nullable=True)
    Payment_Terms = Column("payment_terms", String(300), nullable=True)
    HSN_SAC_Code = Column("hsn_sac_code", String(20), nullable=True)
    Taxable_Value = Column("taxable_value", Numeric(15, 2), default=0.00, nullable=False)
    Tax_Amount = Column("tax_amount", Numeric(15, 2), default=0.00, nullable=False)
    Total_Amount = Column("total_amount", Numeric(15, 2), default=0.00, nullable=False)
    Inst_PAN = Column("inst_pan", String(20), nullable=True)
    Bank_Account_No = Column("bank_account_no", String(30), nullable=True)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class Receipt(Base):
    __tablename__ = "receipts"
    Receipt_ID = Column("receipt_id", Integer, primary_key=True, index=True)
    Invoice_ID = Column("invoice_id", Integer, ForeignKey("invoices.invoice_id"), nullable=False)
    Voucher_Number = Column("voucher_number", String(50), nullable=False, unique=True)
    Receipt_Date = Column("receipt_date", Date, nullable=False)
    Total_Received = Column("total_received", Numeric(15, 2), default=0.00, nullable=False)
    TDS_Deducted = Column("tds_deducted", Numeric(15, 2), default=0.00, nullable=False)
    Trans_Mode = Column("trans_mode", String(50), nullable=False)
    Bank_Trans_Ref = Column("bank_trans_ref", String(100), nullable=False, unique=True)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class DistributionMaster(Base):
    __tablename__ = "distribution_master"
    Dist_Master_ID = Column("dist_master_id", Integer, primary_key=True, index=True)
    Project_ID = Column("project_id", Integer, ForeignKey("projects.project_id"), nullable=False)
    Receipt_ID = Column("receipt_id", Integer, ForeignKey("receipts.receipt_id"), nullable=False)
    Total_Dist_Amt = Column("total_dist_amt", Numeric(15, 2), default=0.00, nullable=False)
    Staff_Pool_70 = Column("staff_pool_70", Numeric(15, 2), default=0.00, nullable=False)
    Inst_Pool_30 = Column("inst_pool_30", Numeric(15, 2), default=0.00, nullable=False)
    Approval_Status = Column("approval_status", Boolean, default=False, nullable=False)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class DistributionLineItem(Base):
    __tablename__ = "distribution_line_items"
    Line_Item_ID = Column("line_item_id", Integer, primary_key=True, index=True)
    Dist_Master_ID = Column("dist_master_id", Integer, ForeignKey("distribution_master.dist_master_id"), nullable=False)
    Payee_Type = Column("payee_type", String, nullable=False)
    Employee_ID = Column("employee_id", Integer, ForeignKey("employees.employee_id"), nullable=True)
    Ext_Agency_ID = Column("ext_agency_id", Integer, ForeignKey("external_agencies.ext_agency_id"), nullable=True)
    Percentage_Rule = Column("percentage_rule", Numeric(5, 2), default=0.00, nullable=False)
    Allocated_Amt = Column("allocated_amt", Numeric(15, 2), default=0.00, nullable=False)
    Created_At = Column("created_at", DateTime, default=func.now(), nullable=False)
    Updated_At = Column("updated_at", DateTime, default=func.now(), onupdate=func.now(), nullable=False)
