import apiClient from "@/api/apiClient";
import { UserProfile } from "./authService";

export interface UpdateProfilePayload {
    fullName?: string;
    phoneNumber?: string;
    gender?: string;
    avatar?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string; 
}

interface PaitentType {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

interface Author{
    _id: string;
    fullName: string;
    role: string;
}

interface HistoryType{
    date: string;
    note: string;
    author: Author;
    _id: string;
}

interface PrescriptionsType{
    date: Date;
    product: string;
    dosage: string;
    _id: string;
}


export interface PatientCardDetils{
 _id: string;
 patient: PaitentType;
 age: number;
 maritalStatus: string;
 nextOfKinName: string;
 nextOfKinPhone: string;
 stateOfOrigin: string;
 specialty: string;
 isPaid: boolean;
 paymentReference: string;
 cardFee: number;
 history: HistoryType[];
 prescriptions: PrescriptionsType;
}

export interface PatientCardPayload{
    reference: string;
    specialty: string;
    age: number;
    maritalStatus: string;
    nextOfKinName: string;
    nextOfKinPhone: string;
    stateOfOrigin: string;
}

export interface InitializePaymentPayload{
    specialty: string;
}

export interface InitializePaymentResponse{
    success: boolean;
    authorizationUrl: string;
    reference: string;
}

export const getCurrentUser = async ():Promise<UserProfile> =>{
    const response = await apiClient.get<UserProfile>("/api/user/profile");
    return response.data
};

export const updateProfile = async(payload: UpdateProfilePayload): Promise<UserProfile> =>{
    const response = await apiClient.put<UserProfile>("/api/user/profile", payload);
    return response.data;
}

export const getPatientCard = async (): Promise<PatientCardDetils> =>{
    const response = await apiClient.get<PatientCardDetils>("/api/patient-card/me");
    return response.data;
}

export const postPatientCard = async(payload?: PatientCardPayload): Promise<PatientCardDetils> => {
    const response = await apiClient.post<PatientCardDetils>("/api/patient-cards/verify-payment", payload);
    return response.data;
}

export const initializePayment = async (payload: InitializePaymentPayload): Promise<InitializePaymentResponse> => {
    const response = await apiClient.post<InitializePaymentResponse>("/api/patient-cards/initialize-payment", payload);
    return response.data;
}