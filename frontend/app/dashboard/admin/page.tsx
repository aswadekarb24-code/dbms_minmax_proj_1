"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function AdminDashboard() {
  const { userType } = useAuth();
  
  const [directorData, setDirectorData] = useState({
    name: "", email: "", password: "", designation: "Director"
  });

  const [deptData, setDeptData] = useState({
    department_name: "",
    hod_name: "", hod_email: "", hod_password: "", hod_designation: "Professor & HOD",
    coord_name: "", coord_email: "", coord_password: "", coord_designation: "Associate Professor"
  });

  const [dirMsg, setDirMsg] = useState("");
  const [deptMsg, setDeptMsg] = useState("");

  if (userType !== 'ADMIN') return null;

  const handleDirectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDirMsg("");
    try {
      const res = await api.post("/api/admin/director", directorData);
      setDirMsg("✅ " + res.data.message);
      setDirectorData({ name: "", email: "", password: "", designation: "Director" });
    } catch (err: any) {
      setDirMsg("❌ " + (err.response?.data?.detail || "Error adding director"));
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptMsg("");
    try {
      const res = await api.post("/api/admin/department-bundle", deptData);
      setDeptMsg("✅ " + res.data.message);
      setDeptData({
        department_name: "",
        hod_name: "", hod_email: "", hod_password: "", hod_designation: "Professor & HOD",
        coord_name: "", coord_email: "", coord_password: "", coord_designation: "Associate Professor"
      });
    } catch (err: any) {
      setDeptMsg("❌ " + (err.response?.data?.detail || "Error adding department bundle"));
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Admin Data Seeding</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Carefully set up the core institution data. Every department must have an HOD and a Coordinator to satisfy the process integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Director Form */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Set Director</h2>
          <form onSubmit={handleDirectorSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium dark:text-slate-300">Name</label>
                <input required type="text" className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" 
                  value={directorData.name} onChange={e => setDirectorData({...directorData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-slate-300">Email</label>
                <input required type="email" className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" 
                  value={directorData.email} onChange={e => setDirectorData({...directorData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-slate-300">Password</label>
                <input required type="password" className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" 
                  value={directorData.password} onChange={e => setDirectorData({...directorData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-slate-300">Designation</label>
                <input required type="text" className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" 
                  value={directorData.designation} onChange={e => setDirectorData({...directorData, designation: e.target.value})} />
              </div>
            </div>
            {dirMsg && <p className="text-sm font-medium">{dirMsg}</p>}
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors">
              Add Director
            </button>
          </form>
        </div>

        {/* Department Bundle Form */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add Department Bundle</h2>
          <form onSubmit={handleDeptSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium dark:text-slate-300">Department Name</label>
              <input required type="text" className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" 
                value={deptData.department_name} onChange={e => setDeptData({...deptData, department_name: e.target.value})} placeholder="e.g., Computer Science" />
            </div>

            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 space-y-4">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-300">Head of Department (HOD)</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div><input required placeholder="Name" type="text" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" value={deptData.hod_name} onChange={e => setDeptData({...deptData, hod_name: e.target.value})}/></div>
                 <div><input required placeholder="Email" type="email" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" value={deptData.hod_email} onChange={e => setDeptData({...deptData, hod_email: e.target.value})}/></div>
                 <div><input required placeholder="Password" type="password" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" value={deptData.hod_password} onChange={e => setDeptData({...deptData, hod_password: e.target.value})}/></div>
                 <div><input required placeholder="Designation" type="text" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" value={deptData.hod_designation} onChange={e => setDeptData({...deptData, hod_designation: e.target.value})}/></div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 space-y-4">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Primary Coordinator</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div><input required placeholder="Name" type="text" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" value={deptData.coord_name} onChange={e => setDeptData({...deptData, coord_name: e.target.value})}/></div>
                 <div><input required placeholder="Email" type="email" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" value={deptData.coord_email} onChange={e => setDeptData({...deptData, coord_email: e.target.value})}/></div>
                 <div><input required placeholder="Password" type="password" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" value={deptData.coord_password} onChange={e => setDeptData({...deptData, coord_password: e.target.value})}/></div>
                 <div><input required placeholder="Designation" type="text" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" value={deptData.coord_designation} onChange={e => setDeptData({...deptData, coord_designation: e.target.value})}/></div>
              </div>
            </div>

            {deptMsg && <p className="text-sm font-medium">{deptMsg}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Create Department Bundle
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
