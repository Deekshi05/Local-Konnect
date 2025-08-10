import axios from "axios"
import { ACCESS_TOKEN } from "./constants" 

const api = axios.create({
    baseURL: "http://localhost:8000/api"
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem(ACCESS_TOKEN);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api