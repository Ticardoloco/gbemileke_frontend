import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ProductBoxSkeletonProps {
  count?: number;
}

export const ProductBoxSkeleton: React.FC<ProductBoxSkeletonProps> = ({ count = 1 }) => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#f8fafc">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          {/* Left Side: Thumbnail & Order Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Image Thumbnail Skeleton */}
            <div className="shrink-0">
              <Skeleton width={56} height={56} borderRadius={12} />
            </div>

            {/* Content Details */}
            <div className="space-y-2 flex-1 max-w-lg">
              {/* Name, ID & Guest Tag */}
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton width={130} height={18} />
                <Skeleton width={60} height={18} borderRadius={6} />
              </div>

              {/* Items Summary */}
              <div>
                <Skeleton width="85%" height={14} />
              </div>

              {/* Meta info: Location • Date • Reference */}
              <div className="flex items-center gap-2">
                <Skeleton width={180} height={12} />
              </div>
            </div>
          </div>

          {/* Right Side: Pricing & Status Badge */}
          <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* Price & Paid Status */}
            <div className="text-left lg:text-right space-y-1">
              <Skeleton width={70} height={18} />
              <Skeleton width={40} height={12} />
            </div>

            {/* Status Badge */}
            <div>
              <Skeleton width={90} height={26} borderRadius={9999} />
            </div>
          </div>
        </div>
      ))}
    </SkeletonTheme>
  );
};

export default ProductBoxSkeleton;