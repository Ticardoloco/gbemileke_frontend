// components/BookingBoxSkeleton.tsx
import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const BookingBoxSkeleton = () => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#cbd5e1">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4 flex-1">
          <Skeleton width={48} height={48} borderRadius={16} containerClassName="shrink-0" />

          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton width={140} height={22} />
              <Skeleton width={70} height={20} borderRadius={999} />
              <Skeleton width={60} height={18} />
            </div>

            <div className="flex items-center gap-4">
              <Skeleton width={110} height={16} />
              <Skeleton width={80} height={16} />
              <Skeleton width={120} height={16} />
            </div>

            <div className="mt-2">
              <Skeleton height={36} borderRadius={12} className="max-w-md" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
          <Skeleton width={90} height={36} borderRadius={12} />
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default BookingBoxSkeleton;