Role: You are an expert Relational Database Architect and SQL Developer.

Task: Generate a complete, highly normalized (3NF) SQL Data Definition Language (DDL) script (PostgreSQL or MySQL compatible) for an Academic Consultancy and Third-Party Quality Audit (TPQA) management system.

Core Workflow & State Machine:
The database must be structured to explicitly track and support the following 9-step operational workflow :

    Request message by external organization 

    Response message by college faculty 

    Acceptance of external agency to fee/condition by college faculty 

    Approval by college director 

    Proforma Invoice 

    Tax invoice and receipt sent to client after depositing money 

    Completion reports sent to client and communication 

    Distribution of amount to College faculty 

    Closing document (signaling necessary information) 

Required Tables & Exact Attributes (Do not deviate or omit):

    Clients: Client_ID (PK), Organization_Name, Office_Address, Contact_Person_Name, Contact_Number, Contact_Email, GSTIN_UIN, State_Name, State_Code.

    Departments: Department_ID (PK), Department_Name, HOD_Employee_ID (FK).

    Roles: Role_ID (PK), Role_Name (Expect: DIRECTOR, HOD, PROJECT_COORDINATOR, SUPPORT_STAFF).

    Employees: Employee_ID (PK), Department_ID (FK), Role_ID (FK), Full_Name, Designation, PDF_Balance (DECIMAL(15,2)), Auth_Hash.

    External_Agencies: Ext_Agency_ID (PK), Agency_Name, Services_Scope.

    Projects: Project_ID (PK), Project_Number (UNIQUE), Client_ID (FK), Department_ID (FK), Coordinator_ID (FK), Project_Title, Current_Status (ENUM explicitly mapping the 9 workflow steps above), Agency_Appointed, Cost_Of_Work (DECIMAL), Contract_Period, Liability_Period, Proof_Consultant, PM_Consultant, Physical_Progress, Est_Person_Days (INT), Est_Site_Visits (INT), Proposed_Fee_Pct (DECIMAL), Start_Date.

    Budget_Estimations: Budget_ID (PK), Project_ID (FK), Faculty_Fees, External_Fees, Ext_Agency_ID (FK NULLABLE), CPTS_Charges, Operational_Exp, Capital_Equip, CNL_Expenses, Office_Share_Amt, Net_Project_Cost, Institute_Share, Total_Project_Cost, Director_Approval (BOOLEAN).

    Invoices: Invoice_ID (PK), Project_ID (FK), Invoice_Type (ENUM: PROFORMA, TAX_INVOICE), Invoice_Number (UNIQUE), Invoice_Date, Buyer_Order_No, Destination, Payment_Terms, HSN_SAC_Code, Taxable_Value, Tax_Amount, Total_Amount, Inst_PAN, Bank_Account_No.

    Receipts: Receipt_ID (PK), Invoice_ID (FK), Voucher_Number (UNIQUE), Receipt_Date, Total_Received, TDS_Deducted, Trans_Mode, Bank_Trans_Ref (UNIQUE).

    Distribution_Master: Dist_Master_ID (PK), Project_ID (FK), Receipt_ID (FK), Total_Dist_Amt, Staff_Pool_70, Inst_Pool_30, Approval_Status (BOOLEAN).

    Distribution_Line_Items: Line_Item_ID (PK), Dist_Master_ID (FK), Payee_Type (ENUM: DIRECTOR, HOD, PROJECT_COORDINATOR, SUPPORT_STAFF, EXTERNAL_AGENCY, OFFICE_SHARE, PDF), Employee_ID (FK NULLABLE), Ext_Agency_ID (FK NULLABLE), Percentage_Rule (DECIMAL), Allocated_Amt.

Strict Architectural Directives & Constraints:

    Precision: You must utilize DECIMAL(15,2) for absolutely all monetary, budget, and fee-related columns to prevent floating-point anomalies.

    Immutability: Apply ON DELETE RESTRICT unconditionally to all foreign keys linking to financial and operational tables (Invoices, Receipts, Budget_Estimations, Distribution_Master). These records must form an immutable audit trail.

    Distribution Logic Validity: The junction table (Distribution_Line_Items) resolves the many-to-many relationship of the 70/30 distribution rule. Include a CHECK constraint on Distribution_Master ensuring Staff_Pool_70 + Inst_Pool_30 equals the Total_Dist_Amt.

    Security & Auditing: Add Created_At and Updated_At timestamp columns to all tables.

Analytics Views to Generate:
Conclude your DDL script by generating two SQL CREATE VIEW statements:

    View_Institute_Cumulative_Revenue: Aggregates all data from the Receipts table, grouping SUM(Total_Received) and SUM(TDS_Deducted) by Department_ID and fiscal year.

    View_Project_Coordinator_Analytics: Performs the necessary JOINs across Employees, Projects, Distribution_Master, and Distribution_Line_Items to aggregate total personal payouts and Professional Development Fund (PDF) allocations specifically for individual project coordinators, structurally isolating peer data.