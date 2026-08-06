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

export interface PatientType {
    _id: string;
    fullName: string;
    email: string;
    gender?: string;
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


export interface PatientCardDetails{
 _id: string;
 patient: PatientType;
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

export interface PatientCardResponse{
    success: boolean;
    count: number;
    cards: PatientCardDetails[];
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

 interface FilterCard{
    specialty?: string;
}

export const getCurrentUser = async ():Promise<UserProfile> =>{
    const response = await apiClient.get<UserProfile>("/api/user/profile");
    return response.data
};

export const updateProfile = async(payload: UpdateProfilePayload): Promise<UserProfile> =>{
    const response = await apiClient.put<UserProfile>("/api/user/profile", payload);
    return response.data;
}


export const getPatientCard = async (filter?: FilterCard): Promise<PatientCardResponse> => {
  const response = await apiClient.get<PatientCardResponse>("/api/patient-cards/me", {
    params: filter?.specialty ? { specialty: filter.specialty } : undefined,
  });
  return response.data; 
};

export const postPatientCard = async(payload?: PatientCardPayload): Promise<PatientCardDetails> => {
    const response = await apiClient.post<PatientCardDetails>("/api/patient-cards/verify-payment", payload);
    return response.data;
}

export const initializePayment = async (payload: InitializePaymentPayload): Promise<InitializePaymentResponse> => {
    const response = await apiClient.post<InitializePaymentResponse>("/api/patient-cards/initialize-payment", payload);
    return response.data;
}