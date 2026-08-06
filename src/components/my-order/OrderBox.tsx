import { Order, OrderItem } from "@/services/orderService";
import { Calendar, ExternalLink, Eye } from "lucide-react";
import Image from "next/image";
import React from "react";
import OrderBoxSkeleton from "../skeleton/OrderBoxSkeleton";

const OrderBox = ({
  order,
  renderStatusBadge,
  setSelectedOrder,
  isLoading,
}: {
  order: Order;
  renderStatusBadge: (
    status: string | undefined,
    isPaid?: boolean,
  ) => React.ReactNode;
  setSelectedOrder: (order: Order) => void;
  isLoading?: boolean;
}) => {
  if (isLoading || !order || !order._id)
    return <OrderBoxSkeleton />;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 shadow-sm">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div>
            <span className="text-muted-foreground">Order ID: </span>
            <span className="font-mono font-medium text-foreground">
              #{order._id?.slice(-8)}
            </span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderStatusBadge(order.orderStatus, order.isPaid)}
        </div>
      </div>

      {/* Order Items Body */}
      <div className="divide-y divide-border/40 px-4 py-2">
        {order.orderItems?.map((item: OrderItem) => (
          <div
            key={item._id}
            className="flex items-center justify-between py-3 gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {item.image ? (
                  <Image
                    fill
                    src={item.image}
                    alt={item.name ?? "Order item"}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  {item.name}
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Qty: {item.quantity} × ₦{(item.price ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right text-xs font-semibold">
              ₦{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Order Footer & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/10 px-4 py-3">
        <div className="text-xs">
          <span className="text-muted-foreground">Total: </span>
          <span className="text-sm font-bold text-foreground">
            ₦{order.totalAmount?.toLocaleString()}
          </span>
          <span className="ml-1 text-[10px] text-muted-foreground">
            (Delivery: ₦{order.deliveryFee?.toLocaleString()})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!order.isPaid && order.paymentInfo?.authorizationUrl && (
            <a
              href={order.paymentInfo.authorizationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Pay Now <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <button
            onClick={() => setSelectedOrder(order)}
            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderBox;
