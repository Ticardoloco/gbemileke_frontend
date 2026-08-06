import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearAuthSession } from "@/api/apiClient";
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
          set({ user: profile, isLoadingProfile: false });
          return profile;
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          set({ isLoadingProfile: false });
          return null;
        }
      },

      // Logout: Reset state & clear auth session token
      logout: () => {
        clearAuthSession();
        set({ user: null, cart: [] });
      },

      // Cart Actions
      addToCart: (product: CartItem, quantityToAdd = 1) => {
        const { cart } = get();
        // Support both MongoDB _id and standard id
        const targetId = product._id;

        if (!targetId) {
          console.error("Cannot add item to cart without an _id or id:", product);
          return;
        }

        const existingIndex = cart.findIndex(
          (item) => item._id === targetId
        );

        if (existingIndex > -1) {
          // ✅ Immutable update
          const updatedCart = [...cart];
          const existingItem = updatedCart[existingIndex];
          
          updatedCart[existingIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + (product.quantity || quantityToAdd),
          };

          set({ cart: updatedCart });
        } else {
          // ✅ Construct safe CartItem
          const newItem: CartItem = {
            ...product,
            _id: product._id || targetId,
            quantity: product.quantity || quantityToAdd,
          };

          set({ cart: [...cart, newItem] });
        }
      },

      removeFromCart: (id: string | undefined) => {
        set({
          cart: get().cart.filter((item) => item._id !== id && item._id !== id),
        });
      },

      updateQuantity: (id: string, qty: number) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          cart: get().cart.map((item) => item._id === id
              ? { ...item, quantity: qty } // ✅ Fixed: Updates 'quantity' properly
              : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "gbemileke-app-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);