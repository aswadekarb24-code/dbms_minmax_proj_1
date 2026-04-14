"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FacultyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginFaculty } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginFaculty(email, password);
      router.push("/dashboard/college");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gold-500 rounded-full blur-[100px] opacity-20"></div>
        <div className="z-10 text-center max-w-md">
          <Image
            src="/vjti.jpg"
            alt="VJTI Logo"
            width={120}
            height={120}
            className="mx-auto mb-8 rounded-full shadow-2xl border-4 border-white/20"
          />
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Faculty Portal</h1>
          <p className="text-brand-100 text-lg">Sign in to manage consultancy projects, approvals, and distributions.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl">
          <div className="md:hidden flex justify-center mb-6">
            <Image src="/vjti.jpg" alt="VJTI Logo" width={64} height={64} className="rounded-full shadow-lg" />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-white">Faculty Sign In</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your registered email and password.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white primary-ring"
                  placeholder="faculty@vjti.ac.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white primary-ring"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In as Faculty"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup/faculty" className="text-brand-600 dark:text-brand-300 font-medium hover:underline">
              Register as Faculty
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link href="/login" className="text-slate-600 dark:text-slate-400 hover:underline">
              ← Back to login options
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
