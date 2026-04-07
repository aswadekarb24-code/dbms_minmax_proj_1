"use client";

import Link from "next/link";
import { Building2, GraduationCap } from "lucide-react";

export default function SignupLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
          Create an Account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12 text-lg">
          Join the TPQA platform to manage consultancy projects.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/signup/faculty"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500 transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 transition-colors">
              <GraduationCap className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Faculty Registration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register as a college official to manage and coordinate projects.
            </p>
          </Link>

          <Link
            href="/signup/client"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
              <Building2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Organization Registration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register your organization to request quality audits and consultancy.
            </p>
          </Link>
        </div>

        <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
