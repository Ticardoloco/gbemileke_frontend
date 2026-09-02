/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  ShoppingBag,
  Stethoscope,
  Wallet,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getAllPatientCards, PatientCardDetails } from "@/services/userService";
import { getAllOrders, Order } from "@/services/orderService";

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "1y">("1y");
  const [cards, setCards] = useState<PatientCardDetails[]>([]);
  const [productOrders, setProductOrders] = useState<Order[]>([]);
  const [cardLoading, setCardLoading] = useState<boolean>(true);
  const [productOrderLoading, setProductOrderLoading] = useState<boolean>(true);

  // Format currency helper for Nigerian Naira
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setCardLoading(true);
        const res = await getAllPatientCards();
        setCards(res.cards || []);
      } catch (error) {
        console.error("Failed to fetch Cards", error);
      } finally {
        setCardLoading(false);
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    const fetchProductOrders = async () => {
      try {
        setProductOrderLoading(true);
        const res = await getAllOrders();
        setProductOrders(res.data || []);
      } catch (error) {
        console.error("Failed to fetch Orders", error);
      } finally {
        setProductOrderLoading(false);
      }
    };
    fetchProductOrders();
  }, []);

  // Check paid status for patient registration cards & store orders
  const isPaidRecord = (item: any) => {
    return (
      item?.paid === true ||
      item?.isPaid === true ||
      item?.paymentStatus?.toLowerCase() === "paid" ||
      item?.status?.toLowerCase() === "paid"
    );
  };

  // Check explicitly for "pending" status
  const isPendingRecord = (item: any) => {
    return (
      item?.status?.toLowerCase() === "pending" ||
      item?.orderStatus?.toLowerCase() === "pending" ||
      item?.paymentStatus?.toLowerCase() === "pending"
    );
  };

  // Filter paid patient registration cards and product orders
  const paidCards = useMemo(() => cards.filter(isPaidRecord), [cards]);
  const paidOrders = useMemo(() => productOrders.filter(isPaidRecord), [productOrders]);

  // Filter explicitly pending items
  const pendingOrders = useMemo(() => productOrders.filter(isPendingRecord), [productOrders]);
  const pendingCards = useMemo(() => cards.filter(isPendingRecord), [cards]);

  // 1. Total Patient Card Registration Revenue
  const totalCardRevenue = useMemo(() => {
    return paidCards.reduce((sum, card: any) => sum + (card.cardFee || 0), 0);
  }, [paidCards]);

  // 2. Total Store Product Sales Revenue
  const totalProductRevenue = useMemo(() => {
    return paidOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
  }, [paidOrders]);

  // 3. Total Treatment Revenue dynamically computed from card.billing
  const totalTreatmentRevenue = useMemo(() => {
    return cards.reduce((sum, card: any) => {
      const billing = card.billing;
      if (!billing) return sum;

      // Prefer explicit amount paid from billing summary or fall back to paymentHistory entries
      if (typeof billing.amountPaid === "number" && billing.amountPaid > 0) {
        return sum + billing.amountPaid;
      }

      if (Array.isArray(billing.paymentHistory)) {
        const historyTotal = billing.paymentHistory.reduce(
          (hSum: number, payment: any) => hSum + (payment.amount || 0),
          0
        );
        return sum + historyTotal;
      }

      return sum;
    }, 0);
  }, [cards]);

  // Grand Total Revenue across all streams
  const grandTotalRevenue = totalCardRevenue + totalProductRevenue + totalTreatmentRevenue;

  // Monthly breakdown of ALL revenue streams for current year
  const revenueData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    const monthlyMap: Record<
      string,
      { month: string; cards: number; products: number; treatments: number; total: number }
    > = {};

    months.forEach((m) => {
      monthlyMap[m] = { month: m, cards: 0, products: 0, treatments: 0, total: 0 };
    });

    // Aggregate Paid Patient Card Registration Fees
    paidCards.forEach((card: any) => {
      const date = new Date(card.createdAt || card.issueDate);
      if (date.getFullYear() === currentYear) {
        const monthName = months[date.getMonth()];
        monthlyMap[monthName].cards += card.cardFee || 0;
        monthlyMap[monthName].total += card.cardFee || 0;
      }
    });

    // Aggregate Store Product Orders
    paidOrders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      if (date.getFullYear() === currentYear) {
        const monthName = months[date.getMonth()];
        monthlyMap[monthName].products += order.totalAmount || 0;
        monthlyMap[monthName].total += order.totalAmount || 0;
      }
    });

    // Aggregate Treatment Payments from Card Billing
    cards.forEach((card: any) => {
      const billing = card.billing;
      if (!billing) return;

      if (Array.isArray(billing.paymentHistory) && billing.paymentHistory.length > 0) {
        billing.paymentHistory.forEach((payment: any) => {
          const date = new Date(payment.date || card.createdAt);
          if (date.getFullYear() === currentYear) {
            const monthName = months[date.getMonth()];
            monthlyMap[monthName].treatments += payment.amount || 0;
            monthlyMap[monthName].total += payment.amount || 0;
          }
        });
      } else if (typeof billing.amountPaid === "number" && billing.amountPaid > 0) {
        const date = new Date(card.updatedAt || card.createdAt);
        if (date.getFullYear() === currentYear) {
          const monthName = months[date.getMonth()];
          monthlyMap[monthName].treatments += billing.amountPaid;
          monthlyMap[monthName].total += billing.amountPaid;
        }
      }
    });

    return Object.values(monthlyMap);
  }, [cards, paidCards, paidOrders]);

  const isLoading = cardLoading || productOrderLoading;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-800">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">Financial & Operational Analytics</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time verified revenue breakdown from paid cards, herbal products, and clinic treatments.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 self-start md:self-auto overflow-x-auto max-w-full">
          {(["7d", "30d", "1y"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all whitespace-nowrap ${
                timeframe === period
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Overall Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Paid Revenue
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
              {isLoading ? "Calculating..." : formatNaira(grandTotalRevenue)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified Settled Payments</span>
            </div>
          </div>
        </div>

        {/* Patient Cards */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Patient Cards
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {cardLoading ? "Loading..." : formatNaira(totalCardRevenue)}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              {paidCards.length} Paid Cards ({pendingCards.length} Pending)
            </p>
          </div>
        </div>

        {/* Products Sold */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Products Sold
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {productOrderLoading ? "Loading..." : formatNaira(totalProductRevenue)}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              {paidOrders.length} Paid Orders ({pendingOrders.length} Pending)
            </p>
          </div>
        </div>

        {/* Treatment Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Treatment Sessions
            </span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {cardLoading ? "Loading..." : formatNaira(totalTreatmentRevenue)}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              Therapy & Consultation Billing
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Chart Container */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Paid Revenue Streams</h3>
            <p className="text-xs text-slate-500">
              Settled monthly financial growth for the current year
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600">Cards</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-600">Products</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Treatments</span>
            </div>
          </div>
        </div>

        {/* Responsive Chart Container */}
        <div className="w-full h-64 sm:h-80 md:h-96 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="treatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `₦${val / 1000}k` : `₦${val}`)}
              />
              <Tooltip
                formatter={(value: any) => [formatNaira(Number(value)), "Revenue"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="cards"
                name="Patient Cards"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cardGrad)"
              />
              <Area
                type="monotone"
                dataKey="products"
                name="Products"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#prodGrad)"
              />
              <Area
                type="monotone"
                dataKey="treatments"
                name="Treatments"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#treatGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}