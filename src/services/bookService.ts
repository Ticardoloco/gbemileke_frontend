import apiClient from "@/api/apiClient";
import { PatientType } from "./userService";

export type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Cancelled"
  | "Rejected"
  | "Completed";

export interface BookingPayload{
    specialty: string;
    date: string;
    time: string;
    type: "In-person" | "Virtual";
    symptoms: string;
}
export interface AppointmentsResponse{
    _id: string;
    patient: PatientType;
    specialty: string;
    date: string;
    time: string;
    type: "In-person" | "Virtual";
    symptoms: string;
    rejectionReason: string;
    status: AppointmentStatus;
    createdAt: string;
}

export interface UpdateStatusPayload {
    status: AppointmentStatus;
    rejectionReason: string;
}

export const postBooking = async (payload: BookingPayload) =>{
    const response = await apiClient.post("/api/bookings", payload);
    return response.data;
}

export const getAppointments = async (): Promise<{message: string; count: number; appointments: AppointmentsResponse[] }> =>{
    try {
        const response = await apiClient.get<{message: string; count: number; appointments: AppointmentsResponse[] }>("/api/bookings/my-appointments");
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getAllAppointments = async (): Promise<{message: string; count: number; appointments: AppointmentsResponse[]} > =>{
    try {
        const response = await apiClient.get<{message: string; count: number; appointments: AppointmentsResponse[] }>("/api/bookings");
        return response.data
    } catch (error) {
        throw error;
    }
}

export const getAppointmentById = async (id: string): Promise<{message: string; appointment: AppointmentsResponse }> =>{
    try{
        const response = await apiClient.get<{message: string; appointment: AppointmentsResponse }>(`/api/bookings/${id}`);
        return response.data
    } catch(error){
        throw error;
    }
}

export const cancelAppointment = async (id: string): Promise<{message: string; appointment: AppointmentsResponse }> =>{
    try{
        const response = await apiClient.patch<{message: string; appointment: AppointmentsResponse }>(`/api/bookings/${id}/status`, {status: "Cancelled"});
        return response.data
    } catch (error){
        throw error;
    }
}

export const updateStatus = async (id: string, payload: UpdateStatusPayload): Promise<{ message: string; appointment: AppointmentsResponse }> =>{
    const response = await apiClient.patch<{ message: string; appointment: AppointmentsResponse }>(`/api/bookings/${id}/status`, payload);
    return response.data;
}