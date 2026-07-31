import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Card, CardContent } from '../ui/card'

export const SpecialitiesSkeleton = () => {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        {/* Icon */}
        <Skeleton circle width={40} height={40} />

        {/* Category */}
        <div className="mt-4">
          <Skeleton width="40%" height={12} />
        </div>

        {/* Name */}
        <div className="mt-2">
          <Skeleton width="75%" height={24} />
        </div>

        {/* Tagline */}
        <div className="mt-3">
          <Skeleton count={2} height={14} />
        </div>

        {/* Learn More link */}
        <div className="mt-6">
          <Skeleton width="30%" height={16} />
        </div>
      </CardContent>
    </Card>
  )
}