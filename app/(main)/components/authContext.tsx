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
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("inventino_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch { /* silently fail parsing */ }
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const resp = await apiClient.get("/users/me");
          const serverUser = resp.data?.data;
          if (serverUser) {
            setUser(serverUser);
            localStorage.setItem("inventino_user", JSON.stringify(serverUser));
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
    };
    init();
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem("inventino_user", JSON.stringify(u));
  };

  const logout = async () => {
    await authService.logoutUser();
    setUser(null);
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