import apiClient from "@/api/apiClient";
import { SpecialtySlug } from "./specialitiesService";

export interface GetProductsFilter {
  category?: string | string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  description: string;
  usage: string;
}

export interface GetProductsResponse {
  total: number | undefined;
  totalPages: number;
  count: number | undefined;
  totalProducts: number | undefined;
  products: Product[];
}

export interface ProductPayload {
  name: string;
  category: SpecialtySlug;
  price: number;
  stock: number;
  description: string;
  usage: string;
  image: string;
}

export const getProducts = async (
  filter?: GetProductsFilter
): Promise<GetProductsResponse> => {
  try {
    const category = Array.isArray(filter?.category)
      ? filter.category.join(",")
      : filter?.category;

    const response = await apiClient.get<GetProductsResponse>("/api/products", {
      params: {
        category,
        search: filter?.search,
        page: filter?.page,
        limit: filter?.limit,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch products data", error);
    throw error;
  }
};

export const createProduct = async (payload: FormData | ProductPayload) =>{
  const response = await apiClient.post('/api/products', payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,});
  return response.data;
}

export const updateProduct = async (id: string, payload: FormData |ProductPayload)=>{
  const response = await apiClient.put(`/api/products/${id}`, payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,});
  return response.data;
}

export const deleteProduct = async (id: string) =>{
  const response = await apiClient.delete(`/api/products/${id}`);
  return response.data;
}