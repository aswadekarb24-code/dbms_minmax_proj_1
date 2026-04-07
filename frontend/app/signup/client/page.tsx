"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Building2, Landmark, Mail, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";

export default function ClientSignupPage() {
  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gstin, setGstin] = useState("");
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signupClient, loginClient } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signupClient({
        organization_name: orgName,
        contact_person_name: contactPerson,
        contact_number: phone,
        contact_email: email,
        password,
        gstin_uin: gstin || null,
        state_name: stateName,
        state_code: stateCode,
        office_address: address,
      });
      // Login after signup to get full user data
      await loginClient(email, password);
      router.push("/dashboard/organization");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 order-2 md:order-1">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-white">Organization Registration</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Register to request consultancy services.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN / UIN</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">State Code</label>
                <input type="text" value={stateCode} onChange={(e) => setStateCode(e.target.value)} placeholder="e.g., 27" className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Office Address</label>
              <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-600 primary-ring" required></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 text-sm rounded-lg transition-colors mt-4 disabled:opacity-50">
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account? <Link href="/login/client" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden md:flex flex-col justify-center items-center bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-12 relative overflow-hidden order-1 md:order-2 border-l border-slate-200 dark:border-slate-800">
        <div className="z-10 max-w-md">
          <Building2 className="w-16 h-16 text-emerald-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Join as an Organization</h1>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Request quality audits and consultancy services digitally.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track invoices, receipts, and project progress in real time.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
