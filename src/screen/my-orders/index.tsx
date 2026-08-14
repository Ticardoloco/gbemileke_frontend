/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  getMyOrders,
  cancelOrder,
  Order,
  OrderItem,
  OrdersResponse,
} from "@/services/orderService";
import FilterSearch from "@/components/my-order/FilterSearch";
import OrderBox from "@/components/my-order/OrderBox";

const ITEMS_PER_PAGE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderLoading, setOrderLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Cancellation State
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrderLoading(true);
        const response = await getMyOrders();
        const dataArray = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setOrders(dataArray);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Reset to page 1 whenever tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Reset modal state when selectedOrder changes
  useEffect(() => {
    setShowCancelInput(false);
    setCancelReason("");
  }, [selectedOrder]);

  // 1. Safe Normalized Array Guard
  const ordersList = useMemo(() => {
    if (Array.isArray(orders)) return orders;
    if (orders && Array.isArray((orders as OrdersResponse).data)) {
      return (orders as OrdersResponse).data;
    }
    return [];
  }, [orders]);

  // 2. Filtered Logic (EXCLUDE CANCELLED FROM UNPAID)
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "unpaid"
          ? !order.isPaid && order.orderStatus !== "cancelled"
          : order.orderStatus === activeTab);

      const matchesSearch =
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.paymentInfo?.reference
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.orderItems?.some((item: OrderItem) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesTab && matchesSearch;
    });
  }, [ordersList, activeTab, searchQuery]);

  // 3. Paginated Subset
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // 4. Aggregate Stats (EXCLUDE CANCELLED FROM UNPAID COUNT)
  const stats = useMemo(() => {
    const paidCount = ordersList.filter((o) => o.isPaid).length;
    const unpaidCount = ordersList.filter(
      (o) => !o.isPaid && o.orderStatus !== "cancelled"
    ).length;

    return { paidCount, unpaidCount, total: ordersList.length };
  }, [ordersList]);

  // Handle Cancel Order Handler
  const handleCancelOrder = async () => {
    if (!selectedOrder?._id) return;
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    try {
      setIsCancelling(true);
      await cancelOrder(selectedOrder._id, { cancellationReason: cancelReason });

      // Update state locally
      const updatedStatus = "cancelled";
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === selectedOrder._id
            ? { ...ord, orderStatus: updatedStatus }
            : ord
        )
      );

      setSelectedOrder((prev) =>
        prev ? { ...prev, orderStatus: updatedStatus } : null
      );

      setShowCancelInput(false);
      setCancelReason("");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Could not cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const renderStatusBadge = (status: string | undefined, isPaid?: boolean) => {
    const normalizedStatus = status ?? "unknown";
    const paid = Boolean(isPaid);

    // 1. Check for cancelled status FIRST before unpaid check
    if (normalizedStatus === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 border border-red-500/20">
          <XCircle className="h-3.5 w-3.5" />
          Cancelled
        </span>
      );
    }

    // 2. Unpaid check SECOND
    if (!paid) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 border border-amber-500/20">
          <Clock className="h-3.5 w-3.5" />
          Awaiting Payment
        </span>
      );
    }

    // 3. Paid lifecycle status checks
    switch (normalizedStatus) {
      case "completed":
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 border border-purple-500/20">
            <Truck className="h-3.5 w-3.5" />
            Shipped
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 border border-blue-500/20">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground capitalize">
            {status}
          </span>
        );
    }
  };

  // Only allow cancellation if order is UNPAID and not already cancelled, delivered, or shipped
  const isCancellable =
    selectedOrder &&
    !selectedOrder.isPaid &&
    selectedOrder.orderStatus !== "cancelled" &&
    selectedOrder.orderStatus !== "delivered" &&
    selectedOrder.orderStatus !== "shipped";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track, manage, and view receipts for your orders and delivery
          requests.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Orders
            </span>
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.total}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Successful Purchases
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.paidCount}</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <FilterSearch
        activeTab={activeTab}
        searchQuery={searchQuery}
        setActiveTab={setActiveTab}
        setSearchQuery={setSearchQuery}
      />

      {/* Orders List */}
      {orderLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <OrderBox
              key={index}
              order={{} as Order}
              renderStatusBadge={renderStatusBadge}
              setSelectedOrder={setSelectedOrder}
              isLoading={true}
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-sm font-semibold">No matching orders found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search or tab filter settings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => (
            <OrderBox
              key={order._id}
              order={order}
              renderStatusBadge={renderStatusBadge}
              setSelectedOrder={setSelectedOrder}
              isLoading={false}
            />
          ))}

          {/* Pagination Controls */}
          {filteredOrders.length > ITEMS_PER_PAGE && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-4 text-xs">
              <p className="text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredOrders.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {filteredOrders.length}
                </span>{" "}
                orders
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>

                <div className="flex items-center gap-1 px-2 text-xs font-semibold">
                  <span>{currentPage}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{totalPages}</span>
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              ✕
            </button>

            <div className="mb-4">
              <h3 className="text-base font-bold">Order Details</h3>
              <p className="text-xs font-mono text-muted-foreground">
                ID: {selectedOrder._id}
              </p>
            </div>

            {/* Status overview */}
            <div className="mb-4 flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">
                  STATUS
                </span>
                {renderStatusBadge(
                  selectedOrder.orderStatus,
                  selectedOrder.isPaid
                )}
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px]">
                  PAYMENT METHOD
                </span>
                <span className="font-semibold uppercase text-foreground">
                  {selectedOrder.paymentInfo?.paymentMethod}
                </span>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="mb-4 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Items ({selectedOrder.orderItems?.length || 0})
              </span>
              <div className="divide-y divide-border rounded-xl border border-border p-2">
                {selectedOrder.orderItems?.map((itm: OrderItem) => (
                  <div
                    key={itm._id}
                    className="flex items-center justify-between py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {itm.image ? (
                        <Image
                          src={itm.image}
                          alt={itm.name ?? "Order item"}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded object-cover border border-border"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded border border-border bg-muted" />
                      )}
                      <div>
                        <p className="font-medium">{itm.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {itm.quantity} × ₦{(itm.price ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold">
                      ₦
                      {(
                        (itm.price ?? 0) * (itm.quantity ?? 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div className="mb-4 rounded-xl border border-border p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Shipping Details
                </div>
                <p className="font-medium text-foreground">
                  {selectedOrder.shippingAddress.fullName}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.shippingAddress.streetAddress}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.state} State,{" "}
                  {selectedOrder.shippingAddress.country}
                </p>
                <div className="flex items-center gap-1 text-muted-foreground pt-1">
                  <Phone className="h-3 w-3" />
                  <span>{selectedOrder.shippingAddress.phoneNumber}</span>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="rounded-xl bg-muted/20 p-3 text-xs space-y-1.5 border border-border/60">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal:</span>
                <span>₦{selectedOrder.itemsPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee:</span>
                <span>₦{selectedOrder.deliveryFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border">
                <span>Total Amount:</span>
                <span className="text-primary">
                  ₦{selectedOrder.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cancel Order Section (Only visible for unpaid orders) */}
            {isCancellable && (
              <div className="mt-4 border-t border-border/60 pt-4">
                {!showCancelInput ? (
                  <button
                    onClick={() => setShowCancelInput(true)}
                    className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Cancel This Order
                  </button>
                ) : (
                  <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-xs font-medium text-red-600">
                      Reason for cancellation:
                    </p>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Changed my mind, ordered by mistake..."
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 resize-none h-20"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelOrder}
                        disabled={isCancelling || !cancelReason.trim()}
                        className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                      >
                        {isCancelling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Confirm Cancellation"
                        )}
                      </button>
                      <button
                        onClick={() => setShowCancelInput(false)}
                        disabled={isCancelling}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}