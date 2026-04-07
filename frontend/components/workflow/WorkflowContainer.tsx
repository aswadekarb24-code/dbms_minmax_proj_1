"use client";

import { Project, ProjectStatus } from "@/lib/types";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

// Step-to-endpoint mapping
const STEP_ENDPOINTS: Record<ProjectStatus, { next: ProjectStatus; endpoint: string } | null> = {
  'REQUEST_BY_EXTERNAL_ORG': { next: 'RESPONSE_BY_FACULTY', endpoint: 'faculty-response' },
  'RESPONSE_BY_FACULTY': { next: 'AGENCY_ACCEPTANCE', endpoint: 'faculty-response' },
  'AGENCY_ACCEPTANCE': { next: 'DIRECTOR_APPROVAL', endpoint: 'agency-acceptance' },
  'DIRECTOR_APPROVAL': { next: 'PROFORMA_INVOICE', endpoint: 'director-approval' },
  'PROFORMA_INVOICE': { next: 'TAX_INVOICE_AND_RECEIPT', endpoint: 'proforma-invoice' },
  'TAX_INVOICE_AND_RECEIPT': { next: 'COMPLETION_REPORTS', endpoint: 'tax-invoice-receipt' },
  'COMPLETION_REPORTS': { next: 'AMOUNT_DISTRIBUTION', endpoint: 'completion-report' },
  'AMOUNT_DISTRIBUTION': { next: 'CLOSED', endpoint: 'distribution' },
  'CLOSED': null,
};

