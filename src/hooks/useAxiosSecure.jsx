import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const axiosSecure = axios.create({
    baseURL: 'http://localhost:5000/'
});

const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { logOut } = useAuth();

    // Request interceptor to add authorization header for every secure call to the API
    axiosSecure.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('access-token');
            if (token) {
                // If token exists, add Authorization header
                config.headers.authorization = `Bearer ${token}`;
            } else {
                // Optionally log out if there's no token and navigate to login
                console.warn("No access token found, user might need to log in.");
            }
            return config;
        },
        (error) => {
            // Handle any errors in the request
            console.error("Error with the request:", error);
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle errors such as 401, 403, 404, etc.
    axiosSecure.interceptors.response.use(
        (response) => {
            // Successfully received response
            return response;
        },
        async (error) => {
            // Log the error details for debugging
            console.error("Response error:", error);
            if (error.response) {
                const status = error.response.status;
                console.error("Response status:", status);

                // Handle specific HTTP error statuses
                if (status === 401 || status === 403) {
                    // Unauthorized or Forbidden: Log the user out and redirect to login
                    await logOut();
                    navigate('/login');
                } else if (status === 404) {
                    // Not Found: Provide feedback if the API endpoint is not found
                    console.error("API endpoint not found: ", error.response.config.url);
                } else if (status === 500) {
                    // Internal Server Error
                    console.error("Internal server error. Please try again later.");
                } else {
                    console.error("Unexpected error status: ", status);
                }
            } else {
                // If no response, it's likely a network error
                console.error("Network error or server is down");
            }
            return Promise.reject(error);
        }
    );

    return axiosSecure;
};

export default useAxiosSecure;
