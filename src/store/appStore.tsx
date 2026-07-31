import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearAuthSession } from "@/api/apiClient";
import { UserProfile } from "@/services/authService"; // or your user service
import { getCurrentUser } from "@/services/userService";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
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
  addToCart: (item: CartItem) => void;
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
      setUser: (user) => set({ user }),

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
      addToCart: (item) => {
        const { cart } = get();
        const existingIndex = cart.findIndex((i) => i.id === item.id);
        if (existingIndex > -1) {
          const updated = [...cart];
          updated[existingIndex].qty += item.qty || 1;
          set({ cart: updated });
        } else {
          set({ cart: [...cart, { ...item, qty: item.qty || 1 }] });
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.id === id ? { ...item, qty } : item
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