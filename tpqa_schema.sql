-- ============================================================================
-- Academic Consultancy & Third-Party Quality Audit (TPQA) Management System
-- DDL Script — PostgreSQL Compatible, 3NF Normalized
-- Generated: 2026-04-07
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. IDEMPOTENCY: Clean slate for re-runs
-- ============================================================================

DROP VIEW IF EXISTS View_Project_Coordinator_Analytics CASCADE;
DROP VIEW IF EXISTS View_Institute_Cumulative_Revenue CASCADE;

DROP TABLE IF EXISTS Distribution_Line_Items CASCADE;
DROP TABLE IF EXISTS Distribution_Master CASCADE;
DROP TABLE IF EXISTS Receipts CASCADE;
DROP TABLE IF EXISTS Invoices CASCADE;
DROP TABLE IF EXISTS Budget_Estimations CASCADE;
DROP TABLE IF EXISTS Projects CASCADE;
DROP TABLE IF EXISTS External_Agencies CASCADE;
DROP TABLE IF EXISTS Clients CASCADE;
DROP TABLE IF EXISTS Employees CASCADE;
DROP TABLE IF EXISTS Departments CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;

DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS invoice_type CASCADE;
DROP TYPE IF EXISTS payee_type CASCADE;
DROP TYPE IF EXISTS distribution_approval_status CASCADE;

DROP FUNCTION IF EXISTS fn_set_updated_at() CASCADE;

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

CREATE TYPE project_status AS ENUM (
    'REQUEST_BY_EXTERNAL_ORG',          -- Step 1: Request message by external organization
    'RESPONSE_BY_FACULTY',              -- Step 2: Response message by college faculty
    'AGENCY_ACCEPTANCE',                -- Step 3: Acceptance of external agency to fee/condition
    'DIRECTOR_APPROVAL',                -- Step 4: Approval by college director
    'PROFORMA_INVOICE',                 -- Step 5: Proforma Invoice
    'TAX_INVOICE_AND_RECEIPT',          -- Step 6: Tax invoice and receipt sent to client
    'COMPLETION_REPORTS',               -- Step 7: Completion reports sent to client
    'AMOUNT_DISTRIBUTION',             -- Step 8: Distribution of amount to college faculty
    'CLOSED'                            -- Step 9: Closing document
);

CREATE TYPE invoice_type AS ENUM (
    'PROFORMA',
    'TAX_INVOICE'
);

CREATE TYPE payee_type AS ENUM (
    'DIRECTOR',
    'HOD',
    'PROJECT_COORDINATOR',
    'SUPPORT_STAFF',
    'EXTERNAL_AGENCY',
    'OFFICE_SHARE',
    'PDF'
);

CREATE TYPE distribution_approval_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


-- ============================================================================
-- 2. TABLE: Roles
-- ============================================================================

CREATE TABLE Roles (
    Role_ID         SERIAL          PRIMARY KEY,
    Role_Name       VARCHAR(50)     NOT NULL UNIQUE,

    Created_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_role_name CHECK (
        Role_Name IN ('DIRECTOR', 'HOD', 'PROJECT_COORDINATOR', 'SUPPORT_STAFF')
    )
);


-- ============================================================================
-- 3. TABLE: Departments
--    (HOD_Employee_ID FK added via ALTER after Employees table is created)
-- ============================================================================

