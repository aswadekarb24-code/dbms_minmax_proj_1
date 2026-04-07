"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, FileText } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { ProjectStatus } from "@/lib/types";

interface ProjectData {
  Project_ID: number;
  Project_Number: string;
  Project_Title: string;
  Current_Status: ProjectStatus;
  Cost_Of_Work: number;
}

export default function CollegeDashboard() {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/consultancy/projects")
      .then((res) => setProjects(res.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (!user || !('Full_Name' in user)) return null;

  const metrics = [
    { label: "Active Consultancies", value: projects.length.toString(), icon: FileText, color: "text-brand-500", bg: "bg-brand-50" },
    { label: "Pending Approvals", value: role === 'DIRECTOR' ? projects.filter(p => p.Current_Status === 'DIRECTOR_APPROVAL').length.toString() : "0", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Total Cost of Work", value: `₹ ${projects.reduce((sum, p) => sum + Number(p.Cost_Of_Work || 0), 0).toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500 rounded-full blur-[80px] opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.Full_Name}</h1>
          <p className="text-slate-300 max-w-2xl">
            You are logged in as <span className="font-semibold text-brand-400">{user.Designation}</span>. 
            {role === 'PROJECT_COORDINATOR' && user.PDF_Balance !== undefined && ` Your current PDF balance is ₹${Number(user.PDF_Balance).toLocaleString()}.`}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${m.bg} dark:bg-slate-800`}>
              <m.icon className={`w-8 h-8 ${m.color} dark:brightness-125`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{m.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{m.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Projects</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading projects...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Project Number</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Estimated Cost</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((p) => (
                  <tr key={p.Project_ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.Project_Number}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={p.Project_Title}>
                      {p.Project_Title}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.Current_Status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      ₹ {Number(p.Cost_Of_Work || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/dashboard/projects/${p.Project_ID}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const getBadgeStyle = (s: ProjectStatus) => {
    if (s.includes('REQUEST')) return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
    if (s.includes('CLOSED') || s.includes('COMPLETION')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
    return 'bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300 border-brand-200 dark:border-brand-500/30';
  };

  const formattedName = status.replace(/_/g, ' ').toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getBadgeStyle(status)}`}>
      {formattedName}
    </span>
  );
}
