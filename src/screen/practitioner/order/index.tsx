"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllOrders, Order } from "@/services/orderService";
import ProductBoxSkeleton from "@/components/skeleton/ProductBoxSkeleton";
import ProductCard from "@/components/practitioner/ProductCard";

const ITEMS_PER_PAGE = 8;

export default function ProductOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isFetched = useRef(false);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await getAllOrders();
      setOrders(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;
    fetchOrders();
  }, []);

  // Reset pagination to page 1 when filter or search changes
  useEffect(() => {
    const currentPageTrigger = ()=>{
      setCurrentPage(1);
    }
    currentPageTrigger();
  }, [searchQuery, statusFilter]);

  // Filter orders based on status tab and search term
  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (statusFilter !== "all") {
      const currentStatus = (order.orderStatus || "pending").toLowerCase();
      if (currentStatus !== statusFilter) return false;
    }

    // Search Query Filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    const nameMatch = order.shippingAddress?.fullName?.toLowerCase().includes(query);
    const streetMatch = order.shippingAddress?.streetAddress?.toLowerCase().includes(query);
    const cityMatch = order.shippingAddress?.city?.toLowerCase().includes(query);
    const itemMatch = order.orderItems?.some((item) =>
      item.name?.toLowerCase().includes(query)
    );
    const refMatch = order.paymentInfo?.reference?.toLowerCase().includes(query);

    return nameMatch || streetMatch || cityMatch || itemMatch || refMatch;
  });

  // Calculate Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Calculate quick status counts for filter badges
  const totalCount = orders.length;
  const pendingCount = orders.filter(
    (o) => (o.orderStatus || "pending").toLowerCase() === "pending"
  ).length;
  const processingCount = orders.filter((o) => o.orderStatus === "processing").length;
  const shippedCount = orders.filter((o) => o.orderStatus === "shipped").length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;
  const cancelledCount = orders.filter((o) => o.orderStatus === "cancelled").length;

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/practitioner/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-700" />
            Patient Product Orders
          </h1>
          <p className="text-xs text-slate-500">
            Manage, fulfill, and update dispatch statuses for incoming remedy orders.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={ordersLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? "animate-spin" : ""}`} />
          Refresh Orders
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
        {/* Search Bar & Filter Tabs Header */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, address, remedy, or payment ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredOrders.length > 0 ? startIndex + 1 : 0}-
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)}
              </span>{" "}
              of <span className="font-bold text-slate-900">{filteredOrders.length}</span>{" "}
              filtered ({totalCount} total)
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Orders ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("processing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "processing"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Processing ({processingCount})
            </button>
            <button
              onClick={() => setStatusFilter("shipped")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "shipped"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Shipped ({shippedCount})
            </button>
            <button
              onClick={() => setStatusFilter("delivered")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "delivered"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Delivered ({deliveredCount})
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>
        </div>

        {/* Orders Table List */}
        <div className="divide-y divide-slate-100 min-h-[300px]">
          {ordersLoading ? (
            <ProductBoxSkeleton count={ITEMS_PER_PAGE} />
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-slate-500 font-medium text-sm">
                No orders match your filter criteria.
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="text-xs font-bold text-emerald-700 underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            paginatedOrders.map((order) => (
              <ProductCard
                key={order._id}
                order={order}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                onRefresh={fetchOrders}
              />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!ordersLoading && filteredOrders.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 rounded-b-2xl">
            <div className="text-xs text-slate-500 font-medium">
              Page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <div className="hidden sm:flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show max 5 page buttons to prevent clutter
                  if (
                    totalPages > 5 &&
                    Math.abs(page - currentPage) > 2 &&
                    page !== 1 &&
                    page !== totalPages
                  ) {
                    if (Math.abs(page - currentPage) === 3) {
                      return (
                        <span key={page} className="text-slate-400 text-xs px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? "bg-emerald-700 text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}