"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(main)/components/authContext";

export const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return function ProtectedRoute(props: P) {
    const { user } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (user === undefined) return;
      if (!user) {
        router.replace("/login");
      } else {
        setIsAuthorized(true);
      }
    }, [user, router]);

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