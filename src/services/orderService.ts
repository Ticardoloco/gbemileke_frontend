import apiClient from "@/api/apiClient";
import { UserProfile } from "./authService";

export interface OrderItem {
  _id?: string;
  product?: string;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
}

export interface PaymentInfo {
  paymentMethod: "paystack" | "card" | "transfer" | string;
  reference?: string;
  accessCode?: string;
  authorizationUrl?: string;
  currency?: "NGN" | string;
  paystackStatus?: "pending" | "success" | "failed" | string;
}

export interface Order {
  _id?: string;
  user?: UserProfile;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  itemsPrice?: number;
  deliveryFee?: number;
  totalAmount?: number;
  isPaid?: boolean;
  orderStatus?:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
}

// Paystack response structure nested inside backend data
export interface CreateOrderData {
  order: Order;
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

// Complete backend wrapper response
export interface CreateOrderResponse {
  success: boolean;
  data: CreateOrderData;
}

export interface UpdateDelivery {
  deliveryFee: number;
}

export interface OrdersResponse {
  success: boolean;
  count?: number;
  data: Order[];
}

export interface OrderStatusPayload{
  orderStatus:   "processing" | "shipped" | "delivered";
}

export interface CancelOrderPayload{
  cancellationReason: string;
}
export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> => {
  try {
    const response = await apiClient.post<CreateOrderResponse>(
      "/api/orders",
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getMyOrders = async (): Promise<OrdersResponse> => {
  try {
    const response = await apiClient.get<OrdersResponse>("/api/orders/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<OrdersResponse> => {
  try {
    const response = await apiClient.get<OrdersResponse>("/api/orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

export const updateDeliveryFee = async (id: string | undefined, payload: UpdateDelivery) =>{
  const response = await apiClient.put(`/api/orders/${id}/delivery-fee`, payload);
  return response.data;
}

export const updateOrderStatus = async (id: string | undefined, payload: OrderStatusPayload)=>{
  const response = await apiClient.put(`/api/orders/${id}/status`, payload);
  return response.data;
}

export const cancelOrder = async (id: string, payload:CancelOrderPayload)=>{
  const response = await apiClient.put(`/api/orders/${id}/cancel`, payload);
  return response.data
}
