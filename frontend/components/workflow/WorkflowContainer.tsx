"use client";

import { Project, ProjectStatus } from "@/lib/types";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import {
  FacultyResponseModal,
  AgencyAcceptanceModal,
  DirectorApprovalModal,
  ProformaModal,
  TaxReceiptModal,
  CompletionReportModal,
  DistributionModal,
  CloseProjectModal
} from "./modals/StepModals";

const STEP_ENDPOINTS: Record<ProjectStatus, { endpoint: string; next: ProjectStatus } | null> = {
  'REQUEST_BY_EXTERNAL_ORG': { endpoint: 'faculty-response', next: 'RESPONSE_BY_FACULTY' },
  'RESPONSE_BY_FACULTY': { endpoint: 'agency-acceptance', next: 'AGENCY_ACCEPTANCE' },
  'AGENCY_ACCEPTANCE': { endpoint: 'director-approval', next: 'DIRECTOR_APPROVAL' },
  'DIRECTOR_APPROVAL': { endpoint: 'proforma-invoice', next: 'PROFORMA_INVOICE' },
  'PROFORMA_INVOICE': { endpoint: 'tax-invoice-receipt', next: 'TAX_INVOICE_AND_RECEIPT' },
  'TAX_INVOICE_AND_RECEIPT': { endpoint: 'completion-report', next: 'COMPLETION_REPORTS' },
  'COMPLETION_REPORTS': { endpoint: 'distribution', next: 'AMOUNT_DISTRIBUTION' },
  'AMOUNT_DISTRIBUTION': { endpoint: 'close', next: 'CLOSED' },
  'CLOSED': null,
};

export function WorkflowContainer({ project, onUpdateStatus }: { project: Project, onUpdateStatus: (s: ProjectStatus) => void }) {
  const { userType, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (payload: any) => {
    setLoading(true);
    setError("");
    const stepConfig = STEP_ENDPOINTS[project.Current_Status];
    if (!stepConfig) return;

    try {
      await api.post(`/api/consultancy/${project.Project_ID}/${stepConfig.endpoint}`, payload);
      onUpdateStatus(stepConfig.next);
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to advance workflow step.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStepInfo = () => {
    switch (project.Current_Status) {
      case 'REQUEST_BY_EXTERNAL_ORG':
        return {
          title: "Waiting for Faculty Response",
          desc: "The request has been submitted by the organization. Awaiting faculty coordinator assignment and budget formulation.",
          canAction: userType === 'COLLEGE_OFFICIAL',
          actionText: "Fill Faculty Response"
        };
      case 'RESPONSE_BY_FACULTY':
        return {
           title: "Waiting for Agency Acceptance",
           desc: "The faculty has submitted the budget. Awaiting organizations acceptance.",
           canAction: userType === 'ORGANIZATION',
           actionText: "Review & Accept Fees"
        };
      case 'AGENCY_ACCEPTANCE':
        return {
           title: "Waiting for Director Approval",
           desc: "Agency has accepted fees. Awaiting college director approval to proceed.",
           canAction: userType === 'COLLEGE_OFFICIAL' && role === 'DIRECTOR',
           actionText: "Approve Project"
        };
      case 'DIRECTOR_APPROVAL':
        return {
           title: "Waiting for Proforma Invoice",
           desc: "Director has approved. Waiting for faculty to generate proforma invoice.",
           canAction: userType === 'COLLEGE_OFFICIAL',
           actionText: "Generate Proforma"
        };
      case 'PROFORMA_INVOICE':
        return {
           title: "Waiting for Tax Invoice & Receipt",
           desc: "Proforma sent. Once client pays, log the receipt here to generate a tax invoice.",
           canAction: userType === 'COLLEGE_OFFICIAL',
           actionText: "Log Tax Receipt"
        };
      case 'TAX_INVOICE_AND_RECEIPT':
        return {
           title: "Waiting for Completion Report",
           desc: "Payment recorded. Once audit work is done, upload reports here.",
           canAction: userType === 'COLLEGE_OFFICIAL',
           actionText: "Submit Completion Report"
        };
      case 'COMPLETION_REPORTS':
        return {
           title: "Waiting for Revenue Distribution",
           desc: "Project completed. Need to distribute revenue applying the 70/30 rule.",
           canAction: userType === 'COLLEGE_OFFICIAL',
           actionText: "Perform Distribution"
        };
      case 'AMOUNT_DISTRIBUTION':
        return {
           title: "Project Ready to Close",
           desc: "Distribution completed. Project can be officially closed and archived.",
           canAction: userType === 'COLLEGE_OFFICIAL',
           actionText: "Close Project"
        };
      case 'CLOSED':
        return {
           title: "✅ Project Completed",
           desc: "This consultancy workflow has been successfully completed and archived. All steps are finalized.",
           canAction: false,
           actionText: "",
           isClosed: true
        };
    }
  };

  const stepInfo = renderCurrentStepInfo();

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h3 className="text-xl font-semibold dark:text-white">{stepInfo.title}</h3>
           <p className="text-slate-500 mt-1">{stepInfo.desc}</p>
        </div>
        
        {stepInfo.canAction ? (
           <button 
             onClick={() => setIsModalOpen(true)}
             disabled={loading}
             className="px-6 py-3 shrink-0 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-lg font-medium shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
           >
             {loading ? 'Processing...' : stepInfo.actionText}
           </button>
        ) : (stepInfo as any).isClosed ? (
           <div className="px-4 py-2 shrink-0 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
             All Steps Completed
           </div>
        ) : (
           <div className="px-4 py-2 shrink-0 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium">
             Awaiting action from {userType === 'ORGANIZATION' ? 'Faculty/Director' : 'Organization'}
           </div>
        )}
      </div>

      {project.Current_Status === 'REQUEST_BY_EXTERNAL_ORG' && (
        <FacultyResponseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
      )}
      {project.Current_Status === 'RESPONSE_BY_FACULTY' && (
        <AgencyAcceptanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} details={project} />
      )}
      {project.Current_Status === 'AGENCY_ACCEPTANCE' && (
        <DirectorApprovalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} details={project} />
      )}
      {project.Current_Status === 'DIRECTOR_APPROVAL' && (
        <ProformaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} details={project} />
      )}
      {project.Current_Status === 'PROFORMA_INVOICE' && (
        <TaxReceiptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
      )}
      {project.Current_Status === 'TAX_INVOICE_AND_RECEIPT' && (
        <CompletionReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
      )}
      {project.Current_Status === 'COMPLETION_REPORTS' && (
        <DistributionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} details={project} />
      )}
       {project.Current_Status === 'AMOUNT_DISTRIBUTION' && (
        <CloseProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
