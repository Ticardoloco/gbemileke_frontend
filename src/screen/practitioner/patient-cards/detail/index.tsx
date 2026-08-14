// /* eslint-disable react-hooks/set-state-in-effect */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import { useParams } from "next/navigation";
// import { toast } from "sonner";
// import {
//   PatientCardDetails,
//   getPatientCardById,
//   postMedicalHistory,
//   postPrescriptions,
//   postBillingPayment,
//   updateMedicalHistory,
//   deleteMedicalHistory,
//   updatePrescription,
//   deletePrescription,
//   MedicalHistoryPayload,
//   PrescriptionPayload,
//   BillingPaymentPayload,
// } from "@/services/userService";
// import Image from "next/image";

// export default function PatientCardDynamicPage() {
//   const params = useParams();
//   const cardId = params.id as string;

//   const [card, setCard] = useState<PatientCardDetails | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [submitting, setSubmitting] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<
//     "history" | "prescriptions" | "billing"
//   >("history");

//   // Add Form States
//   const [historyNote, setHistoryNote] = useState("");
//   const [product, setProduct] = useState("");
//   const [dosage, setDosage] = useState("");
//   const [payAmount, setPayAmount] = useState<number | "">("");
//   const [payMethod, setPayMethod] = useState("transfer");
//   const [payRef, setPayRef] = useState("");

//   // Edit Inline States
//   const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
//   const [editHistoryNote, setEditHistoryNote] = useState("");

//   const [editingPrescriptionId, setEditingPrescriptionId] = useState<
//     string | null
//   >(null);
//   const [editProduct, setEditProduct] = useState("");
//   const [editDosage, setEditDosage] = useState("");

//   const loadCardData = useCallback(async () => {
//     if (!cardId) return;
//     try {
//       setError(null);
//       const data = await getPatientCardById(cardId);
//       setCard(data.card);
//     } catch (err: any) {
//       console.error("Error fetching patient card:", err);
//       const errorMsg =
//         "Failed to load patient card. Please verify the ID or try again.";
//       setError(errorMsg);
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   }, [cardId]);

//   useEffect(() => {
//     if (cardId) loadCardData();
//   }, [cardId, loadCardData]);

//   const handleAction = async (
//     actionFn: () => Promise<void>,
//     successCleanup: () => void,
//     successMessage: string,
//   ) => {
//     setSubmitting(true);
//     try {
//       await actionFn();
//       successCleanup();
//       await loadCardData();
//       toast.success(successMessage);
//     } catch (err: any) {
//       const errMsg =
//         err?.response?.data?.message || "Action failed. Please try again.";
//       toast.error(errMsg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // --- Medical History Actions ---
//   const handleAddHistory = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!historyNote.trim()) return;
//     const payload: MedicalHistoryPayload = { note: historyNote };
//     handleAction(
//       () => postMedicalHistory(cardId, payload),
//       () => setHistoryNote(""),
//       "Clinical note added successfully!",
//     );
//   };

//   const handleUpdateHistory = (itemId: string) => {
//     if (!editHistoryNote.trim()) return;
//     handleAction(
//       () => updateMedicalHistory(cardId, itemId, { note: editHistoryNote }),
//       () => setEditingHistoryId(null),
//       "Clinical note updated!",
//     );
//   };

//   const handleDeleteHistory = (itemId: string) => {
//     if (!confirm("Are you sure you want to delete this clinical note?")) return;
//     handleAction(
//       () => deleteMedicalHistory(cardId, itemId),
//       () => {},
//       "Clinical note deleted.",
//     );
//   };

//   // --- Prescription Actions ---
//   const handleAddPrescription = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!product.trim() || !dosage.trim()) return;
//     const payload: PrescriptionPayload = { product, dosage };
//     handleAction(
//       () => postPrescriptions(cardId, payload),
//       () => {
//         setProduct("");
//         setDosage("");
//       },
//       "Prescription added successfully!",
//     );
//   };

