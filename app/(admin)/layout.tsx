"use client";
// Bare layout for admin — no Navbar or Footer
import { withAdmin } from "@/app/components/hoc/withAdmin";
import React from "react";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {children}
    </div>
  );
}

export default withAdmin(AdminLayout);
