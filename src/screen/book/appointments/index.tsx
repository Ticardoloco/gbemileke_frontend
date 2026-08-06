"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AppointmentsResponse, getAppointments } from "@/services/bookService";
import BookingBox from "@/components/book/BookingBox";
import BookingBoxSkeleton from "@/components/skeleton/BookAppSkeleton";

const ITEMS_PER_PAGE = 5;

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
        setAppointments(res.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Reset page when filter or search changes
  useEffect(() => {
    const currentPageTrigger = ()=>{
        setCurrentPage(1);
    }
    currentPageTrigger();
  }, [statusFilter, searchQuery]);

  // Helper formatting functions
  const formatSpecialty = (specialty: string) => {
    return specialty.replace(/-/g, " ");
  };

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
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case "Approved":
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const matchesStatus =
        statusFilter === "all" ||
        app.status.toLowerCase() === statusFilter.toLowerCase();

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        app.specialty.toLowerCase().includes(searchLower) ||
        (app.symptoms && app.symptoms.toLowerCase().includes(searchLower)) ||
        app.patient.fullName.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Calculate total pages and current slice
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAppointments, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              My Appointments
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {appointmentsLoading ? "..." : appointments.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your medical consultation schedules and visit details
          </p>
        </div>

        <button
          onClick={() => router.push("/book")}
          className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by specialty, symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1 shrink-0" />
          {["all", "pending", "approved", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap shrink-0 border ${
                statusFilter === status
                  ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Section */}
      {appointmentsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <BookingBoxSkeleton key={idx} />
          ))}
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedAppointments.map((appointment) => (
              <BookingBox
                key={appointment._id}
                formatSpecialty={formatSpecialty}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                appointment={appointment}
              />
            ))}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs sm:text-sm text-slate-500">
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
                results
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                        currentPage === page
                          ? "bg-emerald-800 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-100 text-center max-w-md mx-auto space-y-4 my-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              No Appointments Found
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              We couldn&apos;t find any scheduled appointments matching your current criteria.
            </p>
          </div>
          {(statusFilter !== "all" || searchQuery !== "") && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="text-xs text-emerald-700 font-semibold underline hover:text-emerald-800"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}