//   const handleUpdatePrescription = (itemId: string) => {
//     if (!editProduct.trim() || !editDosage.trim()) return;
//     handleAction(
//       () =>
//         updatePrescription(cardId, itemId, {
//           product: editProduct,
//           dosage: editDosage,
//         }),
//       () => setEditingPrescriptionId(null),
//       "Prescription updated!",
//     );
//   };

//   const handleDeletePrescription = (itemId: string) => {
//     if (!confirm("Are you sure you want to delete this prescription?")) return;
//     handleAction(
//       () => deletePrescription(cardId, itemId),
//       () => {},
//       "Prescription deleted.",
//     );
//   };

//   // --- Billing Action ---
//   const handleAddPayment = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!payAmount || !payRef.trim()) return;
//     const payload: BillingPaymentPayload = {
//       amount: Number(payAmount),
//       paymentMethod: payMethod,
//       reference: payRef,
//     };
//     handleAction(
//       () => postBillingPayment(cardId, payload),
//       () => {
//         setPayAmount("");
//         setPayRef("");
//       },
//       "Payment recorded successfully!",
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-slate-50">
//         <div className="animate-pulse text-slate-500 font-medium">
//           Loading patient record...
//         </div>
//       </div>
//     );
//   }

//   if (error || !card) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
//         <p className="text-red-500 font-medium">
//           {error || "Patient record not found."}
//         </p>
//         <button
//           onClick={loadCardData}
//           className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   const prescriptionsList = Array.isArray(card.prescriptions)
//     ? card.prescriptions
//     : card.prescriptions
//       ? [card.prescriptions]
//       : [];

//   const chargesList = card.billing?.sessions || [];
//   const paymentsList = card.billing?.paymentHistory || (card as any).payments || [];

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
//       {/* Patient Header */}
//       <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
//         <div className="flex items-center gap-4">
//           <div className="relative w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-2xl overflow-hidden shrink-0">
//             {card?.patient?.avatar ? (
//               <Image
//                 width={80}
//                 height={80}
//                 src={card?.patient?.avatar || "/default-avatar.png"}
//                 alt={card?.patient?.fullName || "Patient Avatar"}
//                 className="w-20 h-20 rounded-full object-cover border border-slate-200 bg-slate-100"
//               />
//             ) : (
//               card.patient?.fullName?.charAt(0).toUpperCase() || "P"
//             )}
//           </div>

//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">
//               {card?.patient?.fullName}
//             </h1>
//             <p className="text-sm text-slate-500">
//               {card?.patient?.email} | {card?.patient?.phoneNumber}
//             </p>
//             <div className="flex gap-2 mt-2">
//               <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
//                 {card?.specialty}
//               </span>
//               <span
//                 className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
//                   card?.isPaid
//                     ? "bg-blue-100 text-blue-800"
//                     : "bg-amber-100 text-amber-800"
//                 }`}
//               >
//                 {card?.isPaid ? "Card Active" : "Payment Pending"}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-600 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
//           <div>
//             <span className="text-slate-400 font-bold block">PHONE NUMBER</span>
//             <span className="text-slate-800 text-sm font-medium">
//               {card.patient?.phoneNumber || "N/A"}
//             </span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-bold block">AGE</span>
//             <span className="text-slate-800 text-sm font-medium">
//               {card.age} years
//             </span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-bold block">
//               MARITAL STATUS
//             </span>
//             <span className="text-slate-800 text-sm font-medium">
//               {card.maritalStatus}
//             </span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-bold block">ORIGIN</span>
//             <span className="text-slate-800 text-sm font-medium">
//               {card.stateOfOrigin} State
//             </span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-bold block">NEXT OF KIN</span>
//             <span className="text-slate-800 text-sm font-medium">
//               {card.nextOfKinName}
//             </span>
//           </div>
//           <div>
//             <span className="text-slate-400 font-bold block">NOK CONTACT</span>
//             <span className="text-slate-800 text-sm font-medium">
//               {card.nextOfKinPhone}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
//         {(["history", "prescriptions", "billing"] as const).map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-5 py-3 font-medium text-sm capitalize border-b-2 transition-colors ${
//               activeTab === tab
//                 ? "border-emerald-600 text-emerald-600"
//                 : "border-transparent text-slate-500 hover:text-slate-800"
//             }`}
//           >
//             {tab === "history" ? "Clinical Notes" : tab}
//           </button>
//         ))}
//       </div>

