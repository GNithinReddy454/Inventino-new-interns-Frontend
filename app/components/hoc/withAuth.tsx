"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(main)/components/authContext";

type WithAuthOptions = {
  requiredRole?: string;
};

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: WithAuthOptions
) => {
  return function ProtectedRoute(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (loading) return;
      if (!user) {
        router.replace("/login");
        return;
      }

      if (options?.requiredRole) {
        const isRoleMatch =
          user.role === options.requiredRole ||
          (options.requiredRole === "admin" && Array.isArray((user as any).permissions));

        if (!isRoleMatch) {
          router.replace("/");
          return;
        }
      }

      setIsAuthorized(true);
    }, [user, loading, router]);

    if (!isAuthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};