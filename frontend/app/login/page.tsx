"use client";

import Link from "next/link";
import { Building2, GraduationCap } from "lucide-react";

export default function LoginLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-2xl w-full text-center">
        <GraduationCap className="w-16 h-16 mx-auto mb-6 text-brand-500" />
        <h1 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
          TPQA Platform
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12 text-lg">
          Academic Consultancy &amp; Third-Party Quality Audit Management
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Faculty Card */}
          <Link
            href="/login/faculty"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500 transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
              <GraduationCap className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              College Faculty
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Login as Director, HOD, Project Coordinator, or Support Staff.
            </p>
          </Link>

          {/* Organization Card */}
          <Link
            href="/login/client"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
              <Building2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Organization / Client
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Login as an external organization requesting consultancy services.
            </p>
          </Link>
        </div>

        <div className="mt-10 space-y-4 text-sm text-slate-500 dark:text-slate-400">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign up
            </Link>
          </p>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <Link href="/admin" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-1">
              <Building2 className="w-3 h-3" />
              Administrative Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
