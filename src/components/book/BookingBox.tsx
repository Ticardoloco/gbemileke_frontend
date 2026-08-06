import { AppointmentsResponse } from '@/services/bookService';
import { Activity, Calendar, ChevronRight, Clock, MapPin, Stethoscope, User, Video } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'

const BookingBox = ({formatSpecialty, formatDate, getStatusBadge, appointment}: {formatSpecialty: (specialty: string) => string; formatDate: (dateStr: string) => string; getStatusBadge: (status: string) => React.ReactNode; appointment: AppointmentsResponse}) => {
    const router = useRouter();
  return (
    <div
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Info Group */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Stethoscope className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 capitalize truncate">
                      {formatSpecialty(appointment.specialty)}
                    </h2>
                    {getStatusBadge(appointment.status)}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {appointment.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      {formatDate(appointment.date)}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      {appointment.time}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {appointment.patient.fullName}
                    </span>
                  </div>

                  {/* Symptoms Section */}
                  {appointment.symptoms && (
                    <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 flex items-start gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Symptoms:</strong> {appointment.symptoms}
                      </span>
                    </div>
                  )}

                  {/* Virtual Meeting Notice */}
                  {appointment.type?.toLowerCase() === "virtual" && appointment.status?.toLowerCase() === "approved" && (
                    <div className="mt-2 text-xs bg-sky-50 border border-sky-100 text-sky-800 p-2.5 rounded-xl flex items-center gap-2">
                      <Video className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>
                        The meeting link will be sent to your email and phone number.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 justify-end shrink-0">
                <button
                  onClick={() => router.push(`/book/appointments/${appointment._id}`)}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
  )
}

export default BookingBox