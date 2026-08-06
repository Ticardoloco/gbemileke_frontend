"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  FileText, 
  User, 
  Leaf, 
  Pill, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Filter,
  Calendar,
  Plus
} from "lucide-react";
import { 
  getPatientCard,  
  PatientCardDetails, 
} from "@/services/userService";
import { useApp } from "@/store/appStore";
import { getSpecialities, SpecialitiesType } from "@/services/specialitiesService";

export default function PatientDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterCard = searchParams.get("specialty") || "all";

  const [cards, setCards] = useState<PatientCardDetails[]>([]);
  const [specialties, setSpecialties] = useState<SpecialitiesType[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useApp();

  const handleFilterChange = (selectedSpecialty: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedSpecialty && selectedSpecialty !== "all") {
      params.set("specialty", selectedSpecialty);
    } else {
      params.delete("specialty");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await getSpecialities();
        setSpecialties(res?.specialities || []);
      } catch (error) {
        console.error("Error fetching specialities:", error);
      }
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const queryParams = filterCard !== "all" ? { specialty: filterCard } : undefined;
        const res = await getPatientCard(queryParams);
        const fetchedCards = res?.cards || [];
        
        setCards(fetchedCards);
        setSelectedCardId(fetchedCards[0]?._id || "");
      } catch (error) {
        console.error("Error fetching card data:", error);
        setCards([]);
        setSelectedCardId("");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [filterCard]);

  // --- SKELETON LOADER STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 lg:p-8 animate-pulse">
        {/* Top Header Skeleton */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-44 sm:w-56 bg-slate-200 rounded-md" />
              <div className="h-4 w-60 sm:w-72 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="h-10 w-full sm:w-40 bg-slate-200 rounded-xl" />
            <div className="h-10 w-full sm:w-44 bg-slate-200 rounded-xl" />
          </div>
        </header>

        {/* Card Switcher Tabs Skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded-md" />
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
            <div className="h-9 w-32 bg-slate-200 rounded-xl shrink-0" />
            <div className="h-9 w-36 bg-slate-200 rounded-xl shrink-0" />
            <div className="h-9 w-28 bg-slate-200 rounded-xl shrink-0" />
          </div>
        </div>

        {/* Main Content Skeleton Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Sidebar Digital Card Skeleton */}
          <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
            <div className="bg-slate-200 h-64 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-slate-300 rounded" />
                  <div className="h-5 w-40 bg-slate-300 rounded" />
                </div>
                <div className="w-6 h-6 bg-slate-300 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-32 bg-slate-300 rounded" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-3 bg-slate-300 rounded" />
                  <div className="h-3 bg-slate-300 rounded" />
                  <div className="h-3 bg-slate-300 rounded" />
                  <div className="h-3 bg-slate-300 rounded" />
                </div>
              </div>
              <div className="h-8 bg-slate-300 rounded-xl w-full mt-4" />
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="h-5 w-36 bg-slate-200 rounded-md" />
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
          </div>

          {/* Prescriptions & Medical History Skeleton */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="h-6 w-44 bg-slate-200 rounded-md" />
              <div className="space-y-3">
                <div className="h-16 bg-slate-100 rounded-xl" />
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="h-6 w-52 bg-slate-200 rounded-md" />
              <div className="space-y-3">
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-20 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCard = cards.find((c) => c._id === selectedCardId) || cards[0] || null;
  const displayUser = user || activeCard?.patient;

  const prescriptionList = Array.isArray(activeCard?.prescriptions)
    ? activeCard.prescriptions
    : activeCard?.prescriptions
    ? [activeCard.prescriptions]
    : [];

  const formatDate = (isoString?: string | Date) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg sm:text-xl border-2 border-emerald-500 capitalize shrink-0">
            {displayUser?.fullName?.split(" ").map((n) => n[0]).join("") || "P"}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize truncate">
              {displayUser?.fullName || "Patient Dashboard"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
              <span className="truncate">Email: <strong className="text-slate-700">{displayUser?.email || "N/A"}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Active Cards: <strong className="text-emerald-700">{cards.length}</strong></span>
            </p>
          </div>
        </div>

        {/* Actions: Filter + Book Appointment Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Specialty Select Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-400 sm:hidden">Filter:</span>
            </div>
            <select
              value={filterCard}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Specialties</option>
              {specialties.toReversed().map((spec) => (
                <option key={spec._id} value={spec.slug}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Appointment CTA Button */}
          {cards.length > 0 && activeCard && (
            <button
              onClick={() => router.push("/book")}
              className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] w-full sm:w-auto"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {cards.length > 0 && activeCard ? (
        <>
          {/* Card Switcher Tabs */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-700" /> Switch Active Card:
            </p>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
              {cards.map((card) => {
                const isSelected = activeCard._id === card._id;
                return (
                  <button
                    key={card._id}
                    onClick={() => setSelectedCardId(card._id)}
                    className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 capitalize flex items-center gap-2 shrink-0 border ${
                      isSelected
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-900/10"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80"
                    }`}
                  >
                    <span>{card.specialty?.replace(/-/g, " ") || "General"}</span>
                    <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected ? "bg-emerald-700 text-emerald-100" : "bg-slate-100 text-slate-500"
                    }`}>
                      #{card._id.slice(-4).toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Sidebar Digital Card - Placed FIRST on mobile for better mobile UX */}
            <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
              <section className="bg-linear-to-br from-emerald-900 to-emerald-800 text-white p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-emerald-200 font-semibold">Hospital Digital Card</p>
                    <h3 className="text-base sm:text-lg font-bold mt-0.5">Gbemileke Tradomedical</h3>
                  </div>
                  <Leaf className="w-6 h-6 text-emerald-300 shrink-0" />
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-[10px] sm:text-xs text-emerald-200">Patient Name</p>
                    <p className="text-base sm:text-lg font-bold capitalize">{displayUser?.fullName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-emerald-200 text-[10px]">Card ID</p>
                      <p className="font-mono font-bold">{activeCard._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-[10px]">Specialty</p>
                      <p className="font-semibold capitalize text-amber-300 truncate">{activeCard.specialty?.replace(/-/g, " ") || "General"}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-[10px]">Phone</p>
                      <p className="font-medium truncate">{displayUser?.phoneNumber || activeCard.patient?.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-[10px]">Age / Status</p>
                      <p className="font-medium capitalize">{activeCard.age} yrs • {activeCard.maritalStatus}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-700/50 flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1 text-emerald-200">
                    Fee: ₦{activeCard.cardFee?.toLocaleString() ?? 0}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${activeCard.isPaid ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                    {activeCard.isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {activeCard.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>

                {/* Mobile Specific Quick Action inside Card */}
                <button
                  onClick={() => router.push('/book')}
                  className="mt-4 w-full bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-600/50"
                >
                  <Plus className="w-3.5 h-3.5" /> Book for this Specialty
                </button>
              </section>

              <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" /> Next of Kin Details
                </h3>
                
                <div className="text-xs sm:text-sm space-y-2 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100">
                  <p className="text-slate-500">Name: <strong className="text-slate-800">{activeCard.nextOfKinName || "N/A"}</strong></p>
                  <p className="text-slate-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-800 font-mono">{activeCard.nextOfKinPhone || "N/A"}</span>
                  </p>
                </div>
              </section>
            </div>

            {/* Prescriptions & Medical History - Second on mobile, left column on desktop */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
              {/* Prescriptions */}
              <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-700 shrink-0" /> Prescriptions ({activeCard.specialty?.replace(/-/g, " ")})
                </h2>

                {prescriptionList.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptionList.map((p, idx) => (
                      <div key={p._id || `${p.product}-${idx}`} className="p-3.5 sm:p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">{p.product}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Dosage: <span className="font-medium text-slate-800">{p.dosage}</span></p>
                        </div>
                        <span className="text-[11px] sm:text-xs text-slate-400 font-mono self-start sm:self-auto">
                          {formatDate(p.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 py-4 text-center">No active prescriptions assigned for this card.</p>
                )}
              </section>

              {/* History */}
              <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700 shrink-0" /> Medical History Notes
                </h2>

                {activeCard.history && activeCard.history.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {activeCard.history.map((h) => (
                      <div key={h._id} className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[11px] sm:text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 truncate">Author: {h.author?.fullName} ({h.author?.role})</span>
                          <span className="font-mono">{formatDate(h.date)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{h.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 py-4 text-center">No medical history entries recorded yet for this card.</p>
                )}
              </section>
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-100 text-center max-w-xl mx-auto space-y-4 my-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">No Cards Found</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              There are no patient cards matching the selected specialty.
            </p>
          </div>
          {filterCard !== "all" && (
            <button
              onClick={() => handleFilterChange("all")}
              className="text-xs sm:text-sm text-emerald-700 font-semibold underline cursor-pointer hover:text-emerald-800"
            >
              Reset filter to view all cards
            </button>
          )}
        </div>
      )}
    </div>
  );
}