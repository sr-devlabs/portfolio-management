import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logout as logoutAPI } from "../api/auth"; // Import logout API function
import AlertToastify from "../components/AlertToastify";

const Logout = () => {
    const navigate = useNavigate();

    const logoutMutation = useMutation({
        mutationFn: logoutAPI,
        onSuccess: () => {
            AlertToastify({ message: "Logged out successfully", type: "danger" });
            navigate("/");
        },
        onError: (error) => {
            AlertToastify({ message: error.message || "Logout failed", type: "error" });
        }
    });

    useEffect(() => {
        logoutMutation.mutate();
    }, []);

    return null;
};

export default Logout;
