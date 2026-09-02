/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Users, Search, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAllUsers, switchUserRole } from "@/services/userService";
import { UserProfile } from "@/services/authService";
import Image from "next/image";

export default function AdminRoleManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Available selectable roles for switching non-admin accounts
  const assignableRoles = ["patient", "practitioner"];

  // Fetch all users on mount
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const trigger = ()=>{
        fetchUsers();
    }
    trigger();
  }, []);

  // Filter users by name, email, or phone
  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return users;

    return users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phoneNumber?.includes(query)
    );
  }, [users, searchTerm]);

  // Handle Role Change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoadingId(userId);
      await switchUserRole(userId, newRole);

      // Optimistically update UI
      setUsers((prev) =>
        prev.map((u) => {
          const id = u._id || (u as any).id;
          return id === userId ? { ...u, role: newRole } : u;
        })
      );
      toast.success("User role updated successfully.");
    } catch (error: any) {
      console.error("Role update failed:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update role."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 sm:p-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              User & Role Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Control user access privileges and assign system roles.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60 self-start md:self-auto">
          <Users className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <span className="block text-slate-400">Total Accounts</span>
            <span className="text-sm font-bold text-white">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing{" "}
          <span className="text-slate-900 font-semibold">
            {filteredUsers.length}
          </span>{" "}
          of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Fetching registered users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-base font-semibold text-slate-700">
              No users found
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User Details</th>
                  <th className="py-3.5 px-4 sm:px-6">Contact Info</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">
                    Current Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, index) => {
                  const userId = user._id || (user as any).id;
                  const rowKey = userId || `user-row-${index}`;
                  const isProcessing = actionLoadingId === userId;
                  const isAdmin = user.role === "admin";

                  return (
                    <tr
                      key={rowKey}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {user.avatar ? (
                              <Image
                                width={36}
                                height={36}
                                src={user.avatar}
                                alt={user.fullName || "User Avatar"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-slate-600 text-xs uppercase">
                                {user.fullName?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.fullName || "Unnamed User"}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              ID: {userId ? userId.slice(-6) : "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <p className="text-slate-700 font-medium">
                            {user.email}
                          </p>
                          <p className="text-xs text-slate-400">
                            {user.phoneNumber || "No Phone"}
                          </p>
                        </div>
                      </td>

                      {/* Role Switch Selector */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="relative inline-block w-36 text-left">
                          <select
                            value={user.role || "patient"}
                            disabled={isProcessing || isAdmin}
                            onChange={(e) =>
                              handleRoleChange(
                                userId as string,
                                e.target.value
                              )
                            }
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium py-1.5 px-2.5 rounded-lg text-xs capitalize focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            {isAdmin ? (
                              <option value="admin">admin</option>
                            ) : (
                              assignableRoles.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}