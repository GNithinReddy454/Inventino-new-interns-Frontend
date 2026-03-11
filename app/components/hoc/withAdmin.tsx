"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(main)/components/authContext";

export const withAdmin = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return function ProtectedAdminRoute(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (loading) return;
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "admin") {
        router.replace("/");
      } else {
        setIsAuthorized(true);
      }
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