export function WorkflowContainer({ project, onUpdateStatus }: { project: Project, onUpdateStatus: (s: ProjectStatus) => void }) {
  const { userType, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async (nextStatus: ProjectStatus) => {
    setLoading(true);
    setError("");
    const stepConfig = STEP_ENDPOINTS[project.Current_Status];
    if (!stepConfig) return;

    try {
      await api.post(`/api/consultancy/${project.Project_ID}/${stepConfig.endpoint}`);
      onUpdateStatus(nextStatus);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to advance workflow step.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (project.Current_Status) {
      
      case 'REQUEST_BY_EXTERNAL_ORG':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">1. Request Consultancy (Organization)</h3>
            <p className="text-sm text-slate-500">The external organization requests a consultancy or audit.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title <span className="text-red-500">*</span></label>
                <input type="text" defaultValue={project.Project_Title} disabled={userType === 'COLLEGE_OFFICIAL'} className="w-full form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Person Days</label>
                <input type="number" defaultValue={project.Est_Person_Days || ""} disabled={userType === 'COLLEGE_OFFICIAL'} className="w-full form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contract Period</label>
                <input type="text" defaultValue={project.Contract_Period || ""} disabled={userType === 'COLLEGE_OFFICIAL'} className="w-full form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Liability Period</label>
                <input type="text" defaultValue={project.Liability_Period || ""} disabled={userType === 'COLLEGE_OFFICIAL'} className="w-full form-input" />
              </div>
            </div>
            
            {userType === 'ORGANIZATION' ? (
              <button onClick={() => handleNext('RESPONSE_BY_FACULTY')} disabled={loading} className="btn-primary">
                {loading ? 'Submitting...' : 'Submit Request to Faculty'}
              </button>
            ) : (
              <button onClick={() => handleNext('RESPONSE_BY_FACULTY')} className="btn-secondary">
                Acknowledge & Proceed
              </button>
            )}
          </div>
        );

      case 'RESPONSE_BY_FACULTY':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">2. Faculty Response & Budgeting</h3>
            <p className="text-sm text-slate-500">Assign coordinator and propose preliminary budget parameters.</p>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-medium mb-1">Assign Coordinator (Employee_ID)</label>
                <input type="number" defaultValue={project.Coordinator_ID || ""} className="w-full form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proposed Fee %</label>
                <input type="number" step="0.01" defaultValue={project.Proposed_Fee_Pct || ""} className="w-full form-input" />
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-500">Est. Faculty Fees (₹)</label>
                  <input type="number" className="w-full form-input text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-500">Est. External Fees (₹)</label>
                  <input type="number" className="w-full form-input text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-500">Operational Exp. (₹)</label>
                  <input type="number" className="w-full form-input text-sm" placeholder="0.00" />
                </div>
              </div>
            </div>

            <button onClick={() => handleNext('AGENCY_ACCEPTANCE')} disabled={loading} className="btn-primary">
              {loading ? 'Processing...' : 'Send to Agency for Acceptance'}
            </button>
          </div>
        );

      case 'AGENCY_ACCEPTANCE':
        return (
           <div className="space-y-6">
            <h3 className="text-xl font-semibold">3. Agency Acceptance</h3>
            <p className="text-sm text-slate-500">Client organization reviews and accepts the proposed fee structures.</p>
            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
              <strong>College proposed fee structure:</strong> ₹ {Number(project.Cost_Of_Work || 0).toLocaleString()} Total Estimated Cost.
            </div>
            
            {userType === 'ORGANIZATION' ? (
              <div className="flex gap-4">
                <button onClick={() => handleNext('DIRECTOR_APPROVAL')} disabled={loading} className="btn-primary">
                  {loading ? 'Processing...' : 'Accept & Confirm'}
                </button>
                <button className="btn-secondary text-red-600">Reject / Request Changes</button>
              </div>
            ) : (
              <button onClick={() => handleNext('DIRECTOR_APPROVAL')} className="btn-secondary">Skip (For Demo) / Await Client</button>
            )}
           </div>
        );

      case 'DIRECTOR_APPROVAL':
        return (
           <div className="space-y-6 border-l-4 border-amber-500 pl-4">
            <h3 className="text-xl font-semibold">4. Director Approval</h3>
            <p className="text-sm text-slate-500">College Director must review and approve the budget.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500">Total Project Cost</p>
                <p className="text-xl font-bold">₹ {Number(project.Cost_Of_Work || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500">Institute Share Estimated</p>
                <p className="text-xl font-bold">₹ {(Number(project.Cost_Of_Work || 0) * 0.3).toLocaleString()}</p>
              </div>
            </div>

            {role === 'DIRECTOR' ? (
              <button onClick={() => handleNext('PROFORMA_INVOICE')} disabled={loading} className="btn-primary bg-amber-600 hover:bg-amber-700">
                {loading ? 'Processing...' : 'Grant Director Approval'}
              </button>
            ) : (
              <div className="text-amber-600 text-sm font-medium">Waiting for Director (Role) to approve this step.</div>
            )}
           </div>
        );

      case 'PROFORMA_INVOICE':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">5. Generate Proforma Invoice</h3>
            <p className="text-sm text-slate-500">Maps to Invoices table with Invoice_Type = PROFORMA</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Number (Auto-gen)</label>
                <input type="text" value={`PI-${new Date().getFullYear()}-${project.Project_ID}`} disabled className="w-full form-input bg-slate-100 dark:bg-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">HSN/SAC Code</label>
                <input type="text" defaultValue="998311" className="w-full form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Taxable Value (₹)</label>
                <input type="number" defaultValue={Number(project.Cost_Of_Work || 0)} className="w-full form-input" />
              </div>
               <div>
                <label className="block text-sm font-medium mb-1">Tax Amount (18% GST)</label>
                <input type="number" defaultValue={Number(project.Cost_Of_Work || 0) * 0.18} className="w-full form-input" />
              </div>
            </div>
            
            <button onClick={() => handleNext('TAX_INVOICE_AND_RECEIPT')} disabled={loading} className="btn-primary">
              {loading ? 'Processing...' : 'Generate & Send Proforma'}
            </button>
          </div>
        );

      case 'TAX_INVOICE_AND_RECEIPT':
        return (
          <div className="space-y-6">
             <h3 className="text-xl font-semibold">6. Tax Invoice & Payment Receipt</h3>
            <p className="text-sm text-slate-500">Record actual payment hitting the Receipts table.</p>

            <div className="p-4 border border-brand-200 bg-brand-50 rounded-lg dark:bg-brand-900/10 dark:border-brand-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-brand-900 dark:text-brand-100">Voucher Number</label>
                  <input type="text" placeholder="VR-..." className="w-full form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-brand-900 dark:text-brand-100">Receipt Date</label>
                  <input type="date" className="w-full form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-brand-900 dark:text-brand-100">Total Received (₹)</label>
                  <input type="number" className="w-full form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-brand-900 dark:text-brand-100">TDS Deducted (₹)</label>
                  <input type="number" placeholder="0.00" className="w-full form-input" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-brand-900 dark:text-brand-100">Bank Transaction Reference (Unique)</label>
                  <input type="text" placeholder="UTR / Cheque No" className="w-full form-input" />
                </div>
              </div>
            </div>

            <button onClick={() => handleNext('COMPLETION_REPORTS')} disabled={loading} className="btn-primary bg-brand-600 text-white">
              {loading ? 'Processing...' : 'Log Receipt & Issue Tax Invoice'}
            </button>
          </div>
        );

      case 'COMPLETION_REPORTS':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">7. Completion Reports</h3>
            <p className="text-sm text-slate-500">Upload final deliverables and notify client.</p>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Click to upload audit reports</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 10MB</p>
            </div>
            {userType === 'COLLEGE_OFFICIAL' && (
               <button onClick={() => handleNext('AMOUNT_DISTRIBUTION')} disabled={loading} className="btn-primary">
                 {loading ? 'Processing...' : 'Send Reports to Client'}
               </button>
            )}
          </div>
        );

      case 'AMOUNT_DISTRIBUTION':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">8. Revenue Distribution (70/30 Rule)</h3>
            <p className="text-sm text-slate-500">Populates Distribution_Master and Distribution_Line_Items.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-900 dark:text-indigo-200">
                <span className="block text-sm font-medium mb-1">Staff Pool (70%)</span>
                <span className="text-2xl font-bold">₹ {(Number(project.Cost_Of_Work || 0) * 0.7).toLocaleString()}</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-900 dark:text-rose-200">
                <span className="block text-sm font-medium mb-1">Institute Pool (30%)</span>
                <span className="text-2xl font-bold">₹ {(Number(project.Cost_Of_Work || 0) * 0.3).toLocaleString()}</span>
              </div>
            </div>

            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2">Payee Type</th>
                  <th className="py-2">Employee / Entity</th>
                  <th className="py-2">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2"><select className="form-input text-xs"><option>DIRECTOR</option></select></td>
                  <td className="py-2"><input type="text" placeholder="Director Name" className="form-input text-xs w-full"/></td>
                  <td className="py-2"><input type="number" placeholder="Amt" className="form-input text-xs w-full"/></td>
                </tr>
                <tr>
                  <td className="py-2"><select className="form-input text-xs"><option>PROJECT_COORDINATOR</option></select></td>
                  <td className="py-2"><input type="text" placeholder="Coordinator Name" className="form-input text-xs w-full"/></td>
                  <td className="py-2"><input type="number" placeholder="Amt" className="form-input text-xs w-full"/></td>
                </tr>
                <tr>
                  <td className="py-2"><select className="form-input text-xs"><option>PDF</option></select></td>
                  <td className="py-2"><input type="text" placeholder="PDF Allocation" className="form-input text-xs w-full"/></td>
                  <td className="py-2"><input type="number" placeholder="Amt" className="form-input text-xs w-full"/></td>
                </tr>
              </tbody>
            </table>
            
             <button onClick={() => handleNext('CLOSED')} disabled={loading} className="btn-primary w-full mt-4">
               {loading ? 'Processing...' : 'Execute Distribution & Finish'}
             </button>
          </div>
        );

      case 'CLOSED':
        return (
           <div className="space-y-6 text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-bold">Project Closed Successfully</h3>
            <p className="text-slate-500 max-w-md mx-auto">This consultancy workflow is complete. All financial records and audit logs are sealed immutably in the database.</p>
           </div>
        );
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
      <style dangerouslySetInnerHTML={{__html: `
        .form-input {
          @apply px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-primary {
          @apply px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50;
        }
        .btn-secondary {
          @apply px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50;
        }
      `}} />
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      {renderCurrentStep()}
    </div>
  );
}
