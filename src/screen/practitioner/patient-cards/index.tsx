/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  IdCard,
  Eye,
  Calendar,
  MapPin,
  Stethoscope,
  Sparkles,
  Filter,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getAllPatientCards, PatientCardDetails } from "@/services/userService";
import Image from "next/image";
import { getSpecialities, SpecialitiesType } from "@/services/specialitiesService";

export default function PractitionerPatientCardsPage() {
  const [cards, setCards] = useState<PatientCardDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [specialties, setSpecialties] = useState<SpecialitiesType[] | undefined>([]);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'closed'

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  const fetchSpecialties = async () => {
    try {
      const res = await getSpecialities();
      setSpecialties(res?.specialities || undefined);
    } catch (error) {
      console.error("Failed to fetch Specialties", error);
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
      setError(err?.response?.data?.message || "Failed to load patient cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCardTrigger = () => {
      fetchCards();
      fetchSpecialties();
    };
    fetchCardTrigger();
  }, []);

  // Reset pagination to page 1 whenever search query or filters change
  useEffect(() => {
    const trigger = ()=>{
      setCurrentPage(1);
    }
    trigger();
  }, [searchQuery, specialtyFilter, paymentFilter, statusFilter]);

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

  const filteredCards = cards.filter((card) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesName = card.patient?.fullName?.toLowerCase().includes(query);
    const matchesEmail = card.patient?.email?.toLowerCase().includes(query);
    const matchesRef = card.paymentReference?.toLowerCase().includes(query);
    const matchesId = card._id?.toLowerCase().includes(query);

    const matchesSearch = matchesName || matchesEmail || matchesRef || matchesId;

    const matchesSpecialty =
      specialtyFilter === "all" ||
      card.specialty?.toLowerCase() === specialtyFilter.toLowerCase();

    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "paid" && card.isPaid) ||
      (paymentFilter === "unpaid" && !card.isPaid);

    const isCardClosed = (card as any).isClosed ?? card.status === "closed";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !isCardClosed) ||
      (statusFilter === "closed" && isCardClosed);

    return matchesSearch && matchesSpecialty && matchesPayment && matchesStatus;
  });

  // --- CALCULATION FOR PAGINATION ---
  const totalItems = filteredCards.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCards = filteredCards.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Clinical Records
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Patient Cards Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Access patient registration records, manage prescriptions, and record medical histories.
          </p>
        </div>

        <button
          onClick={fetchCards}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-all backdrop-blur-sm cursor-pointer"
        >
          Refresh Directory
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Specialty Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
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

          {/* Payment Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Card Status Filter (Active / Closed) */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Cards</option>
              <option value="closed">Closed Cards</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards List */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm font-semibold text-center">
          {error}
        </div>
      )}

      {loading ? (
        <PatientCardSkeletonGrid count={itemsPerPage} />
      ) : filteredCards.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <IdCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Patient Cards Found
          </h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCards.map((card) => {
              const isClosed = (card as any).isClosed ?? card.status === "closed";
              const closedDateRaw = card.closedAt || (card as any).closedDate || (card as any).updatedAt;

              return (
                <div
                  key={card._id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
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
                            card.patient?.fullName?.charAt(0).toUpperCase() || "P"
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {card.patient?.fullName}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {card.age ? `${card.age} Yrs` : "N/A"} •{" "}
                            <span className="capitalize">
                              {card.patient?.gender}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            isClosed
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          {isClosed ? (
                            <Lock className="w-2.5 h-2.5 text-rose-600" />
                          ) : (
                            <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          )}
                          {isClosed ? "Closed" : "Active"}
                        </span>
                      </div>
                    </div>

                    <hr className="border-slate-100 my-3" />

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />{" "}
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

                      {/* Dynamic Date Row: Closed On vs Registered */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
                          {isClosed ? "Closed On:" : "Registered:"}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            isClosed ? "text-rose-700" : "text-slate-700"
                          }`}
                        >
                          {isClosed
                            ? formatDate(closedDateRaw)
                            : formatDate(card.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                      ID: #{card._id?.slice(-6)}
                    </span>

                    <Link
                      href={`/practitioner/patients/${card._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Card
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- PAGINATION FOOTER CONTROL --- */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-500 font-medium">
              <span>
                Showing{" "}
                <strong className="text-slate-800">
                  {totalItems === 0 ? 0 : startIndex + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-800">
                  {Math.min(endIndex, totalItems)}
                </strong>{" "}
                of <strong className="text-slate-800">{totalItems}</strong> cards
              </span>

              {/* Items per page selector */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span className="text-slate-400">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .reduce<(number | string)[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={index}
                        onClick={() => handlePageChange(item)}
                        className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                          currentPage === item
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={index} className="px-1 text-slate-400 font-bold">
                        {item}
                      </span>
                    )
                  )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
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
            className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4"
          >
            <Skeleton height={150} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}