import axios from 'axios';
import { clearToken } from './auth';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000'
});

// Add response interceptor
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 403) {
            clearToken();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 