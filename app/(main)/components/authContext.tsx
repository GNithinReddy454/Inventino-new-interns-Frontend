"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import apiClient from "@/lib/api";
import { useAppDispatch } from "@/redux/store";
import { logout as logoutAction } from "@/redux/authslice";
import { User as BaseUser } from "@/lib/types";
import { authService } from "@/services/auth.service";

type User = BaseUser & {
  dobDay?: string;
  dobMonth?: string;
  dobYear?: string;
  gender?: string;
  memberSince?: string;
  photoUrl?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("inventino_user");
      let parsedUser: User | null = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch { /* silently fail parsing */ }
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Admin tokens cause /users/me to return 401 because requireAuth
          // middleware looks in the User collection, not the Admin collection.
          // Detect admin users by the permissions field (only admins have it)
          // and validate via an admin-protected endpoint instead.
          const isAdmin = parsedUser && Array.isArray((parsedUser as any).permissions);

          if (isAdmin) {
            const resp = await apiClient.get("/admin/dashboard");
            const adminData = resp.data?.data?.admin;
            if (adminData) {
              setUser(adminData);
              localStorage.setItem("inventino_user", JSON.stringify(adminData));
            }
          } else {
            const resp = await apiClient.get("/users/me");
            const serverUser = resp.data?.data;
            if (serverUser) {
              setUser(serverUser);
              localStorage.setItem("inventino_user", JSON.stringify(serverUser));
            }
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("inventino_user");
          setUser(null);
          dispatch(logoutAction());
        }
      } else {
        localStorage.removeItem("inventino_user");
        setUser(null);
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem("inventino_user", JSON.stringify(u));
  };

  const logout = async () => {
    // Admin tokens require /admin/logoutadmin (requireAdmin middleware).
    // Regular user tokens use /auth/logout (requireAuth middleware).
    // Using the wrong endpoint means the token is never blacklisted.
    const isAdmin = user && Array.isArray((user as any).permissions);
    if (isAdmin) {
      await authService.logoutAdmin();
    } else {
      await authService.logoutUser();
    }
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("inventino_user");
    dispatch(logoutAction());
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("inventino_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};