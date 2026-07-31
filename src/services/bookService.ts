import apiClient from "@/api/apiClient";

export interface BookingPayload{
    specialty: string;
    date: string;
    time: string;
    type: "In-person" | "Virtual";
    symptoms: string;
}

export const postBooking = async (payload: BookingPayload) =>{
    const response = await apiClient.post("/api/bookings", payload);
    return response.data;
}