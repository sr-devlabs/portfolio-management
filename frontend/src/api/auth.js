import axiosInstance from './axiosInstance';

export const getCsrfToken = async () => {
    try {
        const response = await axiosInstance.get("/get_csrf/");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
        throw error;
    }
};

export const register = async (data) => {
    const response = await axiosInstance.post('register/', data);
    return response.data;
};

export const login = async (data) => {
    const response = await axiosInstance.post('login/', data);
    return response.data;
};

export const verifyOTP = async (data) => {
    const response = await axiosInstance.post('verify-otp/', data);
    return response.data;
};

export const logout = async () => {
    const response = await axiosInstance.post('logout/');
    return response.data;
};


export const fetchProfile = async () => {
    try {
        const response = await axiosInstance.get("/profile/");
        console.log("Profile Response:", response);

        if (response.data) {
            return response.data; // ✅ Return data, don't set Zustand state here
        } else {
            throw new Error("No data found in response");
        }
    } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
        throw new Error("Failed to fetch profile");
    }
};


