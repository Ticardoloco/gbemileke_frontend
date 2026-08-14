/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Order, updateOrderStatus, updateDeliveryFee } from "@/services/orderService";
import { Edit2, Save, X, Loader2, CreditCard, AlertCircle, Phone } from "lucide-react";
import { toast } from "sonner";

interface ProductBoxProps {
  order: Order;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  onRefresh?: () => void;
}

export default function ProductCard({
  order,
  formatDate,
  formatCurrency,
  onRefresh,
}: ProductBoxProps) {
  // Safe field fallbacks depending on schema naming conventions
  const initialFee = order.deliveryFee ?? (order as any).shippingPrice ?? 0;
  const initialTotal = order.totalAmount ?? (order as any).totalPrice ?? 0;

  // Safe phone number resolution
  const phoneNumber = (order.shippingAddress as any)?.phoneNumber;

  // Determine Payment Status Safely
  const rawStatus =
    (order as any).paymentInfo?.status ||
    (order as any).paymentStatus ||
    ((order as any).isPaid ? "paid" : "unpaid");

  const isPaid =
    Boolean((order as any).isPaid) ||
    rawStatus.toLowerCase() === "paid" ||
    rawStatus.toLowerCase() === "completed";

  const [status, setStatus] = useState<string>(order.orderStatus || "pending");
  const [deliveryFee, setDeliveryFee] = useState<number>(initialFee);
  const [isEditingFee, setIsEditingFee] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isUpdatingFee, setIsUpdatingFee] = useState<boolean>(false);

  // Modal / Prompt State for Cancellation Reason
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancellationReason, setCancellationReason] = useState<string>("");

  // Helper to check if a target status is a valid transition from current status
  const isStatusOptionDisabled = (targetStatus: string): boolean => {
    if (status === targetStatus) return false;

    switch (status) {
      case "pending":
        return false;
      case "processing":
        return targetStatus === "pending";
      case "shipped":
        return targetStatus === "pending" || targetStatus === "processing";
      case "delivered":
      case "cancelled":
        return true;
      default:
        return false;
    }
  };

  // Check if select should be globally disabled
  const isSelectDisabled =
    isUpdatingStatus ||
    (!isPaid && status !== "cancelled") ||
    status === "delivered" ||
    status === "cancelled";

  // 1. Handle Order Status Change Trigger
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isPaid && e.target.value !== "cancelled") {
      toast.error("Cannot update status for unpaid orders");
      return;
    }

    const newStatus = e.target.value;

    if (newStatus === "cancelled") {
      setShowCancelModal(true);
      return;
    }

    await submitStatusUpdate(newStatus);
  };

  // Helper function to submit status updates to the backend
  const submitStatusUpdate = async (newStatus: string, reason?: string) => {
    const oldStatus = status;
    setStatus(newStatus);

    try {
      setIsUpdatingStatus(true);
      
      const payload: any = { orderStatus: newStatus };
      if (reason) {
        payload.cancellationReason = reason;
      }

      await updateOrderStatus(order._id, payload);
      toast.success(`Order status updated to "${newStatus.toUpperCase()}"`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to update status:", error);
      setStatus(oldStatus);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
      setShowCancelModal(false);
      setCancellationReason("");
    }
  };

  // Confirm Cancellation with Reason
  const handleConfirmCancel = () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    submitStatusUpdate("cancelled", cancellationReason.trim());
  };

  // 2. Handle Delivery Fee Update
  const handleSaveDeliveryFee = async () => {
    if (isPaid) {
      toast.error("Cannot modify delivery fee after an order has been paid");
      return;
    }

    try {
      setIsUpdatingFee(true);
      await updateDeliveryFee(order._id, { 
        deliveryFee: Number(deliveryFee)
      });
      toast.success(`Delivery fee updated to ${formatCurrency(Number(deliveryFee))}`);
      setIsEditingFee(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to update delivery fee:", error);
      setDeliveryFee(initialFee);
      toast.error("Failed to update delivery fee");
    } finally {
      setIsUpdatingFee(false);
    }
  };

  return (
    <div className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
      {/* Order Info & Customer Details */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
            #{order._id?.slice(-6).toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {order.createdAt ? formatDate(order.createdAt) : "N/A"}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-bold text-slate-700">
            {order.shippingAddress?.fullName || "Guest Customer"}
          </span>

          {/* Payment Status Badge */}
          {!(status === "cancelled" && !isPaid) && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                isPaid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <CreditCard className="w-3 h-3" />
              {isPaid ? "Paid" : "Unpaid"}
            </span>
          )}
        </div>

        {/* Order Items */}
        <div className="text-xs text-slate-600 font-medium space-x-1">
          <span className="font-bold text-slate-900">Items:</span>
          {order.orderItems?.map((item, idx) => (
            <span
              key={idx}
              className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md mr-1 mt-1"
            >
              {item.name} (x{item.quantity ?? (item as any).qty ?? 1})
            </span>
          ))}
        </div>

        {/* Address & Contact Info */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <p>
            📍 {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city},{" "}
            {order.shippingAddress?.state}
          </p>
          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-emerald-600 transition-colors bg-slate-100 px-2 py-0.5 rounded-md"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              {phoneNumber}
            </a>
          )}
        </div>

        {/* Display Cancellation Reason if Present */}
        {(order as any).cancellationReason && (
          <div className="inline-flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span><strong>Reason for Cancellation:</strong> {(order as any).cancellationReason}</span>
          </div>
        )}
      </div>

      {/* Pricing & Control Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
        
        {/* Delivery Fee Section */}
        <div className="text-left sm:text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Delivery Fee
          </div>
          {isEditingFee && !isPaid ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-24 px-2 py-1 border border-slate-300 rounded-md text-xs font-bold bg-white focus:outline-emerald-500"
                min={0}
              />
              <button
                onClick={handleSaveDeliveryFee}
                disabled={isUpdatingFee}
                className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                title="Save"
              >
                {isUpdatingFee ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditingFee(false);
                  setDeliveryFee(initialFee);
                }}
                disabled={isUpdatingFee}
                className="p-1 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 transition-colors disabled:opacity-50"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-black text-slate-800">
                {formatCurrency(deliveryFee)}
              </span>
              {!isPaid && (
                <button
                  onClick={() => setIsEditingFee(true)}
                  className="text-slate-400 hover:text-emerald-700 p-0.5 transition-colors"
                  title="Edit Delivery Fee"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Total Price */}
        <div className="text-left sm:text-right border-l border-slate-200 pl-4">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Amount
          </div>
          <span className="text-sm font-black text-emerald-800">
            {formatCurrency(initialTotal)}
          </span>
        </div>

        {/* Order Status Select */}
        <div className="border-l border-slate-200 pl-4">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Status
          </div>
          <div className="relative">
            <select
              value={status}
              onChange={handleStatusChange}
              disabled={isSelectDisabled}
              title={
                !isPaid && status !== "cancelled"
                  ? "Payment required to update order status"
                  : status === "delivered" || status === "cancelled"
                  ? "Final status cannot be changed"
                  : ""
              }
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                status === "delivered"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : status === "shipped"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                  : status === "processing"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : status === "cancelled"
                  ? "bg-rose-50 text-rose-700 border-rose-300"
                  : "bg-amber-50 text-amber-700 border-amber-300"
              }`}
            >
              <option value="pending" disabled={isStatusOptionDisabled("pending")} className="bg-white text-slate-900 disabled:text-slate-300">
                Pending
              </option>
              <option value="processing" disabled={isStatusOptionDisabled("processing")} className="bg-white text-slate-900 disabled:text-slate-300">
                Processing
              </option>
              <option value="shipped" disabled={isStatusOptionDisabled("shipped")} className="bg-white text-slate-900 disabled:text-slate-300">
                Shipped
              </option>
              <option value="delivered" disabled={isStatusOptionDisabled("delivered")} className="bg-white text-slate-900 disabled:text-slate-300">
                Delivered
              </option>
              <option value="cancelled" disabled={isStatusOptionDisabled("cancelled")} className="bg-white text-slate-900 disabled:text-slate-300">
                Cancelled
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Cancel Order
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Please provide a reason for cancelling this order. This information will be saved with the order record.
            </p>

            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Item out of stock, Customer requested cancellation..."
              className="w-full h-24 p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}