"use client";

import React, { useState, useEffect } from "react";
import { ModalWrapper } from "@/components/workflow/modals/ModalWrapper";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Populate fields when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.Full_Name || "");
      setProfileUrl(user.Profile_URL || "");
      setOldPassword("");
      setNewPassword("");
      setMsg("");
      setError("");
    }
  }, [isOpen, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setSaving(true);

    try {
      const payload: Record<string, string> = { old_password: oldPassword };
      if (name !== (user?.Full_Name || "")) payload.name = name;
      if (profileUrl !== (user?.Profile_URL || "")) payload.profile_url = profileUrl;
      if (newPassword) payload.new_password = newPassword;

      const res = await api.put("/api/auth/faculty/settings", payload);
      // Update the local context with new user data
      updateUser(res.data.user);
      setMsg("Settings saved successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Account Settings">
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-200">Display Name</label>
          <input
            type="text"
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-200">Profile Image URL</label>
          <input
            type="url"
            placeholder="https://example.com/avatar.png"
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-sm"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">Leave blank to use default avatar.</p>
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-200">
            Current Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-sm"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">Required to authorize any changes.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-200">New Password</label>
          <input
            type="password"
            placeholder="Leave blank to keep current"
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        {msg && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </ModalWrapper>
  );
}
