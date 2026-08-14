"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Package,
  ArrowUpRight,
  Search,
  Truck,
  UserCheck,

  IdCard,
} from "lucide-react";
import { getAllOrders, Order } from "@/services/orderService";

import { useApp } from "@/store/appStore";
import { UserProfile } from "@/services/authService";
import {
  getAllPatientCards,
  getAllUsers,
} from "@/services/userService";
import {
  AppointmentsResponse,
  getAllAppointments,
} from "@/services/bookService";
import ProductBox from "@/components/practitioner/ProductBox";
import ProductBoxSkeleton from "@/components/skeleton/ProductBoxSkeleton";


export default function PractitionerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[] | undefined>([]);
  const [appointments, setAappointments] = useState<AppointmentsResponse[]>([]);
  const [patientCardsCount, setPatientCardsCount] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const { user } = useApp();
  const isFetched = useRef(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await getAllAppointments();
        setAappointments(res.appointments);
      } catch (error) {
        console.error("failed to fetch appointments", error);
      }
    };
    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchPatientCards = async () => {
      try {
        const res = await getAllPatientCards();
        setPatientCardsCount(res.count);
      } catch (error) {
        console.error("failed to fetch patient cards data", error);
      }
    };

    fetchPatientCards();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        const data = res?.users;
        setUsers(data);
      } catch (error) {
        console.log("Failed to load Patient users", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await getAllOrders();
        setOrders(res?.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const patientUsers = users?.filter((user) => user.role === "patient");

  const patientCount = patientUsers?.length;

  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0];

  const appointmentToday = appointments.filter(
    (app) => app.date === formattedDate,
  );

  const appointmentApproved = appointmentToday.filter(
    (app) => app.status === "Approved",
  );

  const todaysAppointments = appointmentApproved?.length;

  // Calculated Order Stats
  const totalOrders = orders.length;
  const processingOrdersCount = orders.filter(
    (o) => o.orderStatus === "processing",
  ).length;
  const fulfilledOrdersCount = orders.filter(
    (o) => o.orderStatus === "delivered" || o.orderStatus === "delivered",
  ).length;

  // Calculate unique active ordering patients based on User ID or Shipping Name for guests
  const activeOrderingPatientsCount = new Set(
    orders.map(
      (o) => o.user?._id || o.shippingAddress?.fullName?.toLowerCase().trim(),
    ),
  ).size;

  // Filter orders by search term
  const filteredOrders = orders.filter((order) => {
    const nameMatch = order.shippingAddress?.fullName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const itemMatch = order.orderItems?.some((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const refMatch = order.paymentInfo?.reference
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return nameMatch || itemMatch || refMatch;
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Gbemileke Practitioner Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Dr. {user?.fullName?.split(" ")[0]}!
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            You have{" "}
            <span className="text-emerald-400 font-semibold">
              {processingOrdersCount} order(s)
            </span>{" "}
            pending processing and{" "}
            <span className="text-emerald-400 font-semibold">
              {todaysAppointments} appointment(s)
            </span>{" "}
            scheduled today.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Patients
            </span>
            <div className="p-2.5 rounded-xl border bg-indigo-500/10 text-indigo-600 border-indigo-200">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {patientCount}
            </span>
            <span className="text-xs font-semibold text-indigo-600">
              All Time
            </span>
          </div>
        </div>

        {/* 2. Patient Cards (Clinical Record Cards) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Patient Cards
            </span>
            <div className="p-2.5 rounded-xl border bg-teal-500/10 text-teal-600 border-teal-200">
              <IdCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {patientCardsCount}
            </span>
            <span className="text-xs font-semibold text-teal-600">
              Cards Issued
            </span>
          </div>
        </div>

        {/* 3. Active Ordering Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Ordering
            </span>
            <div className="p-2.5 rounded-xl border bg-purple-500/10 text-purple-600 border-purple-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {activeOrderingPatientsCount}
            </span>
            <span className="text-xs font-semibold text-purple-600">
              Customers
            </span>
          </div>
        </div>

        {/* 4. Orders Processing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Processing
            </span>
            <div className="p-2.5 rounded-xl border bg-amber-500/10 text-amber-600 border-amber-200">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {processingOrdersCount}
            </span>
            <span className="text-xs font-semibold text-amber-600">
              {totalOrders} Total
            </span>
          </div>
        </div>

        {/* 5. Completed / Dispatched */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fulfilled
            </span>
            <div className="p-2.5 rounded-xl border bg-emerald-500/10 text-emerald-600 border-emerald-200">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {fulfilledOrdersCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Dispatched
            </span>
          </div>
        </div>

        {/* 6. Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Appointments
            </span>
            <div className="p-2.5 rounded-xl border bg-rose-500/10 text-rose-600 border-rose-200">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {todaysAppointments}
            </span>
            <span className="text-xs font-semibold text-rose-600">Today</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-700" />
              Recent Patient Herbal Medicine Orders
            </h3>
            <p className="text-xs text-slate-500">
              Real-time incoming orders needing dispatch and fulfillment
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name or remedy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Orders Table List */}
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {ordersLoading ? (
            /* Render 5 skeleton rows while fetching data */
            <ProductBoxSkeleton count={5} />
          ) : filteredOrders.length === 0 ? (
            /* Render Empty State when fetch is complete and array is empty */
            <div className="p-8 text-center text-slate-400 text-sm">
              No orders matched your search criteria.
            </div>
          ) : (
            /* Render Actual Orders */
            filteredOrders
              .slice(0, 5)
              .map((order) => (
                <ProductBox
                  key={order._id}
                  order={order}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                />
              ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-center">
          <Link
            href="/practitioner/orders"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1.5"
          >
            View All Full Orders History
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
