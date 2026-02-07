import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../api/auth";
import { useEffect } from "react";
import AlertToastify from "../components/AlertToastify";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, updateUser } = useAuthStore();

    const { data: userData, isLoading, isError } = useQuery({
        queryKey: ["userProfile"],
        queryFn: fetchProfile,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (userData && user?.id !== userData?.id) {
            updateUser(userData);
        }
    }, [userData, updateUser, user?.id]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading user data...</div>;
    }

    if (isError || !userData?.id) {
        AlertToastify({ message: "User not authenticated. Please log in.", type: "error" });
        return <Navigate to="/" replace />;
    }

    const userRole = userData?.role;
    if (!allowedRoles.includes(userRole)) {
        AlertToastify({ message: "Unauthorized access!", type: "danger" });
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