//       {/* Panels */}
//       <div className="bg-white p-6 rounded-b-xl shadow-xs border border-slate-200 border-t-0">
//         {/* CLINICAL NOTES TAB */}
//         {activeTab === "history" && (
//           <div className="space-y-6">
//             <form onSubmit={handleAddHistory} className="space-y-3">
//               <label className="block text-sm font-semibold text-slate-800">
//                 Add Clinical Note / Diagnostic Update
//               </label>
//               <textarea
//                 value={historyNote}
//                 onChange={(e) => setHistoryNote(e.target.value)}
//                 placeholder="Enter patient observations, diagnostic findings, or treatment updates..."
//                 className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
//                 rows={3}
//                 required
//               />
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
//               >
//                 {submitting ? "Saving..." : "Save Clinical Note"}
//               </button>
//             </form>

//             <div className="space-y-4 border-t border-slate-200 pt-6">
//               <h3 className="font-semibold text-slate-800 text-sm">
//                 Medical Timeline
//               </h3>
//               {card.history && card.history.length > 0 ? (
//                 card.history.map((item) => (
//                   <div
//                     key={item._id}
//                     className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
//                   >
//                     <div className="flex justify-between items-center text-xs text-slate-500">
//                       <span className="font-semibold text-slate-700">
//                         Practitioner: {item.author?.fullName || "Doctor"}
//                       </span>
//                       <div className="flex items-center gap-3">
//                         <span>
//                           {new Date(item.date).toLocaleDateString("en-GB", {
//                             day: "numeric",
//                             month: "short",
//                             year: "numeric",
//                           })}
//                         </span>
//                         <button
//                           onClick={() => {
//                             setEditingHistoryId(item._id);
//                             setEditHistoryNote(item.note);
//                           }}
//                           className="text-blue-600 hover:underline font-medium"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDeleteHistory(item._id)}
//                           className="text-red-600 hover:underline font-medium"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>

//                     {editingHistoryId === item._id ? (
//                       <div className="space-y-2 mt-2">
//                         <textarea
//                           value={editHistoryNote}
//                           onChange={(e) => setEditHistoryNote(e.target.value)}
//                           className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
//                           rows={2}
//                         />
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleUpdateHistory(item._id)}
//                             disabled={submitting}
//                             className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700"
//                           >
//                             Save
//                           </button>
//                           <button
//                             onClick={() => setEditingHistoryId(null)}
//                             className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-300"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
//                         {item.note}
//                       </p>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-slate-400 text-sm italic">
//                   No medical history logged for this patient yet.
//                 </p>
//               )}
//             </div>
//           </div>
//         )}

//         {/* PRESCRIPTIONS TAB */}
//         {activeTab === "prescriptions" && (
//           <div className="space-y-6">
//             <form
//               onSubmit={handleAddPrescription}
//               className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
//             >
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Medicine / Product
//                 </label>
//                 <input
//                   type="text"
//                   value={product}
//                   onChange={(e) => setProduct(e.target.value)}
//                   placeholder="e.g. Herbal Mixture A"
//                   className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Dosage Instruction
//                 </label>
//                 <input
//                   type="text"
//                   value={dosage}
//                   onChange={(e) => setDosage(e.target.value)}
//                   placeholder="e.g. 2 spoons daily after breakfast"
//                   className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg h-fit disabled:opacity-50 transition-colors"
//               >
//                 {submitting ? "Prescribing..." : "Prescribe Medicine"}
//               </button>
//             </form>

