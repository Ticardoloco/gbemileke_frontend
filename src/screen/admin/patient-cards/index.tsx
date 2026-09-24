
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  IdCard,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Stethoscope,
  Sparkles,
  Filter,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  User,
  Lock,
  Activity,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";
import {
  deletePatientCard,
  getAllPatientCards,
  PatientCardDetails,
} from "@/services/userService";
import { getSpecialities, SpecialitiesType } from "@/services/specialitiesService";

export default function AdminPatientCardPage() {
  const [cards, setCards] = useState<PatientCardDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialties, setSpecialties] = useState<SpecialitiesType[] | undefined>([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Delete Modal States
  const [cardToDelete, setCardToDelete] = useState<PatientCardDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSpecialties = async () => {
    try {
      const res = await getSpecialities();
      setSpecialties(res?.specialities || undefined);
    } catch (err) {
      console.error("Failed to fetch Specialties", err);
    }
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllPatientCards();
      setCards(res?.cards || []);
    } catch (err: any) {
      console.error("Failed to load patient cards:", err);
      const msg = err?.response?.data?.message || "Failed to load patient cards.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const trigger = ()=>{
      fetchCards();
      fetchSpecialties();
    }
    trigger()
  }, []);

  // Format Helpers
  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatSpecialty = (specialty?: string) => {
    if (!specialty) return "General Practice";
    return specialty.replace(/-/g, " ");
  };

  // Filtering Logic
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = card.patient?.fullName?.toLowerCase().includes(query);
      const matchesEmail = card.patient?.email?.toLowerCase().includes(query);
      const matchesRef = card.paymentReference?.toLowerCase().includes(query);
      const matchesId = card._id?.toLowerCase().includes(query);

      const matchesSearch =
        !query || matchesName || matchesEmail || matchesRef || matchesId;

      const matchesSpecialty =
        specialtyFilter === "all" ||
        card.specialty?.toLowerCase() === specialtyFilter.toLowerCase();

      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && card.isPaid) ||
        (paymentFilter === "unpaid" && !card.isPaid);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !card.isClosed) ||
        (statusFilter === "closed" && card.isClosed);

      return matchesSearch && matchesSpecialty && matchesPayment && matchesStatus;
    });
  }, [cards, searchQuery, specialtyFilter, paymentFilter, statusFilter]);

  // Reset pagination on filter changes
  useEffect(() => {
    const trigger = ()=>{
      setCurrentPage(1);
    }
    trigger()
  }, [searchQuery, specialtyFilter, paymentFilter, statusFilter, itemsPerPage]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage) || 1;
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCards.slice(start, start + itemsPerPage);
  }, [filteredCards, currentPage, itemsPerPage]);

  const startRecord = filteredCards.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, filteredCards.length);

  // Delete Execution
  const handleDeleteCard = async () => {
    if (!cardToDelete || !cardToDelete._id) return;

    try {
      setIsDeleting(true);
      await deletePatientCard(cardToDelete._id);

      setCards((prev) => prev.filter((c) => c._id !== cardToDelete._id));
      toast.success(
        `Patient card for "${cardToDelete.patient?.fullName || "Patient"}" deleted successfully.`
      );
      setCardToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete patient card:", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete patient card. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats Counters
  const totalPaid = useMemo(() => cards.filter((c) => c.isPaid).length, [cards]);
  const totalUnpaid = useMemo(() => cards.filter((c) => !c.isPaid).length, [cards]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Admin Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Administrative Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Patient Cards Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Manage hospital registration cards, review payment verifications, and delete invalid or duplicate clinical profiles.
          </p>
        </div>

        <button
          onClick={fetchCards}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-all backdrop-blur-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Directory
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Cards</p>
            <h3 className="text-xl font-bold text-slate-900">{cards.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Paid Registrations</p>
            <h3 className="text-xl font-bold text-emerald-600">{totalPaid}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Payment</p>
            <h3 className="text-xl font-bold text-rose-600">{totalUnpaid}</h3>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, email, reference, or card ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none capitalize cursor-pointer"
            >
              <option value="all">All Specialties</option>
              {specialties?.toReversed().map((spec) => (
                <option key={spec.slug} value={spec.slug} className="capitalize">
                  {formatSpecialty(spec.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Card Statuses</option>
              <option value="active">Active Only</option>
              <option value="closed">Closed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchCards}
            className="text-xs underline hover:text-rose-900 font-bold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <PatientCardSkeletonGrid count={6} />
      ) : filteredCards.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <IdCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Patient Cards Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No registration records matched your active filters or search term. Try adjusting your query.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCards.map((card) => {
              // Safely handle date properties and fallback to createdAt or updatedAt if closedAt is absent
              const dateToDisplay = card.isClosed
                ? (card.closedAt || (card as any).updatedAt || card.createdAt)
                : card.createdAt;

              return (
                <div
                  key={card._id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs hover:shadow-md p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top Card Info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden shrink-0">
                          {card.patient?.avatar ? (
                            <Image
                              src={card.patient.avatar}
                              alt={card.patient.fullName || "Patient avatar"}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            card.patient?.fullName?.charAt(0).toUpperCase() || (
                              <User className="w-5 h-5 text-slate-400" />
                            )
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {card.patient?.fullName || "Unregistered Patient"}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {card.age ? `${card.age} Yrs` : "N/A"} •{" "}
                            <span className="capitalize">
                              {card.patient?.gender || "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {card.isClosed ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock className="w-3 h-3 text-rose-600" />
                            Closed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Activity className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <hr className="border-slate-100 my-3" />

                    {/* Metadata Fields */}
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                          Specialty:
                        </span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {formatSpecialty(card.specialty)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> State:
                        </span>
                        <span className="font-semibold text-slate-700">
                          {card.stateOfOrigin || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <Calendar className={`w-3.5 h-3.5 ${card.isClosed ? "text-rose-500" : "text-slate-400"}`} />
                          {card.isClosed ? "Closed:" : "Registered:"}
                        </span>
                        <span className={`font-mono text-[11px] ${card.isClosed ? "text-rose-600 font-bold" : "text-slate-700"}`}>
                          {formatDate(dateToDisplay)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                      #{card._id?.slice(-6)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCardToDelete(card)}
                        className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Patient Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/admin/patient-cards/${card._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Card
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredCards.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span>
                  Showing <strong className="font-semibold text-slate-900">{startRecord}</strong> to{" "}
                  <strong className="font-semibold text-slate-900">{endRecord}</strong> of{" "}
                  <strong className="font-semibold text-slate-900">{filteredCards.length}</strong> cards
                </span>

                <div className="flex items-center gap-1.5">
                  <span>Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
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
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {cardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Patient Card
                </h3>
                <p className="text-xs text-slate-500">
                  ID: #{cardToDelete._id?.slice(-8)}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-rose-900 space-y-1">
              <p className="font-semibold">
                Patient: {cardToDelete.patient?.fullName || "Unassigned"}
              </p>
              <p className="text-rose-700">
                This action is permanent and cannot be undone. All clinical histories and associated records under this card reference will be removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCardToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCard}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PatientCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#f8fafc">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton circle width={44} height={44} />
              <div className="flex-1 space-y-2">
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={12} />
              </div>
            </div>
            <Skeleton height={80} className="rounded-xl" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton width={60} height={20} />
              <Skeleton width={90} height={32} borderRadius={12} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}