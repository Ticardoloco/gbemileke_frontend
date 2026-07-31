import React from "react";
import { 
  Calendar, 
  FileText, 
  User, 
  Leaf, 
  Pill, 
  Phone, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Heart
} from "lucide-react";

// Types matching your exact MongoDB API response
interface HistoryEntry {
  _id: string;
  date: string;
  note: string;
  author: {
    _id: string;
    fullName: string;
    role: string;
  };
}

interface PrescriptionEntry {
  _id: string;
  date: string;
  product: string;
  dosage: string;
}

interface PatientCardData {
  _id: string;
  patient: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  age: number;
  maritalStatus: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  stateOfOrigin: string;
  specialty: string;
  isPaid: boolean;
  paymentReference: string;
  cardFee: number;
  history: HistoryEntry[];
  prescriptions: PrescriptionEntry[];
  createdAt: string;
  updatedAt: string;
}

// Sample API payload passed to component or fetched via Axios
const sampleCardResponse: PatientCardData = {
  _id: "6a60e167d67256bf168fdec5",
  patient: {
    _id: "6a5a48da5bd16ad199681ade",
    fullName: "Egbeleke sodiq",
    email: "egbelekesodiq@gmail.com",
    phoneNumber: "07063422983"
  },
  age: 32,
  maritalStatus: "single",
  nextOfKinName: "Egbeleke Nofisat",
  nextOfKinPhone: "+2348012345678",
  stateOfOrigin: "Oyo",
  specialty: "bone-setting",
  isPaid: true,
  paymentReference: "vmrnchd7a6",
  cardFee: 10000,
  history: [
    {
      _id: "6a60e96eb6a7196f36314eae",
      date: "2026-07-22T16:01:50.592Z",
      note: "Updated note: Patient's EKG returned normal results.",
      author: {
        _id: "6a60e3c1d67256bf168fdec6",
        fullName: "Egbeleke Taiwo",
        role: "admin"
      }
    }
  ],
  prescriptions: [
    {
      _id: "6a60e9d4b6a7196f36314eb0",
      date: "2026-07-22T16:03:32.834Z",
      product: "Harmo capsule",
      dosage: "1 capsule 3 times daily for 7 days"
    }
  ],
  createdAt: "2026-07-22T15:27:35.691Z",
  updatedAt: "2026-07-24T15:30:03.453Z"
};

export default function PatientDashboard({ cardData = sampleCardResponse }: { cardData?: PatientCardData }) {
  const { patient, history, prescriptions } = cardData;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl border-2 border-emerald-500 capitalize">
            {patient.fullName.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{patient.fullName}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <span>Card ID: <strong className="font-mono text-slate-700">{cardData._id.slice(-8).toUpperCase()}</strong></span>
              •
              <span className="capitalize">{patient.email}</span>
            </p>
          </div>
        </div>

        <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm flex items-center gap-2 self-start md:self-auto">
          <Calendar className="w-4 h-4" /> Book Appointment
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: History, Prescriptions & Appointments */}
        <div className="lg:col-span-2 space-y-8">

          {/* Prescriptions Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-700" /> Active Prescriptions
            </h2>

            {prescriptions && prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions.map((p) => (
                  <div key={p._id} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col md:flex-row justify-between md:items-center gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{p.product}</h3>
                      <p className="text-sm text-slate-600 mt-1">Dosage: <span className="font-medium text-slate-800">{p.dosage}</span></p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono self-start md:self-auto">
                      {formatDate(p.date)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No active prescriptions assigned.</p>
            )}
          </section>

          {/* Medical History Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" /> Medical History Notes
            </h2>

            {history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map((h) => (
                  <div key={h._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Author: {h.author.fullName} ({h.author.role})</span>
                      <span className="font-mono">{formatDate(h.date)}</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">{h.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No medical history entries recorded yet.</p>
            )}
          </section>

          {/* Booked Appointments Quick Banner */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-700" /> Booked Consultations
              </h2>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-sm text-slate-600">Specialty Registered: <strong className="capitalize text-emerald-800">{cardData.specialty}</strong></p>
              <p className="text-xs text-slate-400 mt-1">Click &rdquo;Book Appointment&quot; above to schedule your next session.</p>
            </div>
          </section>

        </div>

        {/* Right Column: Digital Patient Card */}
        <div className="space-y-8">
          
          {/* Digital Patient Card Widget */}
          <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">Hospital Digital Card</p>
                <h3 className="text-lg font-bold mt-1">Gbemileke Tradomedical</h3>
              </div>
              <Leaf className="w-6 h-6 text-emerald-300" />
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-emerald-200">Patient Name</p>
                <p className="text-lg font-bold capitalize">{patient.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-emerald-200">Phone</p>
                  <p className="font-medium">{patient.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-emerald-200">Age / Status</p>
                  <p className="font-medium capitalize">{cardData.age} yrs • {cardData.maritalStatus}</p>
                </div>
                <div>
                  <p className="text-emerald-200">Specialty</p>
                  <p className="font-medium capitalize">{cardData.specialty}</p>
                </div>
                <div>
                  <p className="text-emerald-200">State of Origin</p>
                  <p className="font-medium">{cardData.stateOfOrigin}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-700/50 flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 text-emerald-200">
                Fee: ₦{cardData.cardFee.toLocaleString()}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${cardData.isPaid ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                {cardData.isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {cardData.isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </section>

          {/* Emergency & Next of Kin Card */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" /> Next of Kin Details
            </h3>
            
            <div className="text-sm space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-slate-500">Name: <strong className="text-slate-800">{cardData.nextOfKinName}</strong></p>
              <p className="text-slate-500 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-mono">{cardData.nextOfKinPhone}</span>
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}