/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAllAppointments,
  updateStatus,
  AppointmentsResponse,
  AppointmentStatus,
} from "@/services/bookService"; // Adjust import path as needed
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
  Search,
  MessageSquare,
  X,
  Loader2,
  Stethoscope,
  RotateCw,
  Phone,
  CircleUser,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PractitionerAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentsResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  // Action / Modal state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    appointmentId: string | null;
  }>({ isOpen: false, appointmentId: null });
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${day}, ${month} ${year}`;
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllAppointments();
      setAppointments(res.appointments || []);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || "Failed to fetch appointments";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAppointmentTrigger = () => {
      fetchAppointments();
    };
    fetchAppointmentTrigger();
  }, []);

  // Reset pagination to page 1 whenever search or filter changes
  useEffect(() => {
    const currentPageTrigger = () =>{
        setCurrentPage(1);
    }
    currentPageTrigger()
  }, [searchQuery, activeTab]);

  const handleStatusUpdate = async (
    id: string,
    status: AppointmentStatus,
    reason: string = ""
  ) => {
    setUpdatingId(id);

    const updatePromise = updateStatus(id, {
      status,
      rejectionReason: reason,
    });

    toast.promise(updatePromise, {
      loading: `Updating appointment status to ${status.toLowerCase()}...`,
      success: (res) => {
        setAppointments((prev) =>
          prev.map((app) => (app._id === id ? res.appointment : app))
        );

        if (rejectionModal.isOpen) {
          setRejectionModal({ isOpen: false, appointmentId: null });
          setRejectionReason("");
        }

        return `Appointment status updated to ${status}`;
      },
      error: (err) => {
        return err?.response?.data?.message || "Failed to update status";
      },
      finally: () => {
        setUpdatingId(null);
      },
    });
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <Clock3 className="w-3.5 h-3.5 animate-pulse" /> Pending
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      default:
        return null;
    }
  };

  // Filter appointments based on Tab & Search
  const filteredAppointments = appointments.filter((app) => {
    const matchesTab =
      activeTab === "All" ||
      app.status?.toLowerCase() === activeTab.toLowerCase();

    const patientName = (app.patient?.fullName || "").toLowerCase();
    const patientEmail = (app.patient?.email || "").toLowerCase();
    const patientPhone = (app.patient?.phoneNumber || "").toLowerCase();
    const patientGender = (app.patient?.gender || "").toLowerCase();
    const specialty = app.specialty?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      patientName.includes(query) ||
      patientEmail.includes(query) ||
      patientPhone.includes(query) ||
      patientGender.includes(query) ||
      specialty.includes(query);

    return matchesTab && matchesSearch;
  });

  // Calculate Pagination Data
  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    endIndex
  );

  const filterTabs = [
    "All",
    "Pending",
    "Approved",
    "Completed",
    "Rejected",
    "Cancelled",
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Patient Appointments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage and update patient booking requests
            </p>
          </div>
          <button
            onClick={fetchAppointments}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 px-3.5 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-1 px-1">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 md:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, phone, specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
            <p className="text-sm text-slate-500 font-medium">
              Loading appointments...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAppointments.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm px-4">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">
              No appointments found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no bookings matching your selected tab or search
              filter.
            </p>
          </div>
        )}

        {/* Appointments Grid */}
        {!loading && !error && filteredAppointments.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {paginatedAppointments.map((app) => {
                const isUpdating = updatingId === app._id;
                const patientName =
                  app.patient?.fullName || "Anonymous Patient";

                return (
                  <div
                    key={app._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full"
                  >
                    <div className="space-y-4">
                      {/* Top Header: Patient & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                            {patientName[0]?.toUpperCase() || (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {patientName}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate">
                              {app.patient?.email || "No email provided"}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-slate-500 shrink-0">
                            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />{" "}
                            Specialty:
                          </span>
                          <span className="font-semibold text-slate-800 truncate">
                            {app.specialty}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-slate-500 shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
                            Date:
                          </span>
                          <span className="font-medium text-slate-800 truncate">
                            {formatDate(app.date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-slate-500 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />{" "}
                            Time:
                          </span>
                          <span className="font-medium text-slate-800 truncate">
                            {app.time}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-slate-500 shrink-0">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />{" "}
                            Phone:
                          </span>
                          <span className="font-medium text-slate-800 truncate">
                            {app.patient?.phoneNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-slate-500 shrink-0">
                            <CircleUser className="w-3.5 h-3.5 text-slate-400" />{" "}
                            Gender:
                          </span>
                          <span className="font-medium text-slate-800 capitalize truncate">
                            {app.patient?.gender || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 shrink-0">
                            Type:
                          </span>
                          <span className="font-medium text-slate-800 truncate">
                            {app.type}
                          </span>
                        </div>
                      </div>

                      {/* Symptoms */}
                      {app.symptoms && (
                        <div className="text-xs">
                          <span className="font-semibold text-slate-700 block mb-1">
                            Symptoms:
                          </span>
                          <p className="text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 italic">
                            &ldquo;{app.symptoms}&ldquo;
                          </p>
                        </div>
                      )}

                      {/* Rejection Reason display if present */}
                      {app.status === "Rejected" && app.rejectionReason && (
                        <div className="text-xs bg-rose-50 text-rose-800 p-2.5 rounded-xl border border-rose-100 flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="font-semibold block">
                              Reason for Rejection:
                            </span>
                            <p className="mt-0.5 wrap-break-word">
                              {app.rejectionReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      {isUpdating ? (
                        <div className="w-full flex items-center justify-center py-2 text-xs font-semibold text-slate-500 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-600" />{" "}
                          Updating...
                        </div>
                      ) : (
                        <>
                          {app.status === "Pending" && (
                            <div className="flex items-center gap-2 w-full">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(app._id, "Approved")
                                }
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition shadow-sm text-center"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setRejectionModal({
                                    isOpen: true,
                                    appointmentId: app._id,
                                  })
                                }
                                className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold py-2 px-3 rounded-xl transition text-center"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {app.status === "Approved" && (
                            <div className="flex items-center justify-between gap-2 w-full">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(app._id, "Completed")
                                }
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition shadow-sm text-center"
                              >
                                Mark Completed
                              </button>
                              <button
                                onClick={() =>
                                  setRejectionModal({
                                    isOpen: true,
                                    appointmentId: app._id,
                                  })
                                }
                                className="text-xs font-medium text-slate-500 hover:text-rose-600 px-2.5 py-2 transition rounded-xl hover:bg-rose-50 shrink-0"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {(app.status === "Completed" ||
                            app.status === "Rejected" ||
                            app.status === "Cancelled") && (
                            <span className="text-[11px] font-medium text-slate-400 italic py-1 w-full text-center">
                              No further actions required
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>
                  Showing{" "}
                  <strong className="text-slate-800 font-semibold">
                    {totalItems > 0 ? startIndex + 1 : 0}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-slate-800 font-semibold">
                    {Math.min(endIndex, totalItems)}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-800 font-semibold">
                    {totalItems}
                  </strong>{" "}
                  appointments
                </span>

                <div className="flex items-center gap-2">
                  <span>Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-700"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-semibold transition ${
                        currentPage === page
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Reject Appointment
              </h3>
              <button
                onClick={() =>
                  setRejectionModal({ isOpen: false, appointmentId: null })
                }
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Please provide a clear reason for rejecting this booking request.
              This will be shared with the patient.
            </p>

            <textarea
              rows={3}
              placeholder="e.g., Practitioner is unavailable at this time slot."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none transition"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() =>
                  setRejectionModal({ isOpen: false, appointmentId: null })
                }
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() => {
                  if (rejectionModal.appointmentId) {
                    handleStatusUpdate(
                      rejectionModal.appointmentId,
                      "Rejected",
                      rejectionReason
                    );
                  }
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white rounded-xl transition shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}