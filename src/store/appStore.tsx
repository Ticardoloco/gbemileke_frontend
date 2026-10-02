/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile } from "@/services/authService";
import { getCurrentUser } from "@/services/userService";

export interface CartItem {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  stock?: number;
  description?: string;
  usage?: string;
}

interface AppState {
  // State
  user: UserProfile | null;
  cart: CartItem[];
  isLoadingProfile: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  fetchProfile: () => Promise<UserProfile | null>;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;

  // Cart Actions
  addToCart: (product: CartItem, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      cart: [],
      isLoadingProfile: false,
      _hasHydrated: false,

      // Hydration state setter
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Set User Profile
      setUser: (user: UserProfile | null) => set({ user }),

      // Fetch User Profile directly from API and sync store
      fetchProfile: async () => {
        set({ isLoadingProfile: true });
        try {
          const profile = await getCurrentUser();

          const user: UserProfile | null =
            profile && (profile as any).user
              ? (profile as any).user
              : (profile as any) || null;

          set({ user, isLoadingProfile: false });
          return user;
        } catch (error: any) {
          if (error?.response?.status === 401 || error?.status === 401) {
            set({ user: null, isLoadingProfile: false });
            return null;
          }

          console.error("Failed to fetch user profile:", error);
          set({ isLoadingProfile: false });
          return null;
        }
      },

      // Logout: Reset store state cleanly
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user_profile");
        }
        set({ user: null, cart: [] });
      },

      // Cart Actions
      addToCart: (product: CartItem, quantityToAdd = 1) => {
        const { cart } = get();
        const targetId = product._id;

        if (!targetId) {
          console.error("Cannot add item to cart without an _id:", product);
          return;
        }

        const existingIndex = cart.findIndex((item) => item._id === targetId);

        if (existingIndex > -1) {
          const updatedCart = [...cart];
          const existingItem = updatedCart[existingIndex];

          updatedCart[existingIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + (product.quantity || quantityToAdd),
          };

          set({ cart: updatedCart });
        } else {
          const newItem: CartItem = {
            ...product,
            _id: product._id || targetId,
            quantity: product.quantity || quantityToAdd,
          };

          set({ cart: [...cart, newItem] });
        }
      },

      removeFromCart: (id: string | undefined) => {
        if (!id) return;
        set({
          cart: get().cart.filter((item) => item._id !== id),
        });
      },

      updateQuantity: (id: string, qty: number) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item._id === id ? { ...item, quantity: qty } : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "gbemileke-app-storage",
      storage: createJSONStorage(() => localStorage),
      // Prevent stale user state from persisting if token isn't present
      partialize: (state) => ({
        cart: state.cart,
        user: typeof window !== "undefined" && localStorage.getItem("token") ? state.user : null,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);