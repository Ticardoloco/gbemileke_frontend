import { _config } from "@/config/env";
import { UserProfile } from "@/services/authService";
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

export interface ApiErrorResponse {
    message?: string;
    detail?: string;
}

export const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("token");
};

export const setAccessToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
}

export const getStoredUser = (): UserProfile | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user_profile");
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: UserProfile): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("user_profile", JSON.stringify(user));
};

export const clearAuthSession = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem("user_profile");
}


export const apiClient: AxiosInstance = axios.create({
    baseURL: _config.baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiErrorResponse>) =>{
        const isLoginRequest = error.config?.url?.includes('/login');
        if(error.response?.status === 401 && !isLoginRequest) {
            clearAuthSession();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