CREATE TABLE Departments (
    Department_ID       SERIAL          PRIMARY KEY,
    Department_Name     VARCHAR(150)    NOT NULL UNIQUE,
    HOD_Employee_ID     INT             NULL,           -- FK deferred

    Created_At          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- 4. TABLE: Employees
-- ============================================================================

CREATE TABLE Employees (
    Employee_ID     SERIAL          PRIMARY KEY,
    Department_ID   INT             NOT NULL,
    Role_ID         INT             NOT NULL,
    Full_Name       VARCHAR(200)    NOT NULL,
    Designation     VARCHAR(100)    NOT NULL,
    PDF_Balance     DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Email           VARCHAR(254)    NOT NULL UNIQUE,
    Auth_Hash       VARCHAR(512)    NOT NULL,

    Created_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_department
        FOREIGN KEY (Department_ID)
        REFERENCES Departments(Department_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_emp_role
        FOREIGN KEY (Role_ID)
        REFERENCES Roles(Role_ID)
        ON DELETE RESTRICT
);

CREATE INDEX idx_employees_department ON Employees(Department_ID);
CREATE INDEX idx_employees_role       ON Employees(Role_ID);

-- Deferred FK: Departments.HOD_Employee_ID → Employees.Employee_ID
ALTER TABLE Departments
    ADD CONSTRAINT fk_dept_hod
        FOREIGN KEY (HOD_Employee_ID)
        REFERENCES Employees(Employee_ID)
        ON DELETE RESTRICT;

CREATE INDEX idx_departments_hod ON Departments(HOD_Employee_ID);


-- ============================================================================
-- 5. TABLE: Clients
-- ============================================================================

CREATE TABLE Clients (
    Client_ID               SERIAL          PRIMARY KEY,
    Organization_Name       VARCHAR(300)    NOT NULL,
    Office_Address          TEXT            NOT NULL,
    Contact_Person_Name     VARCHAR(200)    NOT NULL,
    Contact_Number          VARCHAR(20)     NOT NULL,
    Contact_Email           VARCHAR(254)    NOT NULL,
    GSTIN_UIN               VARCHAR(25)     NULL,
    State_Name              VARCHAR(100)    NOT NULL,
    State_Code              VARCHAR(25)     NOT NULL,
    Auth_Hash               VARCHAR(512)    NOT NULL,

    Created_At              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_client_email UNIQUE (Contact_Email)
);


-- ============================================================================
-- 6. TABLE: External_Agencies
-- ============================================================================

CREATE TABLE External_Agencies (
    Ext_Agency_ID   SERIAL          PRIMARY KEY,
    Agency_Name     VARCHAR(300)    NOT NULL,
    Services_Scope  TEXT            NOT NULL,

    Created_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- 7. TABLE: Projects
-- ============================================================================

CREATE TABLE Projects (
    Project_ID          SERIAL              PRIMARY KEY,
    Project_Number      VARCHAR(50)         NOT NULL UNIQUE,
    Client_ID           INT                 NOT NULL,
    Department_ID       INT                 NOT NULL,
    Coordinator_ID      INT                 NOT NULL,
    Project_Title       VARCHAR(500)        NOT NULL,
    Current_Status      project_status      NOT NULL DEFAULT 'REQUEST_BY_EXTERNAL_ORG',
    Agency_Appointed    VARCHAR(300)        NULL,
    Cost_Of_Work        DECIMAL(15,2)       NOT NULL DEFAULT 0.00,
    Contract_Period     VARCHAR(100)        NULL,
    Liability_Period    VARCHAR(100)        NULL,
    Proof_Consultant    VARCHAR(300)        NULL,
    PM_Consultant       VARCHAR(300)        NULL,
    Physical_Progress   VARCHAR(200)        NULL,
    Est_Person_Days     INT                 NULL,
    Est_Site_Visits     INT                 NULL,
    Proposed_Fee_Pct    DECIMAL(5,2)        NULL,
    Start_Date          DATE                NULL,

    Created_At          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_proj_client
        FOREIGN KEY (Client_ID)
        REFERENCES Clients(Client_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_proj_department
        FOREIGN KEY (Department_ID)
        REFERENCES Departments(Department_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_proj_coordinator
        FOREIGN KEY (Coordinator_ID)
        REFERENCES Employees(Employee_ID)
        ON DELETE RESTRICT
);

CREATE INDEX idx_projects_client      ON Projects(Client_ID);
CREATE INDEX idx_projects_department  ON Projects(Department_ID);
CREATE INDEX idx_projects_coordinator ON Projects(Coordinator_ID);
CREATE INDEX idx_projects_status      ON Projects(Current_Status);


-- ============================================================================
-- 8. TABLE: Budget_Estimations
-- ============================================================================

CREATE TABLE Budget_Estimations (
    Budget_ID           SERIAL          PRIMARY KEY,
    Project_ID          INT             NOT NULL,
    Faculty_Fees        DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    External_Fees       DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Ext_Agency_ID       INT             NULL,
    CPTS_Charges        DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Operational_Exp     DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Capital_Equip       DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    CNL_Expenses        DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Office_Share_Amt    DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Net_Project_Cost    DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Institute_Share     DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Total_Project_Cost  DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Director_Approval   BOOLEAN         NOT NULL DEFAULT FALSE,

    Created_At          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_project
        FOREIGN KEY (Project_ID)
        REFERENCES Projects(Project_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_budget_ext_agency
        FOREIGN KEY (Ext_Agency_ID)
        REFERENCES External_Agencies(Ext_Agency_ID)
        ON DELETE RESTRICT
);

CREATE INDEX idx_budget_project    ON Budget_Estimations(Project_ID);
CREATE INDEX idx_budget_ext_agency ON Budget_Estimations(Ext_Agency_ID);


-- ============================================================================
-- 9. TABLE: Invoices
-- ============================================================================

CREATE TABLE Invoices (
    Invoice_ID      SERIAL          PRIMARY KEY,
    Project_ID      INT             NOT NULL,
    Invoice_Type    invoice_type    NOT NULL,
    Invoice_Number  VARCHAR(50)     NOT NULL UNIQUE,
    Invoice_Date    DATE            NOT NULL,
    Buyer_Order_No  VARCHAR(100)    NULL,
    Destination     VARCHAR(300)    NULL,
    Payment_Terms   VARCHAR(300)    NULL,
    HSN_SAC_Code    VARCHAR(20)     NULL,
    Taxable_Value   DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Tax_Amount      DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Total_Amount    DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Inst_PAN        VARCHAR(20)     NULL,
    Bank_Account_No VARCHAR(30)     NULL,

    Created_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoice_project
        FOREIGN KEY (Project_ID)
        REFERENCES Projects(Project_ID)
        ON DELETE RESTRICT,

    CONSTRAINT chk_invoice_total
        CHECK (Total_Amount = Taxable_Value + Tax_Amount)
);

CREATE INDEX idx_invoices_project ON Invoices(Project_ID);
CREATE INDEX idx_invoices_type    ON Invoices(Invoice_Type);


-- ============================================================================
-- 10. TABLE: Receipts
-- ============================================================================

CREATE TABLE Receipts (
    Receipt_ID      SERIAL          PRIMARY KEY,
    Invoice_ID      INT             NOT NULL,
    Voucher_Number  VARCHAR(50)     NOT NULL UNIQUE,
    Receipt_Date    DATE            NOT NULL,
    Total_Received  DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    TDS_Deducted    DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Trans_Mode      VARCHAR(50)     NOT NULL,
    Bank_Trans_Ref  VARCHAR(100)    NOT NULL UNIQUE,

    Created_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_receipt_invoice
        FOREIGN KEY (Invoice_ID)
        REFERENCES Invoices(Invoice_ID)
        ON DELETE RESTRICT
);

CREATE INDEX idx_receipts_invoice ON Receipts(Invoice_ID);


-- ============================================================================
-- 11. TABLE: Distribution_Master
-- ============================================================================

CREATE TABLE Distribution_Master (
    Dist_Master_ID      SERIAL          PRIMARY KEY,
    Project_ID          INT             NOT NULL,
    Receipt_ID          INT             NOT NULL,
    Total_Dist_Amt      DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Staff_Pool_70       DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Inst_Pool_30        DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    Approval_Status     BOOLEAN         NOT NULL DEFAULT FALSE,

    Created_At          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dist_project
        FOREIGN KEY (Project_ID)
        REFERENCES Projects(Project_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_dist_receipt
        FOREIGN KEY (Receipt_ID)
        REFERENCES Receipts(Receipt_ID)
        ON DELETE RESTRICT,

    -- Distribution Logic Validity: 70/30 pool must equal the total
    CONSTRAINT chk_dist_pool_sum
        CHECK (Staff_Pool_70 + Inst_Pool_30 = Total_Dist_Amt)
);

CREATE INDEX idx_dist_master_project ON Distribution_Master(Project_ID);
CREATE INDEX idx_dist_master_receipt ON Distribution_Master(Receipt_ID);


-- ============================================================================
-- 12. TABLE: Distribution_Line_Items
-- ============================================================================

CREATE TABLE Distribution_Line_Items (
    Line_Item_ID    SERIAL          PRIMARY KEY,
    Dist_Master_ID  INT             NOT NULL,
    Payee_Type      payee_type      NOT NULL,
    Employee_ID     INT             NULL,
    Ext_Agency_ID   INT             NULL,
    Percentage_Rule DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    Allocated_Amt   DECIMAL(15,2)   NOT NULL DEFAULT 0.00,

    Created_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_line_dist_master
        FOREIGN KEY (Dist_Master_ID)
        REFERENCES Distribution_Master(Dist_Master_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_line_employee
        FOREIGN KEY (Employee_ID)
        REFERENCES Employees(Employee_ID)
        ON DELETE RESTRICT,

    CONSTRAINT fk_line_ext_agency
        FOREIGN KEY (Ext_Agency_ID)
        REFERENCES External_Agencies(Ext_Agency_ID)
        ON DELETE RESTRICT,

    -- If payee is an employee-type, Employee_ID must be populated
    CONSTRAINT chk_line_employee_payee
        CHECK (
            (Payee_Type IN ('DIRECTOR','HOD','PROJECT_COORDINATOR','SUPPORT_STAFF')
                AND Employee_ID IS NOT NULL)
            OR
            (Payee_Type = 'EXTERNAL_AGENCY' AND Ext_Agency_ID IS NOT NULL)
            OR
            (Payee_Type IN ('OFFICE_SHARE','PDF'))
        ),

    -- Mutual exclusivity: cannot assign to both employee and agency
    CONSTRAINT chk_line_payee_exclusivity
        CHECK (
            NOT (Employee_ID IS NOT NULL AND Ext_Agency_ID IS NOT NULL)
        )
);

CREATE INDEX idx_line_items_dist_master ON Distribution_Line_Items(Dist_Master_ID);
CREATE INDEX idx_line_items_employee    ON Distribution_Line_Items(Employee_ID);
CREATE INDEX idx_line_items_ext_agency  ON Distribution_Line_Items(Ext_Agency_ID);
CREATE INDEX idx_line_items_payee_type  ON Distribution_Line_Items(Payee_Type);


-- ============================================================================
-- 13. TRIGGER FUNCTION: Auto-update Updated_At on row modification
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.Updated_At = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to every table
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'roles',
            'departments',
            'employees',
            'clients',
            'external_agencies',
            'projects',
            'budget_estimations',
            'invoices',
            'receipts',
            'distribution_master',
            'distribution_line_items'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION fn_set_updated_at();',
            tbl, tbl
        );
    END LOOP;
END;
$$;


-- ============================================================================
-- 14. SEED DATA: Roles
-- ============================================================================

INSERT INTO Roles (Role_Name) VALUES
    ('DIRECTOR'),
    ('HOD'),
    ('PROJECT_COORDINATOR'),
    ('SUPPORT_STAFF');


-- ============================================================================
-- 15. ANALYTICS VIEW: View_Institute_Cumulative_Revenue
--     Aggregates receipts by Department and fiscal year (Apr–Mar).
-- ============================================================================

CREATE OR REPLACE VIEW View_Institute_Cumulative_Revenue AS
SELECT
    d.Department_ID,
    d.Department_Name,
    -- Indian fiscal year: April to March.
    -- A receipt in Jan 2027 belongs to FY 2026-27.
    CASE
        WHEN EXTRACT(MONTH FROM r.Receipt_Date) >= 4
            THEN EXTRACT(YEAR FROM r.Receipt_Date)
        ELSE EXTRACT(YEAR FROM r.Receipt_Date) - 1
    END                                         AS Fiscal_Year_Start,
    CONCAT(
        CASE
            WHEN EXTRACT(MONTH FROM r.Receipt_Date) >= 4
                THEN EXTRACT(YEAR FROM r.Receipt_Date)::TEXT
            ELSE (EXTRACT(YEAR FROM r.Receipt_Date) - 1)::TEXT
        END,
        '-',
        CASE
            WHEN EXTRACT(MONTH FROM r.Receipt_Date) >= 4
                THEN RIGHT((EXTRACT(YEAR FROM r.Receipt_Date) + 1)::TEXT, 2)
            ELSE RIGHT(EXTRACT(YEAR FROM r.Receipt_Date)::TEXT, 2)
        END
    )                                           AS Fiscal_Year_Label,
    SUM(r.Total_Received)                       AS Total_Received,
    SUM(r.TDS_Deducted)                         AS Total_TDS_Deducted,
    SUM(r.Total_Received) - SUM(r.TDS_Deducted) AS Net_Received,
    COUNT(DISTINCT p.Project_ID)                AS Project_Count,
    COUNT(r.Receipt_ID)                         AS Receipt_Count
FROM
    Receipts r
    INNER JOIN Invoices  i ON r.Invoice_ID   = i.Invoice_ID
    INNER JOIN Projects  p ON i.Project_ID   = p.Project_ID
    INNER JOIN Departments d ON p.Department_ID = d.Department_ID
GROUP BY
    d.Department_ID,
    d.Department_Name,
    Fiscal_Year_Start,
    Fiscal_Year_Label
ORDER BY
    d.Department_Name,
    Fiscal_Year_Start;


-- ============================================================================
-- 16. ANALYTICS VIEW: View_Project_Coordinator_Analytics
--     Aggregates personal payouts and PDF allocations per coordinator.
--     Structurally isolates peer data (each coordinator sees only their own).
-- ============================================================================

CREATE OR REPLACE VIEW View_Project_Coordinator_Analytics AS
SELECT
    e.Employee_ID                                   AS Coordinator_Employee_ID,
    e.Full_Name                                     AS Coordinator_Name,
    e.Designation                                   AS Coordinator_Designation,
    d.Department_ID,
    d.Department_Name,
    COUNT(DISTINCT p.Project_ID)                    AS Total_Projects_Coordinated,

    -- Personal payouts (line items where payee is PROJECT_COORDINATOR for this employee)
    COALESCE(SUM(
        CASE WHEN dli.Payee_Type = 'PROJECT_COORDINATOR'
             THEN dli.Allocated_Amt
             ELSE 0
        END
    ), 0.00)                                        AS Total_Personal_Payout,

    -- PDF allocations (line items of type PDF linked via distribution to their projects)
    COALESCE(SUM(
        CASE WHEN dli.Payee_Type = 'PDF'
             THEN dli.Allocated_Amt
             ELSE 0
        END
    ), 0.00)                                        AS Total_PDF_Allocation,

    -- Current PDF balance from employee record
    e.PDF_Balance                                   AS Current_PDF_Balance,

    -- Total distributed amount across all their projects
    COALESCE(SUM(dm.Total_Dist_Amt), 0.00)          AS Total_Project_Distribution,

    COUNT(DISTINCT dm.Dist_Master_ID)               AS Distribution_Count

FROM
    Employees e
    INNER JOIN Roles      rl  ON e.Role_ID        = rl.Role_ID
    INNER JOIN Departments d  ON e.Department_ID  = d.Department_ID
    INNER JOIN Projects    p  ON p.Coordinator_ID = e.Employee_ID
    LEFT  JOIN Distribution_Master dm
        ON dm.Project_ID = p.Project_ID
    LEFT  JOIN Distribution_Line_Items dli
        ON  dli.Dist_Master_ID = dm.Dist_Master_ID
        AND (
                (dli.Payee_Type = 'PROJECT_COORDINATOR' AND dli.Employee_ID = e.Employee_ID)
            OR  dli.Payee_Type = 'PDF'
        )
WHERE
    rl.Role_Name = 'PROJECT_COORDINATOR'
GROUP BY
    e.Employee_ID,
    e.Full_Name,
    e.Designation,
    e.PDF_Balance,
    d.Department_ID,
    d.Department_Name
ORDER BY
    e.Full_Name;


COMMIT;

-- ============================================================================
-- END OF DDL SCRIPT
-- ============================================================================
