"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { X, Save, Loader2, User, Settings, BadgeCheck, Building, Briefcase, Wallet, Calendar, Mail, Hash } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  Employee_ID: number;
  Full_Name: string;
  Email: string;
  Designation: string;
  Department_Name: string;
  Role_Name: string;
  PDF_Balance: number;
  Profile_URL: string | null;
  Created_At: string | null;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"settings" | "profile">("settings");

  // Settings form state
  const [name, setName] = useState(user?.Full_Name || "");
  const [profileUrl, setProfileUrl] = useState(user?.Profile_URL || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile data state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("settings");
      setMessage(null);
      setOldPassword("");
      setNewPassword("");
      setProfile(null);
    } else {
      setName(user?.Full_Name || "");
      setProfileUrl(user?.Profile_URL || "");
    }
  }, [isOpen, user]);

  // Fetch profile data when profile tab is selected
  useEffect(() => {
    if (activeTab === "profile" && !profile) {
      setProfileLoading(true);
      api.get("/api/auth/faculty/profile")
        .then((res) => setProfile(res.data))
        .catch(() => setProfile(null))
        .finally(() => setProfileLoading(false));
    }
  }, [activeTab, profile]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = {};
      if (name && name !== user?.Full_Name) payload.full_name = name;
      if (profileUrl !== (user?.Profile_URL || "")) payload.profile_url = profileUrl;
      if (oldPassword && newPassword) {
        payload.old_password = oldPassword;
        payload.new_password = newPassword;
      }
      if (Object.keys(payload).length === 0) {
        setMessage({ type: "error", text: "No changes to save." });
        setSaving(false);
        return;
      }
      await api.put("/api/auth/faculty/settings", payload);
      setMessage({ type: "success", text: "Settings updated successfully." });
      setOldPassword("");
      setNewPassword("");
      if (name) updateUser({ Full_Name: name, Profile_URL: profileUrl || undefined });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to update settings.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const formatRoleName = (role: string) => 
    role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      });
    } catch { return dateStr; }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {/* Tab Switcher */}
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              Profile Info
            </button>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === "settings" ? (
            /* ── Settings Tab ── */
            <div className="space-y-5">
              {message && (
                <div className={`p-3 rounded-lg text-sm border ${
                  message.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                }`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white primary-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Picture URL</label>
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white primary-ring"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <hr className="border-slate-200 dark:border-slate-700" />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white primary-ring"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white primary-ring"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            /* ── Profile Info Tab ── */
            <div>
              {profileLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading profile...
                </div>
              ) : profile ? (
                <div className="space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center overflow-hidden border-2 border-brand-200 dark:border-brand-800">
                      {profile.Profile_URL ? (
                        <img src={profile.Profile_URL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-brand-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{profile.Full_Name}</h3>
                      <p className="text-sm text-gold-600 dark:text-gold-400 font-medium">{profile.Designation}</p>
                    </div>
                  </div>

                  {/* Detail Rows */}
                  <ProfileRow icon={<Hash className="w-4 h-4" />} label="Employee ID" value={`#${profile.Employee_ID}`} />
                  <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile.Email} />
                  <ProfileRow icon={<BadgeCheck className="w-4 h-4" />} label="Role" value={formatRoleName(profile.Role_Name)} />
                  <ProfileRow icon={<Building className="w-4 h-4" />} label="Department" value={profile.Department_Name} />
                  <ProfileRow icon={<Briefcase className="w-4 h-4" />} label="Designation" value={profile.Designation} />
                  <ProfileRow icon={<Wallet className="w-4 h-4" />} label="PDF Balance" value={`₹ ${profile.PDF_Balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} />
                  <ProfileRow icon={<Calendar className="w-4 h-4" />} label="Member Since" value={formatDate(profile.Created_At)} />
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Could not load profile information.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="text-brand-500 dark:text-brand-300">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
