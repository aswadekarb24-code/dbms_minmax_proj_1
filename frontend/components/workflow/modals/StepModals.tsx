"use client";

import React, { useState, useEffect } from "react";
import { ModalWrapper } from "./ModalWrapper";
import api from "@/lib/api";

export function CreateRequestModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
  const [data, setData] = useState({ Project_Title: "", Est_Person_Days: "", Contract_Period: "", Liability_Period: "", Department_ID: "" });
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get("/api/consultancy/departments")
        .then(res => setDepartments(res.data.filter((d: any) => d.Department_Name.toLowerCase() !== "administration")))
        .catch(console.error);
    }
  }, [isOpen]);
  
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Request Consultancy / Audit">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-200">Department <span className="text-red-500">*</span></label>
          <select className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" 
            value={data.Department_ID} onChange={e => setData({...data, Department_ID: e.target.value})}>
            <option value="" disabled>Select a department</option>
            {departments.map(d => (
              <option key={d.Department_ID} value={d.Department_ID}>{d.Department_Name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-200">Project Title <span className="text-red-500">*</span></label>
          <input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" 
            value={data.Project_Title} onChange={e => setData({...data, Project_Title: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Est. Person Days</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" onChange={e => setData({...data, Est_Person_Days: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Contract Period</label><input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" onChange={e => setData({...data, Contract_Period: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Liability Period</label><input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" onChange={e => setData({...data, Liability_Period: e.target.value})} /></div>
        </div>
        <button onClick={() => onSubmit(data)} className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-all">Submit Request</button>
      </div>
    </ModalWrapper>
  );
}

export function FacultyResponseModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
  const [data, setData] = useState({ Coordinator_ID: 1, Proposed_Fee_Pct: 15.0, Est_Faculty_Fees: 0, Est_External_Fees: 0, Operational_Exp: 0 });
  
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Faculty Response & Budgeting">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Coordinator ID</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" value={data.Coordinator_ID} onChange={e => setData({...data, Coordinator_ID: Number(e.target.value)})} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Proposed Fee %</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" value={data.Proposed_Fee_Pct} onChange={e => setData({...data, Proposed_Fee_Pct: Number(e.target.value)})} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Est. Faculty Fees (₹)</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" value={data.Est_Faculty_Fees} onChange={e => setData({...data, Est_Faculty_Fees: Number(e.target.value)})} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Est. External Fees (₹)</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" value={data.Est_External_Fees} onChange={e => setData({...data, Est_External_Fees: Number(e.target.value)})} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1 dark:text-slate-200">Operational Exp (₹)</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" value={data.Operational_Exp} onChange={e => setData({...data, Operational_Exp: Number(e.target.value)})} /></div>
        </div>
        <button onClick={() => onSubmit(data)} className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-all">Submit Budget Settings</button>
      </div>
    </ModalWrapper>
  );
}

export function AgencyAcceptanceModal({ isOpen, onClose, onSubmit, details }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; details: any }) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Agency Acceptance">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50">
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">The faculty has proposed the following fee structure:</p>
          <p className="mt-2 text-emerald-800 dark:text-emerald-200">Total Project Cost: <strong>₹ {Number(details?.Cost_Of_Work || 0).toLocaleString()}</strong></p>
        </div>
        <p className="text-sm dark:text-slate-300">By accepting this, you agree to proceed to director approval and subsequent invoicing.</p>
        <button onClick={() => onSubmit({ accepted: true })} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all">Accept Terms</button>
      </div>
    </ModalWrapper>
  );
}

export function DirectorApprovalModal({ isOpen, onClose, onSubmit, details }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; details: any }) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Director Approval">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
           <p className="text-sm font-medium mb-1 dark:text-slate-200">Project Cost: ₹ {Number(details?.Cost_Of_Work || 0).toLocaleString()}</p>
        </div>
        <button onClick={() => onSubmit({ approved: true })} className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all">Approve Project</button>
      </div>
    </ModalWrapper>
  );
}

