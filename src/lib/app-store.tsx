/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  initialAppointments,
  initialOrders,
  initialPatients,
  initialProducts,
  type MockAppointment,
  type MockOrder,
  type MockPatient,
  type Product,
} from './mock-data';

export interface CartItem { product: Product; qty: number }
export interface User { name: string; email: string; role: "patient" | "admin" }

interface AppState {
  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;

  cart: CartItem[];
  addToCart: (p: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;

  products: Product[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  appointments: MockAppointment[];
  addAppointment: (a: Omit<MockAppointment, "id" | "status">) => void;
  updateAppointment: (id: string, patch: Partial<MockAppointment>) => void;

  patients: MockPatient[];
  addPatientNote: (id: string, note: string, author: string) => void;
  addPatientRx: (id: string, product: string, dosage: string) => void;

  orders: MockOrder[];
  updateOrder: (id: string, patch: Partial<MockOrder>) => void;
  placeOrder: (customer: string, items: CartItem[]) => void;
}

const Ctx = createContext<AppState | null>(null);

function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
    }
  }, [key, state, hydrated]);

  return [state, setState] as const;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalState<User | null>("gtm.user", null);
  const [cart, setCart] = useLocalState<CartItem[]>("gtm.cart", []);
  const [products, setProducts] = useLocalState<Product[]>("gtm.products", initialProducts);
  const [appointments, setAppointments] = useLocalState<MockAppointment[]>("gtm.appointments", initialAppointments);
  const [patients, setPatients] = useLocalState<MockPatient[]>("gtm.patients", initialPatients);
  const [orders, setOrders] = useLocalState<MockOrder[]>("gtm.orders", initialOrders);

  const value: AppState = {
    user,
    signIn: setUser,
    signOut: () => setUser(null),

    cart,
    addToCart: (p, qty = 1) =>
      setCart((c) => {
        const found = c.find((i) => i.product.id === p.id);
        if (found) return c.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + qty } : i));
        return [...c, { product: p, qty }];
      }),
    removeFromCart: (id) => setCart((c) => c.filter((i) => i.product.id !== id)),
    updateQty: (id, qty) =>
      setCart((c) => c.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i))),
    clearCart: () => setCart([]),

    products,
    addProduct: (p) => setProducts((ps) => [...ps, { ...p, id: `p${Date.now()}` }]),
    updateProduct: (id, patch) => setProducts((ps) => ps.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    deleteProduct: (id) => setProducts((ps) => ps.filter((x) => x.id !== id)),

    appointments,
    addAppointment: (a) =>
      setAppointments((xs) => [...xs, { ...a, id: `A-${2000 + xs.length + 10}`, status: "Pending" }]),
    updateAppointment: (id, patch) =>
      setAppointments((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x))),

    patients,
    addPatientNote: (id, note, author) =>
      setPatients((ps) =>
        ps.map((p) =>
          p.id === id
            ? { ...p, history: [{ date: new Date().toISOString().slice(0, 10), note, author }, ...p.history] }
            : p,
        ),
      ),
    addPatientRx: (id, product, dosage) =>
      setPatients((ps) =>
        ps.map((p) =>
          p.id === id
            ? {
                ...p,
                prescriptions: [
                  { date: new Date().toISOString().slice(0, 10), product, dosage },
                  ...p.prescriptions,
                ],
              }
            : p,
        ),
      ),

    orders,
    updateOrder: (id, patch) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o))),
    placeOrder: (customer, items) => {
      const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
      const itemStr = items.map((i) => `${i.product.name} ×${i.qty}`).join(", ");
      setOrders((os) => [
        {
          id: `O-${3000 + os.length + 10}`,
          customer,
          items: itemStr,
          total,
          date: new Date().toISOString().slice(0, 10),
          status: "Pending",
        },
        ...os,
      ]);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}