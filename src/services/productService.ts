import apiClient from "@/api/apiClient";

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