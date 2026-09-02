/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  UserX,
  UserCheck,
  Shield,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { UserProfile } from "@/services/authService";
import { getAllUsers, suspendUsers } from "@/services/userService";
import Image from "next/image";
import UserTable from "@/components/admin/UserTable";
import UserTableRowSkeleton from "@/components/skeleton/UserSkeletonTable";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const res = await getAllUsers();
        setUsers(res?.users ?? []);
      } catch (error: any) {
        console.error("Failed to load Users", error);
        toast.error(error?.response?.data?.message || "Failed to load users list");
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phoneNumber && u.phoneNumber.includes(searchTerm));

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !u.isSuspended) ||
        (statusFilter === "suspended" && u.isSuspended);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Reset to first page whenever search term or filters change
  useEffect(() => {
    const trigger = ()=>{
        setCurrentPage(1);
    }
    trigger();
  }, [searchTerm, roleFilter, statusFilter, itemsPerPage]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, filteredUsers.length);

  // Role Badge Helper
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case "practitioner":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <Stethoscope className="w-3 h-3" /> Practitioner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <User className="w-3 h-3" /> Patient
          </span>
        );
    }
  };

  // View User Info
  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Open Action (Suspend / Unsuspended) Modal
  const handleOpenActionModal = (user: UserProfile) => {
    setSelectedUser(user);
    setSuspensionReason(user.suspensionReason || "");
    setIsActionModalOpen(true);
  };

  // Toggle Suspension API Execution
  const handleToggleSuspension = async () => {
    if (!selectedUser) return;

    const willSuspend = !selectedUser.isSuspended;

    if (willSuspend && !suspensionReason.trim()) {
      toast.error("Please provide a reason for suspending this user");
      return;
    }

    setActionLoading(true);

    try {
      await suspendUsers(selectedUser.id, {
        isSuspended: willSuspend,
        reason: willSuspend ? suspensionReason.trim() : "",
      });

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              isSuspended: willSuspend,
              suspensionReason: willSuspend ? suspensionReason.trim() : "",
            };
          }
          return u;
        })
      );

      toast.success(
        willSuspend
          ? `User "${selectedUser.fullName}" has been suspended successfully.`
          : `User "${selectedUser.fullName}" has been reactivated.`
      );

      setIsActionModalOpen(false);
      setSelectedUser(null);
      setSuspensionReason("");
    } catch (err: any) {
      console.error("Action failed", err);
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${willSuspend ? "suspend" : "unsuspend"} user account.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 sm:p-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View accounts, monitor roles, and manage user status across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 self-start md:self-auto text-xs sm:text-sm">
          <span className="text-slate-400">Total Accounts:</span>
          <span className="font-bold text-emerald-400">{users.length}</span>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="practitioner">Practitioners</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User Details</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersLoading ? (
                <UserTableRowSkeleton />
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No users matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.toReversed().map((user) => (
                  <UserTable
                    key={user.id}
                    user={user}
                    getRoleBadge={getRoleBadge as unknown as (role: string) => string}
                    handleViewUser={handleViewUser}
                    handleOpenActionModal={handleOpenActionModal}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        {!usersLoading && filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span>
                Showing <strong className="font-semibold text-slate-900">{startRecord}</strong> to{" "}
                <strong className="font-semibold text-slate-900">{endRecord}</strong> of{" "}
                <strong className="font-semibold text-slate-900">{filteredUsers.length}</strong> entries
              </span>

              <div className="flex items-center gap-1.5">
                <span>Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW USER DETAILS MODAL */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              {selectedUser.avatar ? (
                <Image
                  width={64}
                  height={64}
                  src={selectedUser.avatar}
                  alt={selectedUser.fullName || "User"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-bold text-2xl text-slate-600 uppercase">
                  {selectedUser.fullName?.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedUser.fullName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge(selectedUser.role ? selectedUser.role : "")}
                  {selectedUser.isSuspended ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      Suspended
                    </span>
                  ) : (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-slate-600 p-2.5 bg-slate-50 rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 p-2.5 bg-slate-50 rounded-xl">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedUser.phoneNumber || "Not provided"}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Address Details</span>
                </div>
                <p className="text-slate-600 text-xs pl-6">
                  {selectedUser.address?.street
                    ? `${selectedUser.address.street}, ${selectedUser.address.city || ""}, ${
                        selectedUser.address.state || ""
                      }, ${selectedUser.address.country || ""}`
                    : "No primary address recorded."}
                </p>
              </div>

              {selectedUser.isSuspended && selectedUser.suspensionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-red-800 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Suspension Reason</span>
                  </div>
                  <p className="text-red-700 text-xs pl-5.5">{selectedUser.suspensionReason}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined: {new Date(selectedUser.createdAt ? selectedUser.createdAt : "").toLocaleDateString()}</span>
                </div>
                <div>ID: {selectedUser.id}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND / UNSUSPEND ACTION MODAL */}
      {isActionModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedUser.isSuspended ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}
              >
                {selectedUser.isSuspended ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedUser.isSuspended ? "Unsuspend Account" : "Suspend Account"}
                </h3>
                <p className="text-xs text-slate-500">{selectedUser.fullName}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedUser.isSuspended
                ? "Restoring this account will re-enable full system access for the user."
                : "Suspending this user will prevent them from signing in or placing requests until reactivated."}
            </p>

            {!selectedUser.isSuspended && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Reason for Suspension</label>
                <textarea
                  rows={3}
                  placeholder="State the reason for suspending this account..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleSuspension}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition ${
                  selectedUser.isSuspended
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : selectedUser.isSuspended
                  ? "Confirm Reactivation"
                  : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}