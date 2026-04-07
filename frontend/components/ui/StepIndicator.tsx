import { ProjectStatus } from "@/lib/types";

export const workflowSteps: { id: ProjectStatus; label: string; number: number }[] = [
  { id: 'REQUEST_BY_EXTERNAL_ORG', label: 'Agency Request', number: 1 },
  { id: 'RESPONSE_BY_FACULTY', label: 'Faculty Response', number: 2 },
  { id: 'AGENCY_ACCEPTANCE', label: 'Agency Acceptance', number: 3 },
  { id: 'DIRECTOR_APPROVAL', label: 'Director Approval', number: 4 },
  { id: 'PROFORMA_INVOICE', label: 'Proforma Invoice', number: 5 },
  { id: 'TAX_INVOICE_AND_RECEIPT', label: 'Tax Inv & Receipt', number: 6 },
  { id: 'COMPLETION_REPORTS', label: 'Completion Report', number: 7 },
  { id: 'AMOUNT_DISTRIBUTION', label: 'Distribution', number: 8 },
  { id: 'CLOSED', label: 'Closed', number: 9 },
];

export function StepIndicator({ currentStatus }: { currentStatus: ProjectStatus }) {
  const currentIndex = workflowSteps.findIndex(s => s.id === currentStatus);

  return (
    <div className="w-full py-6 overflow-x-auto no-scrollbar">
      <div className="flex justify-between items-center min-w-[800px]">
        {workflowSteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.id} className="relative flex flex-col items-center flex-1">
              {/* Connecting Line */}
              {index !== 0 && (
                <div 
                  className={`absolute top-4 left-0 w-full h-[2px] -z-10 -translate-x-1/2 ${
                    isCompleted || isCurrent ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} 
                />
              )}
              
              {/* Circle */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-white dark:bg-slate-900 transition-colors ${
                  isCompleted 
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                    : isCurrent 
                      ? 'border-brand-500 bg-brand-500 text-white dark:bg-brand-600' 
                      : 'border-slate-300 dark:border-slate-600 text-slate-400'
                }`}
              >
                {step.number}
              </div>
              
              {/* Label */}
              <span className={`mt-2 text-[10px] font-medium text-center uppercase tracking-wider ${
                isCurrent ? 'text-brand-700 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
