import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 (token expired) and connection/timeout errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Timeout or network-level failure (no response from server)
    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject({
        isConnectionError: true,
        message: 'Connection failed. Please try again.',
        originalError: error,
      });
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid signature often returns 403 in Spring Security
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
