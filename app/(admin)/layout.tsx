"use client";
// layout for admin — no Navbar or Footer
import { withAuth } from "@/app/components/hoc/withAuth";
import React from "react";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FEF5F1] font-sans text-foreground">
      {children}
    </div>
  );
}

export default withAuth(AdminLayout, { requiredRole: "admin" });