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
    avatar: string;
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

export interface SessionType {
    _id: string;
    title: string;
    cost: number;
    isClosed: boolean;
    createdBy?: Author;
    date: string | Date;
}

export interface PaymentHistoryType {
    _id: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    date: string | Date;
}

export interface BillingType {
    _id?: string;
    totalAmount: number;
    amountPaid: number;
    paymentStatus: "paid" | "partially_paid" | "unpaid" | string;
    sessions: SessionType[];
    paymentHistory: PaymentHistoryType[];
}


export interface PatientCardDetails {
    createdAt: string | undefined;
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
    prescriptions: PrescriptionsType[] | PrescriptionsType;
    billing?: BillingType;
    outstandingBalance?: number;
}

export interface PatientCardResponse{
    success: boolean;
    count: number;
    cards: PatientCardDetails[];
}

export interface PatientCardPayload{
    reference: string;
    specialty: string;
    dateOfBirth: string | Date;
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

export interface MedicalHistoryPayload {
    note: string;
}
export interface PrescriptionPayload {
    product: string;
    dosage: string;
}

export interface BillingSessionsPayload{
    title: string;
    cost: number;
    notes: string;
} 

export interface BillingPaymentPayload{
    amount: number;
    paymentMethod: string;
    reference: string;
}


export const getCurrentUser = async ():Promise<{user:UserProfile}> =>{
    const response = await apiClient.get<{user:UserProfile}>("/api/user/profile");
    return response.data
};
export const getAllUsers = async (): Promise<{users: UserProfile[]} | undefined>=>{
    try {
        const response = await apiClient.get<{users: UserProfile[]}>("/api/user");
        return response.data
    } catch (error) {
        console.log("Failed to fetch users", error);  
    }
}

export const updateProfile = async(payload: FormData | UpdateProfilePayload): Promise<{user: UserProfile}> =>{
    const isFormData = payload instanceof FormData;
    const response = await apiClient.put<{user: UserProfile}>("/api/user/profile", payload,
        {
            headers: isFormData
                ? { "Content-Type": "multipart/form-data" }
                : undefined,
        }
    );
    
    return response.data;
}


export const getPatientCard = async (filter?: FilterCard): Promise<PatientCardResponse> => {
  const response = await apiClient.get<PatientCardResponse>("/api/patient-cards/me", {
    params: filter?.specialty ? { specialty: filter.specialty } : undefined,
  });
  return response.data; 
};

export const getAllPatientCards = async (): Promise<PatientCardResponse> =>{
    const response = await apiClient.get<PatientCardResponse>("/api/patient-cards");
    return response.data
}

export const getPatientCardById = async (id: string): Promise<{card: PatientCardDetails}> =>{
    const response = await apiClient.get<{card: PatientCardDetails}>(`/api/patient-cards/${id}`);
    return response.data
}

export const postMedicalHistory = async (id: string, payload: MedicalHistoryPayload) =>{
    const response = await apiClient.post(`/api/patient-cards/${id}/history`, payload)
    return response.data
}

export const updateMedicalHistory = async (id: string, historyId:string, payload: MedicalHistoryPayload)=>{
    const response = await apiClient.put(`/api/patient-cards/${id}/history/${historyId}`, payload)
    return response.data;
}

export const deleteMedicalHistory = async (id: string, historyId:string)=>{
    const response = await apiClient.delete(`/api/patient-cards/${id}/history/${historyId}`)
    return response.data;
}

export const postPrescriptions = async (id: string, payload: PrescriptionPayload)=>{
    const response = await apiClient.post(`/api/patient-cards/${id}/prescriptions`, payload);
    return response.data
}

export const updatePrescription = async (id: string, prescriptionId: string, payload: PrescriptionPayload)=>{
    const response = await apiClient.put(`/api/patient-cards/${id}/prescriptions/${prescriptionId}`, payload)
    return response.data;
}

export const deletePrescription = async (id: string, prescriptionId: string)=>{
    const response = await apiClient.delete(`/api/patient-cards/${id}/prescriptions/${prescriptionId}`)
    return response.data;
}

export const postBillingSessions = async (id: string, payload: BillingSessionsPayload)=>{
    const response = await apiClient.post(`/api/patient-cards/${id}/billing/sessions`, payload);

    return response.data
}

export const updateBillingSessions = async (id: string, sessionId: string, payload: BillingSessionsPayload) =>{
    const response = await apiClient.put(`/api/patient-cards/${id}/billing/sessions/${sessionId}`, payload)

    return response.data
}

export const postBillingPayment = async (id: string, payload: BillingPaymentPayload) =>{
    const response = await apiClient.post(`/api/patient-cards/${id}/billing/payments`, payload)

    return response.data
}

export const postPatientCard = async(payload?: PatientCardPayload): Promise<PatientCardDetails> => {
    const response = await apiClient.post<PatientCardDetails>("/api/patient-cards/verify-payment", payload);
    return response.data;
}

export const initializePayment = async (payload: InitializePaymentPayload): Promise<InitializePaymentResponse> => {
    const response = await apiClient.post<InitializePaymentResponse>("/api/patient-cards/initialize-payment", payload);
    return response.data;
}

