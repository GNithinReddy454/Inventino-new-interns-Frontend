'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const withAdmin = (WrappedComponent: React.ComponentType<any>) => {
    return function ProtectedAdminRoute(props: any) {
        const router = useRouter();
        const [isAuthorized, setIsAuthorized] = useState(false);

        useEffect(() => {
            const rawUser = localStorage.getItem("inventino_user");
            const token = localStorage.getItem("token");

            if (!rawUser || !token) {
                router.replace('/login');
                return;
            }

            try {
                const user = JSON.parse(rawUser);
                if (user.role === 'admin') {
                    setIsAuthorized(true);
                } else {
                    router.replace('/'); // Redirect non-admins to home
                }
            } catch (e) {
                router.replace('/login');
            }
        }, [router]);

        // Render nothing while checking or if unauthorized to prevent flashing
        if (!isAuthorized) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};
