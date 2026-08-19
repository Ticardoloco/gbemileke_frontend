/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Printer,
  X,
  AlertTriangle,
  Video,
  MapPin,
  Info,
} from "lucide-react";
import {
  getAppointmentById,
  cancelAppointment,
  AppointmentsResponse,
} from "@/services/bookService";

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.id as string;

  const [appointment, setAppointment] = useState<AppointmentsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getAppointmentById(appointmentId);
        setAppointment(data.appointment);
      } catch (err: any) {
        console.error("Error fetching appointment details:", err);
        setError(err?.response?.data?.message || "Failed to load appointment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [appointmentId]);

  const handleCancelAppointment = async () => {
    if (!appointmentId) return;
    try {
      setIsCancelling(true);
      await cancelAppointment(appointmentId);
      setAppointment((prev) => (prev ? { ...prev, status: "Cancelled" } : null));
      setShowCancelModal(false);
    } catch (err: any) {
      console.error("Error cancelling appointment:", err);
      alert(err?.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatSpecialty = (specialty?: string) => {
    if (!specialty) return "General Consultation";
    return specialty.replace(/-/g, " ");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-4 h-4" />
            Pending
          </span>
        );
      case "approved":
      case "confirmed":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
            <CheckCircle2 className="w-4 h-4" />
            {status}
          </span>
        );
      case "rejected":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 capitalize">
            <XCircle className="w-4 h-4" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const appType = appointment?.type?.toLowerCase() || "";
  const isVirtual = appType.includes("virtual");
  const isInPerson = appType.includes("in-person") || appType.includes("in person") || !isVirtual;
  
  const isApproved = appointment?.status?.toLowerCase() === "approved" || appointment?.status?.toLowerCase() === "confirmed";
  const isRejectedOrCancelled =
    appointment?.status?.toLowerCase() === "rejected" ||
    appointment?.status?.toLowerCase() === "cancelled";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 animate-pulse space-y-6">
        <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        <div className="h-28 bg-white rounded-2xl border border-slate-100 p-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-56 bg-white rounded-2xl border border-slate-100"></div>
            <div className="h-36 bg-white rounded-2xl border border-slate-100"></div>
          </div>
          <div className="h-72 bg-white rounded-2xl border border-slate-100"></div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Appointment Not Found</h2>
          <p className="text-slate-500 text-sm">
            {error || "The requested appointment could not be located."}
          </p>
          <button
            onClick={() => router.push("/appointments")}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 lg:p-8">
      {/* Top Controls */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print Summary</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize">
              {formatSpecialty(appointment.specialty)}
            </h1>
            {getStatusBadge(appointment.status)}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reference ID: <span className="font-mono text-slate-700">{appointment._id}</span>
          </p>
        </div>

        {appointment.status.toLowerCase() === "pending" && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-rose-200 transition-all self-start md:self-auto"
          >
            Cancel Appointment
          </button>
        )}
      </div>

      {/* Rejection / Cancellation Reason Banner */}
      {isRejectedOrCancelled && appointment.rejectionReason && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold capitalize">
              {appointment.status} Reason
            </h3>
            <p className="text-xs sm:text-sm mt-0.5 leading-relaxed text-rose-800">
              {appointment.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Info */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-emerald-700" />
              Appointment Schedule
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Date</span>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDate(appointment.date)}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Time</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {appointment.time}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Type</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 capitalize">
                  {isVirtual ? (
                    <Video className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  )}
                  {appointment.type || "In-person"}
                </p>
              </div>
            </div>

            {/* Virtual Appointment Info Banner - Displays when Virtual AND Approved */}
            {isVirtual && isApproved && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-emerald-900">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-semibold">Meeting Details:</span> The virtual meeting link will be sent to your email address or phone number prior to the scheduled time.
                </p>
              </div>
            )}

            {/* In-Person Appointment Location Banner - Displays when In-Person AND Approved */}
            {isInPerson && isApproved && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-emerald-900">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-semibold">Center Location:</span> You are expected to visit us at our facility located at <strong className="font-semibold">Ijegun, Lagos State</strong>. Please arrive 10–15 minutes prior to your scheduled time.
                </p>
              </div>
            )}
          </div>

          {/* Symptoms */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-emerald-700" />
              Symptoms & Notes
            </h2>

            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed capitalize-first">
              {appointment.symptoms || "No specific symptoms reported."}
            </p>
          </div>
        </div>

        {/* Patient Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-emerald-700" />
              Patient Details
            </h2>

            <div className="space-y-3.5 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Full Name</span>
                <p className="font-semibold text-slate-800">{appointment.patient.fullName}</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Gender</span>
                <p className="font-medium text-slate-700 capitalize">{appointment.patient.gender}</p>
              </div>

              {appointment.patient.email && (
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Email Address</span>
                  <p className="text-slate-700 flex items-center gap-2 mt-0.5 break-all">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    {appointment.patient.email}
                  </p>
                </div>
              )}

              {appointment.patient.phoneNumber && (
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Phone Number</span>
                  <p className="text-slate-700 flex items-center gap-2 mt-0.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    {appointment.patient.phoneNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Cancel Appointment</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-all"
              >
                Keep
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={isCancelling}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}