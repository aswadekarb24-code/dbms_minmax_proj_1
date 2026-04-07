"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { Building2, FileText, GraduationCap, LayoutDashboard, LogOut, Receipt } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userType, user, role, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  // Protect route
  if (!userType) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = userType === 'COLLEGE_OFFICIAL' 
    ? [
        { name: 'Dashboard', href: '/dashboard/college', icon: LayoutDashboard },
        { name: 'Projects', href: '#', icon: FileText },
        { name: 'Receipts & Dist.', href: '#', icon: Receipt },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard/organization', icon: LayoutDashboard },
        { name: 'My Requests', href: '#', icon: FileText },
      ];

  const NameDisplay = userType === 'COLLEGE_OFFICIAL' 
    ? user?.Full_Name || 'Faculty'
    : user?.Organization_Name || 'Organization';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-brand-400" />
          <span className="font-bold text-xl tracking-tight">TPQA Platform</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-brand-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-brand-400">
              {userType === 'COLLEGE_OFFICIAL' ? <UserIcon/> : <Building2 className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{NameDisplay}</p>
              <p className="text-xs text-brand-400 truncate">{role || 'Client'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-6 justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white capitalize">
            {pathname.split('/').pop()}
          </h2>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}