//             <div className="border-t border-slate-200 pt-6">
//               <h3 className="font-semibold text-slate-800 text-sm mb-3">
//                 Prescription History
//               </h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg">
//                   <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
//                     <tr>
//                       <th className="p-3 border-b">Product</th>
//                       <th className="p-3 border-b">Dosage</th>
//                       <th className="p-3 border-b">Date Prescribed</th>
//                       <th className="p-3 border-b text-right">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {prescriptionsList.length > 0 ? (
//                       prescriptionsList.map((p) => (
//                         <tr key={p._id} className="border-b hover:bg-slate-50">
//                           {editingPrescriptionId === p._id ? (
//                             <>
//                               <td className="p-2">
//                                 <input
//                                   type="text"
//                                   value={editProduct}
//                                   onChange={(e) =>
//                                     setEditProduct(e.target.value)
//                                   }
//                                   className="p-1 border border-slate-300 rounded text-sm w-full"
//                                 />
//                               </td>
//                               <td className="p-2">
//                                 <input
//                                   type="text"
//                                   value={editDosage}
//                                   onChange={(e) =>
//                                     setEditDosage(e.target.value)
//                                   }
//                                   className="p-1 border border-slate-300 rounded text-sm w-full"
//                                 />
//                               </td>
//                               <td className="p-3 text-slate-500">
//                                 {new Date(p.date).toLocaleDateString()}
//                               </td>
//                               <td className="p-2 text-right space-x-2">
//                                 <button
//                                   onClick={() =>
//                                     handleUpdatePrescription(p._id)
//                                   }
//                                   className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
//                                 >
//                                   Save
//                                 </button>
//                                 <button
//                                   onClick={() => setEditingPrescriptionId(null)}
//                                   className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
//                                 >
//                                   Cancel
//                                 </button>
//                               </td>
//                             </>
//                           ) : (
//                             <>
//                               <td className="p-3 font-medium text-slate-800">
//                                 {p.product}
//                               </td>
//                               <td className="p-3">{p.dosage}</td>
//                               <td className="p-3 text-slate-500">
//                                 {new Date(p.date).toLocaleDateString()}
//                               </td>
//                               <td className="p-3 text-right space-x-3 text-xs">
//                                 <button
//                                   onClick={() => {
//                                     setEditingPrescriptionId(p._id);
//                                     setEditProduct(p.product);
//                                     setEditDosage(p.dosage);
//                                   }}
//                                   className="text-blue-600 font-medium hover:underline"
//                                 >
//                                   Edit
//                                 </button>
//                                 <button
//                                   onClick={() =>
//                                     handleDeletePrescription(p._id)
//                                   }
//                                   className="text-red-600 font-medium hover:underline"
//                                 >
//                                   Delete
//                                 </button>
//                               </td>
//                             </>
//                           )}
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan={4}
//                           className="p-4 text-center text-slate-400 italic"
//                         >
//                           No active prescriptions recorded.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* BILLING TAB */}
//         {activeTab === "billing" && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
//               <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
//                 <span className="text-xs font-bold text-slate-400 block">
//                   TOTAL CHARGES
//                 </span>
//                 <span className="text-2xl font-bold text-slate-800">
//                   ₦{card.billing?.totalAmount?.toLocaleString() || 0}
//                 </span>
//               </div>
//               <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
//                 <span className="text-xs font-bold text-slate-400 block">
//                   AMOUNT PAID
//                 </span>
//                 <span className="text-2xl font-bold text-emerald-600">
//                   ₦{card.billing?.amountPaid?.toLocaleString() || 0}
//                 </span>
//               </div>
//               <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
//                 <span className="text-xs font-bold text-slate-400 block">
//                   BALANCE DUE
//                 </span>
//                 <span className="text-2xl font-bold text-amber-600">
//                   ₦{card.outstandingBalance?.toLocaleString() || 0}
//                 </span>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-6">
//               {/* Treatment / Service Charges View */}
//               <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
//                 <h4 className="font-semibold text-slate-800 text-sm">
//                   Treatment & Service Charges
//                 </h4>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left text-xs text-slate-600 border border-slate-200 bg-white rounded-lg">
//                     <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
//                       <tr>
//                         <th className="p-2 border-b">Service / Treatment</th>
//                         <th className="p-2 border-b text-right">Cost (₦)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {chargesList.length > 0 ? (
//                         chargesList.map((session: any, idx: number) => (
//                           <tr key={session._id || idx} className="border-b">
//                             <td className="p-2 font-medium text-slate-800">
//                               {session.title ||
//                                 session.serviceName ||
//                                 "Treatment Session"}
//                               {session.notes && (
//                                 <span className="block text-[10px] text-slate-400">
//                                   {session.notes}
//                                 </span>
//                               )}
//                             </td>
//                             <td className="p-2 text-right font-medium text-slate-700">
//                               ₦
//                               {(
//                                 session.cost ||
//                                 session.amount ||
//                                 0
//                               ).toLocaleString()}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td
//                             colSpan={2}
//                             className="p-3 text-center text-slate-400 italic"
//                           >
//                             No service charges billed yet.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Record Payment Form */}
//               <form
//                 onSubmit={handleAddPayment}
//                 className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
//               >
//                 <h4 className="font-semibold text-slate-800 text-sm">
//                   Record Payment Received
//                 </h4>
//                 <input
//                   type="number"
//                   min="0"
//                   value={payAmount}
//                   onChange={(e) =>
//                     setPayAmount(
//                       e.target.value === "" ? "" : Number(e.target.value),
//                     )
//                   }
//                   placeholder="Amount Paid (₦)"
//                   className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
//                   required
//                 />
//                 <select
//                   value={payMethod}
//                   onChange={(e) => setPayMethod(e.target.value)}
//                   className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
//                 >
//                   <option value="transfer">Bank Transfer</option>
//                   <option value="cash">Cash</option>
//                   <option value="pos">POS Terminal</option>
//                 </select>
//                 <input
//                   type="text"
//                   value={payRef}
//                   onChange={(e) => setPayRef(e.target.value)}
//                   placeholder="Payment Reference / Receipt #"
//                   className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
//                   required
//                 />
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   {submitting ? "Recording..." : "Record Payment"}
//                 </button>
//               </form>
//             </div>

