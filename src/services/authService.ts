import apiClient, {setAccessToken, clearAuthSession, ApiErrorResponse} from "@/api/apiClient";

import { AxiosError } from "axios";

export interface RegisterPayload {
    fullName?: string;
    email: string;
    password?: string;
    gender?: string;
}

export interface LoginPayload {
    email: string;
    password?: string;
}

interface Address {
    city?: string;
    state?: string;
     street?: string;
    zipCode?: string;
    country?: string;
}

export interface UserProfile {
    _id?: string;
    id: string;
    fullName?: string;
    email: string;
    role?: string;
    avatar?: string;
    gender?: string;
    phoneNumber?: string;
    address?: Address;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    message?: string;
    token: string;
    user: UserProfile
}

export const handleApiError = (error: unknown, fallbackMessage: string): Error => {
  const err = error as AxiosError<ApiErrorResponse>;
  const message =
    err.response?.data?.message ||
    err.response?.data?.detail ||
    fallbackMessage;

  return new Error(message);
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>("/api/user/register", payload);

        if (response.data.token) {
            setAccessToken(response.data.token);
        }

        return response.data;
    } catch (error) {
        throw handleApiError(error, "Registration failed")
    }
}

export const login = async (payload: LoginPayload): Promise<AuthResponse> =>{
    try {
        const response = await apiClient.post<AuthResponse>("/api/user/login", payload);

        if (response.data.token) {
            setAccessToken(response.data.token)
        }
        return response.data;
    } catch (error) {
        throw handleApiError(error, "Login failed");
    }
};


export const logout = async (): Promise<void> =>{
    try {
        await apiClient.post("/api/user/logout");
    } catch {
        
    } finally {
        clearAuthSession();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
        }
    }
};

export const changePassword = async (currentPassword: string, newPassword: string) =>{
    try {
        const response = await apiClient.put('/api/user/change-password', {currentPassword, newPassword})
        return response.data
    } catch (error) {
        throw handleApiError(error, "Failed to change password");
    }
}

export const deleteAccount = async (): Promise<void> => {
    try{
        const response = await apiClient.delete("/api/user/profile");
        return response.data;
    }catch(error){
        throw handleApiError(error, "Failed to delete account");
    }
}