import apiClient from "@/api/apiClient";

export interface TestimonialPayload{
    name: string;
    care: string;
    message: string;
    rating: number;
    isApproved: boolean;
    isFeatured: boolean;
}
export interface TestimonialResponse {
    _id: string;
    name: string;
    care: string;
    message: string,
    rating: string;
    isApproved: boolean;
    isFeatured: boolean;
    createdAt: string;
}


export const postTestimonial = async (payload: TestimonialPayload) =>{
    const response = await apiClient.post("/api/testimonials", payload);
    return response.data;
}

export const getApprovedTestimonial = async (): Promise<{message: string, count: number, testimonials: TestimonialResponse[]}> =>{
try {
    const response = await apiClient.get<{message: string, count: number, testimonials: TestimonialResponse[]}>("/api/testimonials")

    return response.data;
} catch (error) {
    throw error
}
}


export const getAllTestimonials = async (): Promise<{message: string, count: number, testimonials: TestimonialResponse[]}>=>{
    try {
        const response = await apiClient.get<{message: string, count: number, testimonials: TestimonialResponse[]}>("/api/testimonials/admin/all");
         return response.data
    } catch (error) {
        throw error;
    }
}

export const triggerApproveTestimonial = async (id:string, payload: TestimonialPayload)=>{
    const response = await apiClient.patch(`/api/testimonials/${id}/approve`, payload);
    return response.data;
}
export const triggerFeatureTestimonial = async (id:string, payload: TestimonialPayload)=>{
    const response = await apiClient.patch(`/api/testimonials/${id}/feature`, payload);
    return response.data;
}

export const deleteTestimonial = async (id:string)=>{
    const response = await apiClient.delete(`/api/testimonials/${id}`);
    return response.data;
}



