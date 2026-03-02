import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * Environment Configuration
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

/**
 * Create Axios Instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Change to true if using cookies
});

/**
 * Request Interceptor
 * Adds Authorization Token Automatically
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * Response Interceptor
 * Handles Global API Errors (401, 500, etc.)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");

      // Optional redirect (uncomment if needed)
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

/**
 * Generic Fetcher (For SWR / React Query) - GET requests only
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url);
  return response.data;
};

/**
 * Global API Request Methods - can be used with SWR or directly
 */
export const apiMethods = {
  // GET request
  get: async <T>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  // PUT request (full update)
  put: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request (partial update)
  patch: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;
