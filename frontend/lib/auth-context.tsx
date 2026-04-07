"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

type UserType = 'COLLEGE_OFFICIAL' | 'ORGANIZATION' | null;
type RoleType = 'DIRECTOR' | 'HOD' | 'PROJECT_COORDINATOR' | 'SUPPORT_STAFF';

interface AuthUser {
  // Faculty fields
  Employee_ID?: number;
  Full_Name?: string;
  Designation?: string;
  PDF_Balance?: number;
  Role_Name?: RoleType;
  Email?: string;
  // Client fields
  Client_ID?: number;
  Organization_Name?: string;
  Contact_Email?: string;
  GSTIN_UIN?: string | null;
  Office_Address?: string;
  Contact_Person_Name?: string;
  Contact_Number?: string;
  State_Name?: string;
  State_Code?: string;
}

interface AuthContextType {
  userType: UserType;
  user: AuthUser | null;
  role: RoleType | null;
  loading: boolean;
  loginFaculty: (email: string, password: string) => Promise<void>;
  loginClient: (email: string, password: string) => Promise<void>;
  signupFaculty: (data: Record<string, unknown>) => Promise<void>;
  signupClient: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userType: null,
  user: null,
  role: null,
  loading: true,
  loginFaculty: async () => {},
  loginClient: async () => {},
  signupFaculty: async () => {},
  signupClient: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userType, setUserType] = useState<UserType>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<RoleType | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUserType = localStorage.getItem('user_type') as UserType;
    const savedUser = localStorage.getItem('user_data');

    if (token && savedUserType && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserType(savedUserType);
        setUser(parsed);
        if (savedUserType === 'COLLEGE_OFFICIAL') {
          setRole(parsed.Role_Name || null);
        }
      } catch {
        // Corrupted data, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const loginFaculty = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login/faculty', { email, password });
    const { access_token, user_type, user: userData } = res.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_type', user_type);
    localStorage.setItem('user_data', JSON.stringify(userData));

    setUserType(user_type);
    setUser(userData);
    setRole(userData.Role_Name || null);
  };

  const loginClient = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login/client', { email, password });
    const { access_token, user_type, user: userData } = res.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_type', user_type);
    localStorage.setItem('user_data', JSON.stringify(userData));

    setUserType(user_type);
    setUser(userData);
    setRole(null);
  };

  const signupFaculty = async (data: Record<string, unknown>) => {
    const res = await api.post('/api/auth/signup/faculty', data);
    const { access_token, user_type } = res.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_type', user_type);
    // After signup, we don't get full user data back, so we call login
    setUserType(user_type);
  };

  const signupClient = async (data: Record<string, unknown>) => {
    const res = await api.post('/api/auth/signup/client', data);
    const { access_token, user_type } = res.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_type', user_type);
    setUserType(user_type);
  };

  const handleLogout = () => {
    setUserType(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{
      userType,
      user,
      role,
      loading,
      loginFaculty,
      loginClient,
      signupFaculty,
      signupClient,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
