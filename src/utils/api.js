import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle nested data and errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Centralized error handling can be added here
    return Promise.reject(error);
  }
);

export default api;
