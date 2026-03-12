"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import apiClient from "@/lib/api";
import { useAppDispatch } from "@/redux/store";
import { logout as logoutAction } from "@/redux/authslice";
import { User as BaseUser } from "@/lib/types";
import { authService } from "@/services/auth.service";
import { fetchCart, addToCart as reduxAddToCart } from "@/redux/cartslice";
import { useToast } from "@/app/components/GlobalToast";

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
   const { showToast } = useToast();

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

              // ── Returning logged-in user: load their server cart ────────────
              await dispatch(fetchCart());
              // ────────────────────────────────────────────────────────────────
            }
          }
        } catch {
          // Token is invalid/blacklisted — clear everything silently
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

  const login = async (u: User) => {
    setUser(u);
    localStorage.setItem("inventino_user", JSON.stringify(u));

    // ── Merge guest localStorage cart into server cart ──────────────────────
    try {
      // 1. Read guest cart BEFORE fetching server cart
      const raw = localStorage.getItem("cart");
      const guestItems: any[] = raw ? JSON.parse(raw) : [];

      // 2. Fetch the user's server cart
      await dispatch(fetchCart());

      // 3. Push each guest item into the server cart
      if (guestItems.length > 0) {
        for (const item of guestItems) {
          const productId = String(item._id || item.id);
          const quantity = item.quantity || 1;
          await dispatch(reduxAddToCart({ productId, quantity }));
        }

        // 4. Clear guest cart from localStorage after merging
        localStorage.removeItem("cart");
      }
    } catch (err) {
      console.error("Cart merge failed:", err);
    }
    // ────────────────────────────────────────────────────────────────────────
  };

  const logout = async () => {
    // Clear token FIRST so next page load never tries a blacklisted token
    const isAdmin = user && Array.isArray((user as any).permissions);
    localStorage.removeItem("token");
    localStorage.removeItem("inventino_user");
    localStorage.removeItem("cart");
    setUser(null);
    dispatch(logoutAction());
    showToast("Logged out", "Logged out Successfully", "success");

    // Tell server to blacklist the token (best-effort)
    // Admin tokens require /admin/logoutadmin; regular tokens use /auth/logout.
    try {
      if (isAdmin) {
        await authService.logoutAdmin();
      } else {
        await authService.logoutUser();
      }
    } catch {
      // Already cleared locally — safe to ignore
    }
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