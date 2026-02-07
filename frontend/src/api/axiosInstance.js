import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,  // Ensures cookies (including CSRF) are sent
});

let isFetchingCSRF = false;

// Function to fetch CSRF token when missing or expired
const fetchCsrfToken = async () => {
    if (isFetchingCSRF) return;  // Prevent multiple requests
    isFetchingCSRF = true;

    try {
        await axiosInstance.get("/get_csrf/");
        console.log("🔄 CSRF Token refreshed:", Cookies.get("csrftoken"));
    } catch (error) {
        console.error("❌ Failed to refresh CSRF token:", error);
    } finally {
        isFetchingCSRF = false;
    }
};

// Request Interceptor: Ensures CSRF token is always present
axiosInstance.interceptors.request.use(
    async (config) => {
        let csrfToken = Cookies.get("csrftoken");

        // Fetch CSRF token if missing
        if (!csrfToken) {
            console.warn("⚠️ CSRF token missing, fetching...");
            await fetchCsrfToken();
            csrfToken = Cookies.get("csrftoken");
        }

        // Attach CSRF token to request headers
        config.headers["X-CSRFToken"] = csrfToken || "";
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Detect CSRF Expiration and Retry
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If CSRF error, refresh token and retry once
        if (error.response?.status === 403 && !originalRequest._retry) {
            console.warn("🔄 CSRF token expired, refreshing...");
            originalRequest._retry = true;
            await fetchCsrfToken();
            return axiosInstance(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
