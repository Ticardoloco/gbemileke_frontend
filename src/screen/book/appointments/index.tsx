/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Video,
  MapPin,
  Info,
} from "lucide-react";
import { AppointmentsResponse, getAppointments } from "@/services/bookService";
import BookingBox from "@/components/book/BookingBox";
import BookingBoxSkeleton from "@/components/skeleton/BookAppSkeleton";

const ITEMS_PER_PAGE = 5;

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/20",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    bg: "bg-teal-500/10",
    text: "text-teal-700",
    border: "border-teal-500/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-500/20",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-slate-500/10",
    text: "text-slate-600",
    border: "border-slate-500/20",
    icon: XCircle,
  },
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentsResponse[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await getAppointments();
        setAppointments(res.appointments || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Reset page when search or status filter changes
  useEffect(() => {
    const currentPageTrigger =()=>{
      setCurrentPage(1);
    }

    currentPageTrigger()
  }, [statusFilter, searchQuery]);

  const formatSpecialty = (specialty: string) => (specialty ? specialty.replace(/-/g, " ") : "General");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const key = status?.toLowerCase() || "";
    const config = STATUS_CONFIG[key] || {
      label: status,
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} backdrop-blur-sm`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const matchesStatus =
        statusFilter === "all" ||
        app.status?.toLowerCase() === statusFilter.toLowerCase();

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        app.specialty?.toLowerCase().includes(searchLower) ||
        (app.symptoms && app.symptoms.toLowerCase().includes(searchLower)) ||
        app.patient?.fullName?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAppointments, currentPage]);

  const getStatusCount = (status: string) => {
    if (status === "all") return appointments.length;
    return appointments.filter((a) => a.status?.toLowerCase() === status).length;
  };

  // Helper for generating page numbers with truncating ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-16">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Appointments
              </h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold px-2.5 py-1 rounded-full">
                {appointmentsLoading ? "..." : appointments.length} Total
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Track, organize, and check status on all your medical appointments.
            </p>
          </div>

          <button
            onClick={() => router.push("/book")}
            className="group flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-medium text-sm px-5 py-3 rounded-2xl transition-all shadow-sm shadow-emerald-900/10 hover:shadow-md w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Book Appointment</span>
          </button>
        </header>

        {/* Search & Filter Dock */}
        <div className="bg-white/80 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-200/70 shadow-sm mb-8 space-y-3 md:space-y-0 md:flex md:items-center md:gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by specialty, doctor, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Tab Filter Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
            {["all", "pending", "approved", "completed", "rejected", "cancelled"].map((status) => {
              const count = getStatusCount(status);
              const isActive = statusFilter === status;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap shrink-0 border ${
                    isActive
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive
                        ? "bg-emerald-900/60 text-emerald-100"
                        : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointment Cards Feed */}
        {appointmentsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <BookingBoxSkeleton key={idx} />
            ))}
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              {paginatedAppointments.map((appointment) => {
                const appType = appointment.type?.toLowerCase() || "";
                const isVirtual = appType.includes("virtual");
                const isInPerson = appType.includes("in-person") || appType.includes("in person") || !isVirtual;

                const isApproved =
                  appointment.status?.toLowerCase() === "approved" ||
                  appointment.status?.toLowerCase() === "confirmed";

                const isRejected = appointment.status?.toLowerCase() === "rejected";
                const rejectionText = appointment.rejectionReason;

                return (
                  <div
                    key={appointment._id}
                    className="group bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
                  >
                    <div className="p-4 sm:p-5">
                      <BookingBox
                        formatSpecialty={formatSpecialty}
                        formatDate={formatDate}
                        getStatusBadge={getStatusBadge}
                        appointment={appointment}
                      />
                    </div>

                    {/* Virtual Banner Notice */}
                    {isVirtual && isApproved && (
                      <div className="bg-emerald-50/70 border-t border-emerald-100 p-3.5 px-5 flex items-start gap-2.5 text-xs text-emerald-900">
                        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <span className="font-semibold">Virtual Meeting:</span> Access link will be dispatched via email/SMS prior to your time slot.
                        </p>
                      </div>
                    )}

                    {/* In-Person Location Banner */}
                    {isInPerson && isApproved && (
                      <div className="bg-emerald-50/70 border-t border-emerald-100 p-3.5 px-5 flex items-start gap-2.5 text-xs text-emerald-900">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <span className="font-semibold">Center Location:</span> Visit us at <strong className="font-semibold">Ijegun, Lagos State</strong>. Please arrive 10–15 mins early.
                        </p>
                      </div>
                    )}

                    {/* Rejection Banner */}
                    {isRejected && rejectionText && (
                      <div className="bg-rose-50/70 border-t border-rose-100 p-4 flex items-start gap-3">
                        <div className="p-1 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="text-xs space-y-0.5">
                          <span className="font-semibold text-rose-900 block">
                            Rejection Reason
                          </span>
                          <p className="text-rose-700/90 leading-relaxed">
                            {rejectionText}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl border border-slate-200/70 shadow-sm mt-8">
                <span className="text-xs text-slate-500 font-medium">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredAppointments.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {filteredAppointments.length}
                  </span>{" "}
                  appointments
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) =>
                      typeof page === "number" ? (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                            currentPage === page
                              ? "bg-emerald-800 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={idx} className="px-1 text-xs text-slate-400">
                          {page}
                        </span>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white p-10 sm:p-14 rounded-3xl border border-slate-200/70 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                No appointments match your filter
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try searching for another term or clear your active filters to see all appointments.
              </p>
            </div>
            {(statusFilter !== "all" || searchQuery !== "") && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/70 px-4 py-2 rounded-xl transition-all"
              >
                Clear active filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}