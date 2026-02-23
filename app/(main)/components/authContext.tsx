"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = {
  name: string;
  email: string;
  phone?: string;
  dobDay?: string;
  dobMonth?: string;
  dobYear?: string;
  gender?: string;
  memberSince?: string;
  photoUrl?: string;   // ← profile photo (base64 or URL)
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("inventino_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const login = (u: User) => {
    setUser(u);
    try {
      localStorage.setItem("inventino_user", JSON.stringify(u));
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("inventino_user");
    } catch (e) {}
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      localStorage.setItem("inventino_user", JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export default AuthContext;