//             {/* Payment History List */}
//             <div className="border-t border-slate-200 pt-6 space-y-3">
//               <h4 className="font-semibold text-slate-800 text-sm">
//                 Payment History
//               </h4>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-xs text-slate-600 border border-slate-200 bg-white rounded-lg">
//                   <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
//                     <tr>
//                       <th className="p-2.5 border-b">Reference</th>
//                       <th className="p-2.5 border-b">Method</th>
//                       <th className="p-2.5 border-b">Date</th>
//                       <th className="p-2.5 border-b text-right">Amount (₦)</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paymentsList.length > 0 ? (
//                       paymentsList.toReversed().map((payment: any, idx: number) => (
//                         <tr key={payment._id || idx} className="border-b hover:bg-slate-50">
//                           <td className="p-2.5 font-medium text-slate-800">
//                             {payment.reference || payment.receiptNo || "N/A"}
//                           </td>
//                           <td className="p-2.5 capitalize">
//                             <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
//                               {payment.paymentMethod || payment.method || "Transfer"}
//                             </span>
//                           </td>
//                           <td className="p-2.5 text-slate-500">
//                             {payment.date || payment.createdAt
//                               ? new Date(payment.date || payment.createdAt).toLocaleDateString("en-GB", {
//                                   day: "numeric",
//                                   month: "short",
//                                   year: "numeric",
//                                 })
//                               : "N/A"}
//                           </td>
//                           <td className="p-2.5 text-right font-semibold text-emerald-600">
//                             ₦{(payment.amount || 0).toLocaleString()}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan={4}
//                           className="p-4 text-center text-slate-400 italic"
//                         >
//                           No payment records found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

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
  postBillingPayment,
  updateMedicalHistory,
  deleteMedicalHistory,
  updatePrescription,
  deletePrescription,
  MedicalHistoryPayload,
  PrescriptionPayload,
  BillingPaymentPayload,
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

  // Add Form States
  const [historyNote, setHistoryNote] = useState("");
  const [product, setProduct] = useState("");
  const [dosage, setDosage] = useState("");
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [payMethod, setPayMethod] = useState("transfer");
  const [payRef, setPayRef] = useState("");

  // Edit Inline States
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editHistoryNote, setEditHistoryNote] = useState("");

  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    string | null
  >(null);
  const [editProduct, setEditProduct] = useState("");
  const [editDosage, setEditDosage] = useState("");

  const loadCardData = useCallback(async () => {
    if (!cardId) return;
    try {
      setError(null);
      const data = await getPatientCardById(cardId);
      setCard(data.card);
    } catch (err: any) {
      console.error("Error fetching patient card:", err);
      const errorMsg =
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
    actionFn: () => Promise<void>,
    successCleanup: () => void,
    successMessage: string,
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
      "Clinical note added successfully!",
    );
  };

  const handleUpdateHistory = (itemId: string) => {
    if (!editHistoryNote.trim()) return;
    handleAction(
      () => updateMedicalHistory(cardId, itemId, { note: editHistoryNote }),
      () => setEditingHistoryId(null),
      "Clinical note updated!",
    );
  };

  const handleDeleteHistory = (itemId: string) => {
    if (!confirm("Are you sure you want to delete this clinical note?")) return;
    handleAction(
      () => deleteMedicalHistory(cardId, itemId),
      () => {},
      "Clinical note deleted.",
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
      "Prescription added successfully!",
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
      "Prescription updated!",
    );
  };

  const handleDeletePrescription = (itemId: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return;
    handleAction(
      () => deletePrescription(cardId, itemId),
      () => {},
      "Prescription deleted.",
    );
  };

  // --- Billing Action ---
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || !payRef.trim()) return;
    const payload: BillingPaymentPayload = {
      amount: Number(payAmount),
      paymentMethod: payMethod,
      reference: payRef,
    };
    handleAction(
      () => postBillingPayment(cardId, payload),
      () => {
        setPayAmount("");
        setPayRef("");
      },
      "Payment recorded successfully!",
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

  const prescriptionsList = Array.isArray(card.prescriptions)
    ? card.prescriptions
    : card.prescriptions
      ? [card.prescriptions]
      : [];

  const chargesList = card.billing?.sessions || [];
  const paymentsList = card.billing?.paymentHistory || (card as any).payments || [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs w-fit"
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

      {/* Patient Header */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-2xl overflow-hidden shrink-0">
            {card?.patient?.avatar ? (
              <Image
                width={80}
                height={80}
                src={card?.patient?.avatar || "/default-avatar.png"}
                alt={card?.patient?.fullName || "Patient Avatar"}
                className="w-20 h-20 rounded-full object-cover border border-slate-200 bg-slate-100"
              />
            ) : (
              card.patient?.fullName?.charAt(0).toUpperCase() || "P"
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {card?.patient?.fullName}
            </h1>
            <p className="text-sm text-slate-500">
              {card?.patient?.email} | {card?.patient?.phoneNumber}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                {card?.specialty}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  card?.isPaid
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {card?.isPaid ? "Card Active" : "Payment Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-600 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div>
            <span className="text-slate-400 font-bold block">PHONE NUMBER</span>
            <span className="text-slate-800 text-sm font-medium">
              {card.patient?.phoneNumber || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block">AGE</span>
            <span className="text-slate-800 text-sm font-medium">
              {card.age} years
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block">
              MARITAL STATUS
            </span>
            <span className="text-slate-800 text-sm font-medium">
              {card.maritalStatus}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block">ORIGIN</span>
            <span className="text-slate-800 text-sm font-medium">
              {card.stateOfOrigin} State
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block">NEXT OF KIN</span>
            <span className="text-slate-800 text-sm font-medium">
              {card.nextOfKinName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block">NOK CONTACT</span>
            <span className="text-slate-800 text-sm font-medium">
              {card.nextOfKinPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        {(["history", "prescriptions", "billing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-medium text-sm capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "history" ? "Clinical Notes" : tab}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="bg-white p-6 rounded-b-xl shadow-xs border border-slate-200 border-t-0">
        {/* CLINICAL NOTES TAB */}
        {activeTab === "history" && (
          <div className="space-y-6">
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

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-800 text-sm">
                Medical Timeline
              </h3>
              {card.history && card.history.length > 0 ? (
                card.history.toReversed().map((item) => (
                  <div
                    key={item._id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs text-slate-500">
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
                      <th className="p-3 border-b text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionsList.length > 0 ? (
                      prescriptionsList.toReversed().map((p) => (
                        <tr key={p._id} className="border-b hover:bg-slate-50">
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
                                  onClick={() => setEditingPrescriptionId(null)}
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
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
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

        {/* BILLING TAB */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs font-bold text-slate-400 block">
                  TOTAL CHARGES
                </span>
                <span className="text-2xl font-bold text-slate-800">
                  ₦{card.billing?.totalAmount?.toLocaleString() || 0}
                </span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs font-bold text-slate-400 block">
                  AMOUNT PAID
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  ₦{card.billing?.amountPaid?.toLocaleString() || 0}
                </span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs">
                <span className="text-xs font-bold text-slate-400 block">
                  BALANCE DUE
                </span>
                <span className="text-2xl font-bold text-amber-600">
                  ₦{card.outstandingBalance?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-6">
              {/* Treatment / Service Charges View */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 text-sm">
                  Treatment & Service Charges
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border border-slate-200 bg-white rounded-lg">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                      <tr>
                        <th className="p-2 border-b">Service / Treatment</th>
                        <th className="p-2 border-b text-right">Cost (₦)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chargesList.length > 0 ? (
                        chargesList.map((session: any, idx: number) => (
                          <tr key={session._id || idx} className="border-b">
                            <td className="p-2 font-medium text-slate-800">
                              {session.title ||
                                session.serviceName ||
                                "Treatment Session"}
                              {session.notes && (
                                <span className="block text-[10px] text-slate-400">
                                  {session.notes}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-right font-medium text-slate-700">
                              ₦
                              {(
                                session.cost ||
                                session.amount ||
                                0
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
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

              {/* Record Payment Form */}
              <form
                onSubmit={handleAddPayment}
                className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
              >
                <h4 className="font-semibold text-slate-800 text-sm">
                  Record Payment Received
                </h4>
                <input
                  type="number"
                  min="0"
                  value={payAmount}
                  onChange={(e) =>
                    setPayAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Amount Paid (₦)"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="pos">POS Terminal</option>
                </select>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Payment Reference / Receipt #"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? "Recording..." : "Record Payment"}
                </button>
              </form>
            </div>

            {/* Payment History List */}
            <div className="border-t border-slate-200 pt-6 space-y-3">
              <h4 className="font-semibold text-slate-800 text-sm">
                Payment History
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border border-slate-200 bg-white rounded-lg">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                    <tr>
                      <th className="p-2.5 border-b">Reference</th>
                      <th className="p-2.5 border-b">Method</th>
                      <th className="p-2.5 border-b">Date</th>
                      <th className="p-2.5 border-b text-right">Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsList.length > 0 ? (
                      paymentsList.toReversed().map((payment: any, idx: number) => (
                        <tr key={payment._id || idx} className="border-b hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-800">
                            {payment.reference || payment.receiptNo || "N/A"}
                          </td>
                          <td className="p-2.5 capitalize">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {payment.paymentMethod || payment.method || "Transfer"}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500">
                            {payment.date || payment.createdAt
                              ? new Date(payment.date || payment.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-emerald-600">
                            ₦{(payment.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 text-center text-slate-400 italic"
                        >
                          No payment history recorded yet.
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
    </div>
  );
}