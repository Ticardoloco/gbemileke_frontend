// @/components/skeleton/SpecialtiesIndexSkeleton.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SpecialtiesIndexSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex gap-5 p-6">
        {/* Icon skeleton */}
        <Skeleton className="h-10 w-10 shrink-0 rounded-md" />

        <div className="flex-1 space-y-2">
          {/* Category badge skeleton */}
          <Skeleton className="h-3 w-24" />

          {/* Title skeleton */}
          <Skeleton className="h-6 w-3/4" />

          {/* Description skeleton (2 lines) */}
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-4/5" />

          {/* "Learn more" link skeleton */}
          <Skeleton className="h-4 w-28 mt-4" />
        </div>
      </CardContent>
    </Card>
  );
}