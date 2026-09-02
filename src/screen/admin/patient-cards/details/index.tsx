/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PatientCardDetails,
  getPatientCardById,
  postMedicalHistory,
  postPrescriptions,
  updateMedicalHistory,
  deleteMedicalHistory,
  updatePrescription,
  deletePrescription,
  postBillingSessions,
  closeTreatmentSection,
  MedicalHistoryPayload,
  PrescriptionPayload,
  BillingSessionsPayload,
  SessionType,
  PrescriptionsType,
} from "@/services/userService";
import Image from "next/image";

export default function PatientCardDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;

  const [card, setCard] = useState<PatientCardDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "history" | "prescriptions" | "billing"
  >("history");

  // Add Clinical Note Form State
  const [historyNote, setHistoryNote] = useState("");

  // Prescription Form State
  const [product, setProduct] = useState("");
  const [dosage, setDosage] = useState("");

  // Add Treatment Session Form State
  const [treatmentTitle, setTreatmentTitle] = useState("");
  const [treatmentCost, setTreatmentCost] = useState<number | "">("");
  const [treatmentNotes, setTreatmentNotes] = useState("");

  // Edit Inline States
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editHistoryNote, setEditHistoryNote] = useState("");

  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    string | null
  >(null);
  const [editProduct, setEditProduct] = useState("");
  const [editDosage, setEditDosage] = useState("");

  // Modal State for Closing Treatment Session
  const [closingSession, setClosingSession] = useState<SessionType | null>(null);

  const loadCardData = useCallback(async () => {
    if (!cardId) return;
    try {
      setError(null);
      const data = await getPatientCardById(cardId);
      setCard(data.card);
    } catch (err: any) {
      console.error("Error fetching patient card:", err);
      const errorMsg =
        err?.response?.data?.message ||
        "Failed to load patient card. Please verify the ID or try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    if (cardId) loadCardData();
  }, [cardId, loadCardData]);

  const handleAction = async (
    actionFn: () => Promise<any>,
    successCleanup: () => void,
    successMessage: string
  ) => {
    setSubmitting(true);
    try {
      await actionFn();
      successCleanup();
      await loadCardData();
      toast.success(successMessage);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || "Action failed. Please try again.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Medical History Actions ---
  const handleAddHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyNote.trim()) return;
    const payload: MedicalHistoryPayload = { note: historyNote };
    handleAction(
      () => postMedicalHistory(cardId, payload),
      () => setHistoryNote(""),
      "Clinical note added successfully!"
    );
  };

  const handleUpdateHistory = (itemId: string) => {
    if (!editHistoryNote.trim()) return;
    handleAction(
      () => updateMedicalHistory(cardId, itemId, { note: editHistoryNote }),
      () => setEditingHistoryId(null),
      "Clinical note updated!"
    );
  };

  const handleDeleteHistory = (itemId: string) => {
    if (!confirm("Are you sure you want to delete this clinical note?")) return;
    handleAction(
      () => deleteMedicalHistory(cardId, itemId),
      () => {},
      "Clinical note deleted."
    );
  };

  // --- Prescription Actions ---
  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim() || !dosage.trim()) return;
    const payload: PrescriptionPayload = { product, dosage };
    handleAction(
      () => postPrescriptions(cardId, payload),
      () => {
        setProduct("");
        setDosage("");
      },
      "Prescription added successfully!"
    );
  };

  const handleUpdatePrescription = (itemId: string) => {
    if (!editProduct.trim() || !editDosage.trim()) return;
    handleAction(
      () =>
        updatePrescription(cardId, itemId, {
          product: editProduct,
          dosage: editDosage,
        }),
      () => setEditingPrescriptionId(null),
      "Prescription updated!"
    );
  };

  const handleDeletePrescription = (itemId: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return;
    handleAction(
      () => deletePrescription(cardId, itemId),
      () => {},
      "Prescription deleted."
    );
  };

  // --- Treatment Session Actions ---
  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentTitle.trim() || treatmentCost === "") return;

    const payload: BillingSessionsPayload = {
      title: treatmentTitle,
      cost: Number(treatmentCost),
      notes: treatmentNotes,
    };

    handleAction(
      () => postBillingSessions(cardId, payload),
      () => {
        setTreatmentTitle("");
        setTreatmentCost("");
        setTreatmentNotes("");
      },
      "Treatment session added successfully!"
    );
  };

  const handleConfirmCloseSession = () => {
    if (!closingSession) return;

    handleAction(
      () => closeTreatmentSection(cardId, closingSession._id),
      () => setClosingSession(null),
      "Treatment section closed successfully!"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-pulse text-slate-500 font-medium">
          Loading patient record...
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <p className="text-red-500 font-medium">
          {error || "Patient record not found."}
        </p>
        <button
          onClick={loadCardData}
          className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const prescriptionsList: PrescriptionsType[] = Array.isArray(
    card.prescriptions
  )
    ? card.prescriptions
    : card.prescriptions
    ? [card.prescriptions]
    : [];

  const chargesList: SessionType[] = card.billing?.sessions || [];
  const paymentsList = card.billing?.paymentHistory || [];

  const isCardClosed = (card as any).status === "closed" || (card as any).isClosed;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen relative">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
              isCardClosed
                ? "bg-slate-200 text-slate-700 border-slate-300"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isCardClosed ? "Card Status: Closed" : "Card Status: Active"}
          </span>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-2xl overflow-hidden shrink-0">
            {card.patient?.avatar ? (
              <Image
                width={80}
                height={80}
                src={card.patient.avatar}
                alt={card.patient.fullName || "Patient Avatar"}
                className="w-20 h-20 rounded-full object-cover border border-slate-200 bg-slate-100"
              />
            ) : (
              card.patient?.fullName?.charAt(0).toUpperCase() || "P"
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {card.patient?.fullName}
            </h1>
            <p className="text-sm text-slate-500">
              {card.patient?.email} | {card.patient?.phoneNumber}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                {card.specialty}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  card.isPaid
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {card.isPaid ? "Registration Paid" : "Payment Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-600 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div>
            <span className="text-slate-400 font-bold block uppercase">
              Phone
            </span>
            <span className="text-slate-800 text-sm font-medium">
              {card.patient?.phoneNumber || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase">
              Age
            </span>
            <span className="text-slate-800 text-sm font-medium">
              {card.age} years
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase">
              Marital Status
            </span>
            <span className="text-slate-800 text-sm font-medium">
              {card.maritalStatus}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase">
              Origin
            </span>
            <span className="text-slate-800 text-sm font-medium">
              {card.stateOfOrigin} State
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase">
              Next Of Kin
            </span>
            <span className="text-slate-800 text-sm font-medium">
              {card.nextOfKinName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase">
              NOK Contact
            </span>
            <span className="text-slate-800 text-sm font-medium">
              {card.nextOfKinPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 overflow-x-auto">
        {(["history", "prescriptions", "billing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-medium text-sm capitalize border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-emerald-600 text-emerald-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "history"
              ? "Clinical Notes"
              : tab === "billing"
              ? "Treatments & Billing"
              : tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-4 md:p-6 rounded-b-xl shadow-xs border border-slate-200 border-t-0">
        {/* CLINICAL NOTES TAB */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {!isCardClosed ? (
              <form onSubmit={handleAddHistory} className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Add Clinical Note / Diagnostic Update
                </label>
                <textarea
                  value={historyNote}
                  onChange={(e) => setHistoryNote(e.target.value)}
                  placeholder="Enter patient observations, diagnostic findings, or treatment updates..."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Clinical Note"}
                </button>
              </form>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                This patient card is closed. Editing clinical notes is restricted.
              </div>
            )}

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-800 text-sm">
                Medical History Timeline
              </h3>
              {card.history && card.history.length > 0 ? (
                card.history.slice().reverse().map((item) => (
                  <div
                    key={item._id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
                  >
                    <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
                      <span className="font-semibold text-slate-700">
                        Practitioner: {item.author?.fullName || "Doctor"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span>
                          {new Date(item.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {!isCardClosed && (
                          <>
                            <button
                              onClick={() => {
                                setEditingHistoryId(item._id);
                                setEditHistoryNote(item.note);
                              }}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteHistory(item._id)}
                              className="text-red-600 hover:underline font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingHistoryId === item._id ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          value={editHistoryNote}
                          onChange={(e) => setEditHistoryNote(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateHistory(item._id)}
                            disabled={submitting}
                            className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingHistoryId(null)}
                            className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {item.note}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">
                  No medical history logged for this patient yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* PRESCRIPTIONS TAB */}
        {activeTab === "prescriptions" && (
          <div className="space-y-6">
            {!isCardClosed && (
              <form
                onSubmit={handleAddPrescription}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medicine / Product
                  </label>
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g. Herbal Mixture A"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dosage Instruction
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 2 spoons daily after breakfast"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg h-fit disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Prescribing..." : "Prescribe Medicine"}
                </button>
              </form>
            )}

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">
                Prescription History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
                    <tr>
                      <th className="p-3 border-b">Product</th>
                      <th className="p-3 border-b">Dosage</th>
                      <th className="p-3 border-b">Date Prescribed</th>
                      {!isCardClosed && (
                        <th className="p-3 border-b text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionsList.length > 0 ? (
                      prescriptionsList.slice().reverse().map((p) => (
                        <tr
                          key={p._id}
                          className="border-b hover:bg-slate-50 transition-colors"
                        >
                          {editingPrescriptionId === p._id ? (
                            <>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={editProduct}
                                  onChange={(e) =>
                                    setEditProduct(e.target.value)
                                  }
                                  className="p-1 border border-slate-300 rounded text-sm w-full"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={editDosage}
                                  onChange={(e) =>
                                    setEditDosage(e.target.value)
                                  }
                                  className="p-1 border border-slate-300 rounded text-sm w-full"
                                />
                              </td>
                              <td className="p-3 text-slate-500">
                                {new Date(p.date).toLocaleDateString()}
                              </td>
                              <td className="p-2 text-right space-x-2">
                                <button
                                  onClick={() =>
                                    handleUpdatePrescription(p._id)
                                  }
                                  className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() =>
                                    setEditingPrescriptionId(null)
                                  }
                                  className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-3 font-medium text-slate-800">
                                {p.product}
                              </td>
                              <td className="p-3">{p.dosage}</td>
                              <td className="p-3 text-slate-500">
                                {new Date(p.date).toLocaleDateString()}
                              </td>
                              {!isCardClosed && (
                                <td className="p-3 text-right space-x-3 text-xs">
                                  <button
                                    onClick={() => {
                                      setEditingPrescriptionId(p._id);
                                      setEditProduct(p.product);
                                      setEditDosage(p.dosage);
                                    }}
                                    className="text-blue-600 font-medium hover:underline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeletePrescription(p._id)
                                    }
                                    className="text-red-600 font-medium hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              )}
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={isCardClosed ? 3 : 4}
                          className="p-4 text-center text-slate-400 italic"
                        >
                          No active prescriptions recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BILLING & TREATMENT TAB */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            {/* Financial Overview Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  Total Charges
                </span>
                <span className="text-2xl font-bold text-slate-800">
                  ₦{card.billing?.totalAmount?.toLocaleString() || 0}
                </span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  Amount Paid
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  ₦{card.billing?.amountPaid?.toLocaleString() || 0}
                </span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  Balance Due
                </span>
                <span className="text-2xl font-bold text-amber-600">
                  ₦{card.outstandingBalance?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-200 pt-6">
              {/* Treatment & Service Charges List */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 text-sm">
                  Treatment & Billed Sessions
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border border-slate-200 bg-white rounded-lg">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                      <tr>
                        <th className="p-2.5 border-b">Session Title</th>
                        <th className="p-2.5 border-b">Status</th>
                        <th className="p-2.5 border-b text-right">Cost (₦)</th>
                        <th className="p-2.5 border-b text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chargesList.length > 0 ? (
                        chargesList.map((session: SessionType) => (
                          <tr key={session._id} className="border-b">
                            <td className="p-2.5 font-medium text-slate-800">
                              {session.title}
                              {session.createdBy && (
                                <span className="block text-[10px] text-slate-400">
                                  By: {session.createdBy.fullName}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  session.isClosed
                                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {session.isClosed ? "Closed" : "Active"}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-semibold text-slate-700 whitespace-nowrap">
                              ₦{(session.cost || 0).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-right">
                              {!session.isClosed && !isCardClosed ? (
                                <button
                                  onClick={() => setClosingSession(session)}
                                  disabled={submitting}
                                  className="px-2 py-1 text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded font-medium transition-all"
                                >
                                  Close
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[11px]">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-3 text-center text-slate-400 italic"
                          >
                            No service charges billed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Treatment Section Form */}
              {!isCardClosed ? (
                <form
                  onSubmit={handleAddTreatment}
                  className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
                >
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Add Treatment Session
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Treatment / Service Name
                    </label>
                    <input
                      type="text"
                      value={treatmentTitle}
                      onChange={(e) => setTreatmentTitle(e.target.value)}
                      placeholder="e.g. Initial Consultation / Therapy Session"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cost (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={treatmentCost}
                      onChange={(e) =>
                        setTreatmentCost(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="e.g. 15000"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Session Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={treatmentNotes}
                      onChange={(e) => setTreatmentNotes(e.target.value)}
                      placeholder="Additional details about this session..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Treatment Session"}
                  </button>
                </form>
              ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center justify-center text-center text-slate-500 text-sm">
                  This card is closed. You cannot add new treatment sessions.
                </div>
              )}
            </div>

            {/* Payment History Log */}
            <div className="border-t border-slate-200 pt-6 space-y-3">
              <h4 className="font-semibold text-slate-800 text-sm">
                Payment Received History
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border border-slate-200 bg-white rounded-lg">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                    <tr>
                      <th className="p-2.5 border-b">Reference / Receipt</th>
                      <th className="p-2.5 border-b">Method</th>
                      <th className="p-2.5 border-b">Date</th>
                      <th className="p-2.5 border-b text-right">
                        Amount Paid (₦)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsList.length > 0 ? (
                      paymentsList.map((pay: any, idx: number) => (
                        <tr key={pay._id || idx} className="border-b">
                          <td className="p-2.5 font-medium text-slate-800">
                            {pay.reference || "N/A"}
                          </td>
                          <td className="p-2.5 capitalize">
                            {pay.paymentMethod || "Transfer"}
                          </td>
                          <td className="p-2.5">
                            {pay.date
                              ? new Date(pay.date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-emerald-600">
                            ₦{(pay.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-3 text-center text-slate-400 italic"
                        >
                          No payment records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CLOSE SECTION POP-UP MODAL */}
      {closingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Close Treatment Session
                  </h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to mark this session as completed?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClosingSession(null)}
                disabled={submitting}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Session Info Summary */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Session Name:</span>
                <span className="font-semibold text-slate-800">
                  {closingSession.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billed Cost:</span>
                <span className="font-semibold text-emerald-700">
                  ₦{(closingSession.cost || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Closing this treatment session flags it as completed. You will not be able to perform further updates on this session segment.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClosingSession(null)}
                disabled={submitting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseSession}
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Closing..." : "Yes, Close Section"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}