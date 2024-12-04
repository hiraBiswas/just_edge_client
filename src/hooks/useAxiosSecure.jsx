import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "./useAxiosPublic";
import { useEffect } from "react";

const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { logOut } = useAxiosPublic();

    // Create axios instance only once
    const axiosSecure = axios.create({
        baseURL: 'http://localhost:5000'
    });

    useEffect(() => {
        // Setup interceptors only once
        const requestInterceptor = axiosSecure.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access-token');
                if (token) {
                    config.headers.authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axiosSecure.interceptors.response.use(
            (response) => response,
            async (error) => {
                const status = error.response?.status;

                if (status === 401 || status === 403) {
                    await logOut();
                    navigate('/login');
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptors
        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
        };
    }, [logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;