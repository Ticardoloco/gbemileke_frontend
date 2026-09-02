import { UserProfile } from '@/services/authService'
import { AlertTriangle, CheckCircle2, Eye, UserCheck, UserX } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const UserTable = ({user, getRoleBadge, handleViewUser, handleOpenActionModal}: {user:UserProfile; getRoleBadge: (role: string)=> string; handleViewUser: (user: UserProfile)=> void; handleOpenActionModal: (user: UserProfile)=> void}) => {
  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <Image
                            width={36}
                            height={36}
                            src={user.avatar}
                            alt={user.fullName || "User"}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 uppercase">
                            {user.fullName?.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{user.fullName}</p>
                          <p className="text-slate-500 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {user?.role ? getRoleBadge(user.role) : <span className="text-slate-300">N/A</span>}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {user.phoneNumber || <span className="text-slate-300">N/A</span>}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {user.isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(user.createdAt ? user.createdAt : "").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleOpenActionModal(user)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                            user.isSuspended
                              ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              : "border-red-200 text-red-700 hover:bg-red-50"
                          }`}
                        >
                          {user.isSuspended ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" /> Unsuspend
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" /> Suspend
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
  )
}

export default UserTable