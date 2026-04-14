"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import Image from "next/image";

export default function SignupLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-2xl w-full text-center">
        <Image
          src="/vjti.jpg"
          alt="VJTI Logo"
          width={80}
          height={80}
          className="mx-auto mb-6 rounded-full shadow-lg border-2 border-brand-100 dark:border-brand-800"
        />
        <h1 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
          Create an Account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12 text-lg">
          Join the VJTI Consultancy platform to manage projects.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/signup/faculty"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500 transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 dark:text-brand-300"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Faculty Registration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register as a college official to manage and coordinate projects.
            </p>
          </Link>

          <Link
            href="/signup/client"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-gold-500 dark:hover:border-gold-500 transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-100 transition-colors">
              <Building2 className="w-7 h-7 text-gold-600 dark:text-gold-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Organization Registration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register your organization to request quality audits and consultancy.
            </p>
          </Link>
        </div>

        <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 dark:text-brand-300 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
