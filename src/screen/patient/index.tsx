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
  Plus,
  Receipt,
  Wallet,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { getPatientCard, PatientCardDetails } from "@/services/userService";
import { useApp } from "@/store/appStore";
import { getSpecialities, SpecialitiesType } from "@/services/specialitiesService";

// Helper Functions
const formatDate = (isoString?: string | Date) => {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number = 0) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

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

  // Modal State
  const [activeModal, setActiveModal] = useState<"prescriptions" | "payments" | "history" | null>(null);

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

  if (loading) {
    return <DashboardSkeleton />;
  }

  const activeCard = cards.find((c) => c._id === selectedCardId) || cards[0] || null;
  const displayUser = user || activeCard?.patient;

  const prescriptionList = Array.isArray(activeCard?.prescriptions)
    ? activeCard.prescriptions
    : activeCard?.prescriptions
    ? [activeCard.prescriptions]
    : [];

  const recentPrescription = prescriptionList.at(-1) || null;

  const billing = activeCard?.billing;
  const sessions = billing?.sessions || [];
  const paymentHistory = billing?.paymentHistory || [];
  const recentPayment = paymentHistory.at(-1) || null;

  const totalAmount = billing?.totalAmount || 0;
  const amountPaid = billing?.amountPaid || 0;
  const outstandingBalance = activeCard?.outstandingBalance ?? (totalAmount - amountPaid);

  const historyList = activeCard?.history || [];
  const recentHistory = historyList.at(-1) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg sm:text-xl border-2 border-emerald-500 capitalize shrink-0">
            {displayUser?.fullName?.split(" ").map((n) => n[0]).join("") || "P"}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize truncate">
              {displayUser?.fullName || "Patient Dashboard"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
              <span className="truncate">
                Email: <strong className="text-slate-700">{displayUser?.email || "N/A"}</strong>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>
                Active Cards: <strong className="text-emerald-700">{cards.length}</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-400 sm:hidden">Filter:</span>
            </div>
            <select
              value={filterCard}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer w-full sm:w-auto capitalize"
            >
              <option value="all">All Specialties</option>
              {specialties.toReversed().map((spec) => (
                <option key={spec._id} value={spec.slug}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {cards.length > 0 && activeCard && (
            <button
              onClick={() => router.push("/book")}
              className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-xs active:scale-[0.98] w-full sm:w-auto cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          )}
        </div>
      </header>

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
                    className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 capitalize flex items-center gap-2 shrink-0 border cursor-pointer ${
                      isSelected
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-900/10"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80"
                    }`}
                  >
                    <span>{card.specialty?.replace(/-/g, " ") || "General"}</span>
                    <span
                      className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-mono ${
                        isSelected ? "bg-emerald-700 text-emerald-100" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      #{card._id.slice(-4).toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Sidebar Digital Card & Next of Kin */}
            <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
              {/* Digital Card */}
              <section className="bg-linear-to-br from-emerald-900 to-emerald-800 text-white p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-emerald-200 font-semibold">
                      Hospital Digital Card
                    </p>
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
                      <p className="font-semibold capitalize text-amber-300 truncate">
                        {activeCard.specialty?.replace(/-/g, " ") || "General"}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-[10px]">Phone</p>
                      <p className="font-medium truncate">
                        {displayUser?.phoneNumber || activeCard.patient?.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-[10px]">Age / Status</p>
                      <p className="font-medium capitalize">
                        {activeCard.age ?? 0} yrs • {activeCard.maritalStatus || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-700/50 flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1 text-emerald-200">
                    Fee: {formatCurrency(activeCard.cardFee ?? 10000)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      activeCard.isPaid ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    }`}
                  >
                    {activeCard.isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {activeCard.isPaid ? "Card Paid" : "Pending"}
                  </span>
                </div>

                <button
                  onClick={() => router.push("/book")}
                  className="mt-4 w-full bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-600/50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Book for this Specialty
                </button>
              </section>

              {/* Account Summary */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-700" /> Account Summary
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold">Total Cost</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-semibold">Amount Paid</p>
                    <p className="font-bold text-emerald-700 text-sm mt-0.5">{formatCurrency(amountPaid)}</p>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    outstandingBalance > 0
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                      Outstanding Balance
                    </p>
                    <p className="text-base font-extrabold font-mono mt-0.5">{formatCurrency(outstandingBalance)}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      billing?.paymentStatus === "paid"
                        ? "bg-emerald-200 text-emerald-800"
                        : "bg-amber-200 text-amber-800"
                    }`}
                  >
                    {billing?.paymentStatus || "paid"}
                  </span>
                </div>
              </section>

              {/* Next of Kin */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" /> Next of Kin Details
                </h3>

                <div className="text-xs sm:text-sm space-y-2 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100">
                  <p className="text-slate-500">
                    Name: <strong className="text-slate-800">{activeCard.nextOfKinName || "N/A"}</strong>
                  </p>
                  <p className="text-slate-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-800 font-mono">{activeCard.nextOfKinPhone || "N/A"}</span>
                  </p>
                </div>
              </section>
            </div>

            {/* Prescriptions, Billing Sessions, & Medical History */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
              {/* Prescriptions Section */}
              <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-emerald-700 shrink-0" /> Recent Prescription
                  </h2>
                  {prescriptionList.length > 1 && (
                    <button
                      onClick={() => setActiveModal("prescriptions")}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      View All ({prescriptionList.length}) <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {recentPrescription ? (
                  <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{recentPrescription.product}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Dosage: <span className="font-medium text-slate-800">{recentPrescription.dosage}</span>
                      </p>
                    </div>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-mono self-start sm:self-auto flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {formatDate(recentPrescription.date)}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 py-4 text-center">
                    No active prescriptions assigned for this card.
                  </p>
                )}
              </section>

              {/* Treatment Sessions & Billing Breakdown */}
              <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-700 shrink-0" /> Treatment Sessions & Billing
                </h2>

                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session._id}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{session.title}</h3>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                session.isClosed ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {session.isClosed ? "Completed" : "Active"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Recorded by:{" "}
                            <span className="font-semibold text-slate-700">
                              {session.createdBy?.fullName || "Practitioner"}
                            </span>
                          </p>
                        </div>

                        <div className="text-right self-end sm:self-center">
                          <p className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                            {formatCurrency(session.cost)}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">{formatDate(session.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 py-3 text-center">
                    No active billing sessions recorded yet.
                  </p>
                )}

                {/* Payment Receipt Recent Preview */}
                {paymentHistory.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recent Payment:
                      </p>
                      {paymentHistory.length > 1 && (
                        <button
                          onClick={() => setActiveModal("payments")}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          View Payment History ({paymentHistory.length}) <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {recentPayment && (
                      <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/80 text-xs space-y-1">
                        <div className="flex justify-between items-center font-semibold text-emerald-900">
                          <span>{formatCurrency(recentPayment.amount)}</span>
                          <span className="uppercase text-[10px] font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">
                            {recentPayment.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                          <span>Ref: {recentPayment.reference}</span>
                          <span className="font-mono">{formatDate(recentPayment.date)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Medical History Section */}
              <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-700 shrink-0" /> Recent Medical Note
                  </h2>
                  {historyList.length > 1 && (
                    <button
                      onClick={() => setActiveModal("history")}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      View Full History ({historyList.length}) <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {recentHistory ? (
                  <div className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[11px] sm:text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 truncate">
                        Author: {recentHistory.author?.fullName || "Practitioner"}{" "}
                        {recentHistory.author?.role ? `(${recentHistory.author.role})` : ""}
                      </span>
                      <span className="font-mono">{formatDate(recentHistory.date)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{recentHistory.note}</p>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 py-4 text-center">
                    No medical history entries recorded yet for this card.
                  </p>
                )}
              </section>
            </div>
          </div>

          {/* Modal Container */}
          {activeModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    {activeModal === "prescriptions" && (
                      <>
                        <Pill className="w-5 h-5 text-emerald-700" /> All Prescriptions (
                        {activeCard.specialty?.replace(/-/g, " ") || "General"})
                      </>
                    )}
                    {activeModal === "payments" && (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" /> Complete Payment History
                      </>
                    )}
                    {activeModal === "history" && (
                      <>
                        <FileText className="w-5 h-5 text-emerald-700" /> Full Medical History Notes
                      </>
                    )}
                  </h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
                  {activeModal === "prescriptions" &&
                    prescriptionList.toReversed().map((p, idx) => (
                      <div
                        key={p._id || `${p.product}-${idx}`}
                        className="p-3.5 sm:p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{p.product}</h4>
                          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                            Dosage: <span className="font-medium text-slate-800">{p.dosage}</span>
                          </p>
                        </div>
                        <span className="text-[11px] sm:text-xs text-slate-400 font-mono self-start sm:self-auto flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {formatDate(p.date)}
                        </span>
                      </div>
                    ))}

                  {activeModal === "payments" &&
                    paymentHistory.toReversed().map((pay) => (
                      <div
                        key={pay._id}
                        className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100/80 text-xs space-y-1.5"
                      >
                        <div className="flex justify-between items-center font-semibold text-emerald-900">
                          <span className="text-sm">{formatCurrency(pay.amount)}</span>
                          <span className="uppercase text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
                            {pay.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                          <span>Ref: {pay.reference}</span>
                          <span className="font-mono">{formatDate(pay.date)}</span>
                        </div>
                      </div>
                    ))}

                  {activeModal === "history" &&
                    historyList.toReversed().map((h) => (
                      <div key={h._id} className="p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[11px] sm:text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 truncate">
                            Author: {h.author?.fullName || "Practitioner"}{" "}
                            {h.author?.role ? `(${h.author.role})` : ""}
                          </span>
                          <span className="font-mono">{formatDate(h.date)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{h.note}</p>
                      </div>
                    ))}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 text-right">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-100 text-center max-w-xl mx-auto space-y-4 my-8 shadow-xs">
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

// Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 lg:p-8 animate-pulse">
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

      <div className="mb-6 space-y-2">
        <div className="h-4 w-32 bg-slate-200 rounded-md" />
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
          <div className="h-9 w-32 bg-slate-200 rounded-xl shrink-0" />
          <div className="h-9 w-36 bg-slate-200 rounded-xl shrink-0" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-6 order-1 lg:order-2">
          <div className="bg-slate-200 h-64 rounded-2xl p-5" />
          <div className="bg-white p-5 rounded-2xl border border-slate-100 h-40" />
        </div>

        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 h-48" />
          <div className="bg-white p-6 rounded-2xl border border-slate-100 h-48" />
        </div>
      </div>
    </div>
  );
}