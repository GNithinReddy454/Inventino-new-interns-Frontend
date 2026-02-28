"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  return function ProtectedUserRoute(props: any) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const rawUser = localStorage.getItem("inventino_user");
      const token = localStorage.getItem("token");

      if (!rawUser || !token) {
        router.replace("/login");
      } else {
        setIsAuthorized(true);
      }
    }, [router]);

    // Render nothing while checking or if unauthorized to prevent flashing
    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};
