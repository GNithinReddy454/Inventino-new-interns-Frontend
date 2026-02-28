"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import apiClient from "@/lib/api";
import { useAppDispatch } from "@/redux/store";
import { logout as logoutAction } from "@/redux/authslice";

type User = {
  name: string;
  email: string;
  phone?: string;
  dobDay?: string;
  dobMonth?: string;
  dobYear?: string;
  gender?: string;
  memberSince?: string;
  photoUrl?: string; // ← profile photo (base64 or URL)
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
      try {
        const raw = localStorage.getItem("inventino_user");
        if (raw) {
          setUser(JSON.parse(raw));
          return;
        }

        // If no local user but token exists, fetch profile from backend
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          try {
            const resp = await apiClient.get("/users/me");
            const serverUser = resp.data?.data;
            if (serverUser) {
              setUser(serverUser);
              try {
                localStorage.setItem(
                  "inventino_user",
                  JSON.stringify(serverUser),
                );
              } catch (e) {}
            }
          } catch (e) {
            // profile fetch failed (token invalid or network); ignore
          }
        }
      } catch (e) {}
    };

    init();
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

    try {
      // update redux state and let slice handle backend logout/token removal
      dispatch(logoutAction());
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
