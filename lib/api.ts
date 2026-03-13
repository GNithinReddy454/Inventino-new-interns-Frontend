import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

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

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Don't wipe admin sessions when the 401 is from a user-only endpoint
      // (e.g., /users/me returns 401 for admin tokens because requireAuth
      // checks the User collection, not the Admin collection).
      const requestUrl = error.config?.url || "";
      let isAdmin = false;
      try {
        const stored = localStorage.getItem("inventino_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          isAdmin = Array.isArray(parsed.permissions);
        }
      } catch { /* ignore parse errors */ }

      if (isAdmin) {
        // For admin sessions, only wipe credentials when an admin-protected
        // endpoint rejects the token (meaning the token is truly invalid).
        // User-only endpoints (e.g. /wishlist, /cart, /users/me) naturally
        // reject admin tokens — that is expected and must not clear the session.
        const isAdminEndpoint = requestUrl.includes("/admin");
        if (isAdminEndpoint) {
          localStorage.removeItem("token");
          localStorage.removeItem("inventino_user");
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("inventino_user");
      }
    }
    return Promise.reject(error);
  },
);

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url);
  return response.data;
};

export const apiMethods = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;