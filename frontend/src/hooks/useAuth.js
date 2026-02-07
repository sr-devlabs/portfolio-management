import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, verifyOTP, logout, fetchProfile, getCsrfToken } from "../api/auth";
import useAuthStore from "../store/authStore.js";
import Cookies from "js-cookie";

// Fetch user details on page load
export const useUserQuery = () => {
    const updateUser = useAuthStore((state) => state.updateUser);
    const setRole = useAuthStore((state) => state.setRole); // Update role in Zustand

    return useQuery({
        queryKey: ["userProfile"],
        queryFn: fetchProfile,
        enabled: !!Cookies.get("sessionid"), // Only fetch if session exists
        onSuccess: (data) => {
            updateUser(data); // ✅ Update Zustand state
            setRole(data.role); // ✅ Update role separately
        },
        onError: () => console.error("User fetch failed"),
    });
};


// Login Mutation
export const useLoginMutation = () => {
    return useMutation({
        mutationFn: login,
        onSuccess: () => console.log("Login successful, OTP sent."),
        onError: (error) => console.error("Login failed:", error.message),
    });
};

// OTP Verification Mutation
export const useVerifyOTPMutation = () => {
    const updateUser = useAuthStore((state) => state.updateUser);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: verifyOTP,
        onSuccess: async () => {
            console.log("✅ OTP verified successfully.");

            try {

                const userData = await fetchProfile();
                updateUser(userData);
                queryClient.invalidateQueries(["userProfile"]);
                console.log("✅ User profile updated after OTP verification.");
            } catch (error) {
                console.error("❌ Error fetching user profile after OTP:", error.message);
            }
        },
        onError: (error) => console.error("❌ Error verifying OTP:", error.message),
    });
};

// Logout Mutation
export const useLogoutMutation = () => {
    const clearUser = useAuthStore((state) => state.clearUser);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            clearUser(); // Clear user data from Zustand
            Cookies.remove("sessionid"); // Remove session ID
            Cookies.remove("csrftoken"); // Remove CSRF token
            queryClient.removeQueries(["userProfile"]); // Clear cached profile data
            console.log("User logged out successfully.");
        },
        onError: (error) => console.error("Logout failed:", error.message),
    });
};