export function ProformaModal({ isOpen, onClose, onSubmit, details }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; details: any }) {
  const taxable = Number(details?.Cost_Of_Work || 0);
  const tax = taxable * 0.18;
  const [data, setData] = useState({ HSN_SAC_Code: "998311", Taxable_Value: taxable, Tax_Amount: tax });
  
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Generate Proforma Invoice">
       <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">HSN/SAC Code</label><input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" value={data.HSN_SAC_Code} onChange={e => setData({...data, HSN_SAC_Code: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Taxable Value</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" value={data.Taxable_Value} onChange={e => setData({...data, Taxable_Value: Number(e.target.value)})} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1 dark:text-slate-200">Tax Amount (18% GST default)</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" value={data.Tax_Amount} onChange={e => setData({...data, Tax_Amount: Number(e.target.value)})} /></div>
          </div>
          <button onClick={() => onSubmit(data)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all">Generate Proforma</button>
       </div>
    </ModalWrapper>
  );
}

export function TaxReceiptModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
  const [data, setData] = useState({ Voucher_Number: "", Receipt_Date: "", Total_Received: 0, TDS_Deducted: 0, Bank_Trans_Ref: "" });
  
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Log Tax Receipt">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Voucher Number</label><input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" onChange={e => setData({...data, Voucher_Number: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Receipt Date</label><input type="date" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" onChange={e => setData({...data, Receipt_Date: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Total Received</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" onChange={e => setData({...data, Total_Received: Number(e.target.value)})} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">TDS Deducted</label><input type="number" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" onChange={e => setData({...data, TDS_Deducted: Number(e.target.value)})} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1 dark:text-slate-200">Bank Trans Ref</label><input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" onChange={e => setData({...data, Bank_Trans_Ref: e.target.value})} /></div>
        </div>
        <button onClick={() => onSubmit(data)} className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-all">Submit Receipt</button>
      </div>
    </ModalWrapper>
  );
}

export function CompletionReportModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Completion Report">
      <div className="space-y-4">
        <p className="text-sm dark:text-slate-300">Upload documents and physically complete progress.</p>
        <div><label className="block text-sm font-medium mb-1 dark:text-slate-200">Report URL Mock</label><input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50" defaultValue="url_to_file" /></div>
        <button onClick={() => onSubmit({ report_url: "url_to_file" })} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">Mark Completed</button>
      </div>
    </ModalWrapper>
  );
}

export function DistributionModal({ isOpen, onClose, onSubmit, details }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; details: any }) {
  const staffPool = Number(details?.Cost_Of_Work || 0) * 0.7;
  const instPool = Number(details?.Cost_Of_Work || 0) * 0.3;
  const [dist, setDist] = useState([
     { Payee_Type: 'PROJECT_COORDINATOR', Employee_ID: 1, Allocated_Amt: staffPool },
     { Payee_Type: 'OFFICE_SHARE', Employee_ID: null, Allocated_Amt: instPool }
  ]);
  
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Revenue Distribution">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 w-1/2">
             <div className="text-xs">Staff Pool 70%</div>
             <div className="font-bold">₹ {staffPool.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 w-1/2">
             <div className="text-xs">Institute Pool 30%</div>
             <div className="font-bold">₹ {instPool.toLocaleString()}</div>
          </div>
        </div>
        <p className="text-xs text-slate-500">Auto-filled based on generic 70/30 split. Make sure total adds up to Total Receipts.</p>
        <button onClick={() => onSubmit({ distributions: dist })} className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-all">Finalize Distribution</button>
      </div>
    </ModalWrapper>
  );
}

export function CloseProjectModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Close Project">
      <div className="space-y-4">
        <p className="text-sm dark:text-slate-300">Are you sure you want to seal and archive this project?</p>
         <button onClick={() => onSubmit({})} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all">Close Project</button>
      </div>
    </ModalWrapper>
  );
}
