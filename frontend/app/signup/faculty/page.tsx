"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function FacultySignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [designation, setDesignation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{ Department_ID: number; Department_Name: string }[]>([]);
  const [roles, setRoles] = useState<{ Role_ID: number; Role_Name: string }[]>([]);
  const { signupFaculty, loginFaculty } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fetch departments and roles for dropdowns
    api.get("/api/consultancy/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => {
        // Fallback if API not available yet
        setDepartments([
          { Department_ID: 1, Department_Name: "Computer Engineering" },
          { Department_ID: 2, Department_Name: "Civil Engineering" },
        ]);
      });
    api.get("/api/consultancy/roles")
      .then((res) => setRoles(res.data))
      .catch(() => {
        setRoles([
          { Role_ID: 2, Role_Name: "HOD" },
          { Role_ID: 3, Role_Name: "PROJECT_COORDINATOR" },
          { Role_ID: 4, Role_Name: "SUPPORT_STAFF" },
        ]);
      });
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signupFaculty({
        full_name: fullName,
        email,
        password,
        department_id: parseInt(departmentId),
        role_id: parseInt(roleId),
        designation,
      });
      // After signup, login to get full user data
      await loginFaculty(email, password);
      router.push("/dashboard/college");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel */}
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-white">Faculty Registration</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Register as a college official.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
              <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g., Professor" className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.Department_ID} value={d.Department_ID}>{d.Department_Name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required>
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.Role_ID} value={r.Role_ID}>{r.Role_Name.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 text-sm rounded-lg transition-colors mt-4 disabled:opacity-50">
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account? <Link href="/login/faculty" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden md:flex flex-col justify-center items-center bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-12 relative overflow-hidden border-l border-slate-200 dark:border-slate-800">
        <div className="z-10 max-w-md">
          <GraduationCap className="w-16 h-16 text-brand-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Join as Faculty</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage consultancy projects, approve budgets, generate invoices, and track financial distributions—all from one dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
