import { Order } from "@/services/orderService";
import { CheckCircle, Clock, Package } from "lucide-react";
import Image from "next/image";
import React from "react";

interface ProductBoxProps {
  order: Order;
  formatDate: (isoString: string) => string;
  formatCurrency: (amount: number) => string;
}
const ProductBox = ({ order, formatDate, formatCurrency }: ProductBoxProps) => {

 
  return (
    <div
      className="p-4 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-4">
        {/* First product image thumbnail */}
        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
          {order.orderItems?.[0]?.image ? (
            <Image
              src={order.orderItems[0].image}
              alt={order.orderItems[0].name || "Product"}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-6 h-6 text-slate-400 m-auto" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900">
              {order.shippingAddress?.fullName}
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              ID: {order._id?.slice(-6)}
            </span>
            {!order.user && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Guest Order
              </span>
            )}
          </div>

          {/* Items Summary */}
          <p className="text-xs text-slate-600 line-clamp-1">
            {order.orderItems
              ?.map((i) => `${i.name} (x${i.quantity})`)
              .join(", ")}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </span>
            <span>•</span>
            <span>{order.createdAt && formatDate(order.createdAt)}</span>
            <span>•</span>
            <span className="font-mono">{order.paymentInfo?.reference}</span>
          </div>
        </div>
      </div>

      {/* Pricing, Status & Actions */}
      <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
        <div className="text-left lg:text-right">
          <p className="text-sm font-extrabold text-slate-900">
            {order.totalAmount && formatCurrency(order.totalAmount)}
          </p>
          <p className="text-[10px] font-medium text-slate-400">
            {order.isPaid ? "Paid" : "Unpaid"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
              order.orderStatus === "processing"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : order.orderStatus === "delivered"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {order.orderStatus === "processing" && (
              <Clock className="w-3.5 h-3.5 animate-spin" />
            )}
            {order.orderStatus === "delivered" && (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            {order.orderStatus && order.orderStatus.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductBox;
