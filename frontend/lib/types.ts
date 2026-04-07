export type ProjectStatus = 
  | 'REQUEST_BY_EXTERNAL_ORG'
  | 'RESPONSE_BY_FACULTY'
  | 'AGENCY_ACCEPTANCE'
  | 'DIRECTOR_APPROVAL'
  | 'PROFORMA_INVOICE'
  | 'TAX_INVOICE_AND_RECEIPT'
  | 'COMPLETION_REPORTS'
  | 'AMOUNT_DISTRIBUTION'
  | 'CLOSED';

export type InvoiceType = 'PROFORMA' | 'TAX_INVOICE';

export type PayeeType = 
  | 'DIRECTOR'
  | 'HOD'
  | 'PROJECT_COORDINATOR'
  | 'SUPPORT_STAFF'
  | 'EXTERNAL_AGENCY'
  | 'OFFICE_SHARE'
  | 'PDF';

export type RoleType = 'DIRECTOR' | 'HOD' | 'PROJECT_COORDINATOR' | 'SUPPORT_STAFF';

export interface Employee {
  Employee_ID: number;
  Department_ID: number;
  Role_ID: number;
  Full_Name: string;
  Designation: string;
  PDF_Balance: number;
  Role_Name: RoleType;
}

export interface Client {
  Client_ID: number;
  Organization_Name: string;
  Office_Address: string;
  Contact_Person_Name: string;
  Contact_Number: string;
  Contact_Email: string;
  GSTIN_UIN: string | null;
  State_Name: string;
  State_Code: string;
}

export interface Project {
  Project_ID: number;
  Project_Number: string;
  Client_ID: number;
  Department_ID: number;
  Coordinator_ID: number;
  Project_Title: string;
  Current_Status: ProjectStatus;
  Agency_Appointed: string | null;
  Cost_Of_Work: number;
  Contract_Period: string | null;
  Liability_Period: string | null;
  Proof_Consultant: string | null;
  PM_Consultant: string | null;
  Physical_Progress: string | null;
  Est_Person_Days: number | null;
  Est_Site_Visits: number | null;
  Proposed_Fee_Pct: number | null;
  Start_Date: string | null;
}

export interface BudgetEstimation {
  Budget_ID: number;
  Project_ID: number;
  Faculty_Fees: number;
  External_Fees: number;
  Ext_Agency_ID: number | null;
  CPTS_Charges: number;
  Operational_Exp: number;
  Capital_Equip: number;
  CNL_Expenses: number;
  Office_Share_Amt: number;
  Net_Project_Cost: number;
  Institute_Share: number;
  Total_Project_Cost: number;
  Director_Approval: boolean;
}

export interface Invoice {
  Invoice_ID: number;
  Project_ID: number;
  Invoice_Type: InvoiceType;
  Invoice_Number: string;
  Invoice_Date: string;
  Buyer_Order_No: string | null;
  Destination: string | null;
  Payment_Terms: string | null;
  HSN_SAC_Code: string | null;
  Taxable_Value: number;
  Tax_Amount: number;
  Total_Amount: number;
  Inst_PAN: string | null;
  Bank_Account_No: string | null;
}

export interface Receipt {
  Receipt_ID: number;
  Invoice_ID: number;
  Voucher_Number: string;
  Receipt_Date: string;
  Total_Received: number;
  TDS_Deducted: number;
  Trans_Mode: string;
  Bank_Trans_Ref: string;
}

export interface DistributionMaster {
  Dist_Master_ID: number;
  Project_ID: number;
  Receipt_ID: number;
  Total_Dist_Amt: number;
  Staff_Pool_70: number;
  Inst_Pool_30: number;
  Approval_Status: boolean;
}

export interface DistributionLineItem {
  Line_Item_ID: number;
  Dist_Master_ID: number;
  Payee_Type: PayeeType;
  Employee_ID: number | null;
  Ext_Agency_ID: number | null;
  Percentage_Rule: number;
  Allocated_Amt: number;
}
