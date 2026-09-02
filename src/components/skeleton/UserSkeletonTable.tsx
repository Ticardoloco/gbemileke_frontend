import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface UserTableRowSkeletonProps {
  rows?: number
}

export const UserTableRowSkeleton: React.FC<UserTableRowSkeletonProps> = ({ rows = 5 }) => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className="border-b border-slate-100">
          {/* User Details */}
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton circle width={36} height={36} className="shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton width="60%" height={14} />
                <Skeleton width="80%" height={10} />
              </div>
            </div>
          </td>

          {/* Role */}
          <td className="px-5 py-4 whitespace-nowrap">
            <Skeleton width={75} height={22} borderRadius={6} />
          </td>

          {/* Phone */}
          <td className="px-5 py-4 whitespace-nowrap">
            <Skeleton width={100} height={14} />
          </td>

          {/* Status */}
          <td className="px-5 py-4 whitespace-nowrap">
            <Skeleton width={80} height={20} borderRadius={9999} />
          </td>

          {/* Joined Date */}
          <td className="px-5 py-4 whitespace-nowrap">
            <Skeleton width={85} height={12} />
          </td>

          {/* Actions */}
          <td className="px-5 py-4 whitespace-nowrap text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton width={60} height={30} borderRadius={8} />
              <Skeleton width={80} height={30} borderRadius={8} />
            </div>
          </td>
        </tr>
      ))}
    </SkeletonTheme>
  )
}

export default UserTableRowSkeleton