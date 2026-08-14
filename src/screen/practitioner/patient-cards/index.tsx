/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getAllPatientCards, PatientCardDetails } from "@/services/userService";
import Image from "next/image";

export default function PractitionerPatientCardsPage() {
  const [cards, setCards] = useState<PatientCardDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

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
    };
    fetchCardTrigger();
  }, []);

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

  const uniqueSpecialties = Array.from(
    new Set(cards.map((c) => c.specialty).filter(Boolean)),
  );

  const filteredCards = cards.filter((card) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesName = card.patient?.fullName?.toLowerCase().includes(query);
    const matchesEmail = card.patient?.email?.toLowerCase().includes(query);
    const matchesRef = card.paymentReference?.toLowerCase().includes(query);
    const matchesId = card._id?.toLowerCase().includes(query);

    const matchesSearch =
      matchesName || matchesEmail || matchesRef || matchesId;

    const matchesSpecialty =
      specialtyFilter === "all" ||
      card.specialty?.toLowerCase() === specialtyFilter.toLowerCase();

    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "paid" && card.isPaid) ||
      (paymentFilter === "unpaid" && !card.isPaid);

    return matchesSearch && matchesSpecialty && matchesPayment;
  });

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
            Access patient registration records, manage prescriptions, and
            record medical histories.
          </p>
        </div>

        <button
          onClick={fetchCards}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-all backdrop-blur-sm"
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
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none capitalize"
            >
              <option value="all">All Specialties</option>
              {uniqueSpecialties.map((spec) => (
                <option key={spec} value={spec} className="capitalize">
                  {formatSpecialty(spec)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
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
        <PatientCardSkeletonGrid count={6} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => (
            <div
              key={card._id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs p-5 flex flex-col justify-between space-y-4"
            >
              <div>
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

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0 ${
                      card.isPaid
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {card.isPaid ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {card.isPaid ? "Paid" : "Unpaid"}
                  </span>
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

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
                      Registered:
                    </span>
                    <span className="font-mono text-slate-700 text-[11px]">
                      {formatDate(card.createdAt)}
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
          ))}
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
            className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4"
          >
            <Skeleton height={150} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}
