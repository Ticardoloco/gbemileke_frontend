import apiClient from "@/api/apiClient";

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
  user?: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  itemsPrice?: number;
  deliveryFee?: number;
  totalAmount?: number;
  isPaid?: boolean;
  orderStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
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

export interface OrdersResponse {
  success: boolean;
  data: Order[];
}

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  try {
    const response = await apiClient.post<CreateOrderResponse>("/api/orders", payload);
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
}