// lib/api.ts
import axios from 'axios';

// CHANGE THIS to your actual backend URL (e.g., http://localhost:8080)
const BASE_URL = "";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 (Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Optional: Redirect to login page
        // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

// Generic fetcher for SWR
export const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);