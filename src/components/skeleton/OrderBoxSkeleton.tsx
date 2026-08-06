// components/OrderBoxSkeleton.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const OrderBoxSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Top Banner Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Skeleton className="h-4 w-28" />
          <span className="text-muted-foreground/30">•</span>
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      {/* Order Items Body Skeleton */}
      <div className="divide-y divide-border/40 px-4 py-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>

      {/* Order Footer & Action Buttons Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/10 px-4 py-3">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default OrderBoxSkeleton;