/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getSpecialities,
  SpecialitiesType,
} from "@/services/specialitiesService";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CreditCard,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  initializePayment,
  PatientCardPayload,
  postPatientCard,
} from "@/services/userService";

export type SpecialtySlug =
  | "anti-natal"
  | "post-natal"
  | "labor-and-delivery"
  | "stroke-recovery"
  | "bone-setting"
  | "infertility"
  | "infection-treatment"
  | "low-sperm-count";

export default function RegisterPatientCardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [specialities, setSpecialities] = useState<SpecialitiesType[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState<boolean>(true);

  // Modal Form State
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<SpecialtySlug | null>(null);

  // States for verification post-Paystack return
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [createdCard, setCreatedCard] = useState<any>(null);

  // Form Submission loading & error
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [formData, setFormData] = useState({
    age: "",
    maritalStatus: "single",
    nextOfKinName: "",
    nextOfKinPhone: "",
    stateOfOrigin: "",
  });

  // Guard against double execution in React StrictMode
  const hasVerifiedRef = useRef(false);

  // 1. Fetch Specialties on mount
  useEffect(() => {
    let isMounted = true;

    const fetchList = async () => {
      try {
        setLoadingSpecialties(true);
        const res = await getSpecialities();
        if (isMounted) {
          setSpecialities(res?.specialities || []);
        }
      } catch (err) {
        if (isMounted)
          setErrorMsg("Failed to load specialties. Please refresh.");
      } finally {
        if (isMounted) setLoadingSpecialties(false);
      }
    };

    fetchList();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Handle Return from Paystack (detects ?reference= or ?trxref= in URL)
  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (!reference || hasVerifiedRef.current) return;

    const verifyAndSaveCard = async () => {
      hasVerifiedRef.current = true; // Block subsequent triggers
      try {
        setIsVerifying(true);
        setErrorMsg("");

        // Retrieve cached form data from pre-redirect session
        const storedDetailsRaw = sessionStorage.getItem("pending_card_details");
        const storedDetails = storedDetailsRaw
          ? JSON.parse(storedDetailsRaw)
          : {};

        const payload: PatientCardPayload = {
          reference,
          specialty: storedDetails.specialty,
          age: Number(storedDetails.age) || 0,
          maritalStatus: storedDetails.maritalStatus || "single",
          nextOfKinName: storedDetails.nextOfKinName || "",
          nextOfKinPhone: storedDetails.nextOfKinPhone || "",
          stateOfOrigin: storedDetails.stateOfOrigin || "",
        };

        // Save patient card to backend database
        const res: any = await postPatientCard(payload);
        const cardData = res?.card || res?.data || res;

        setCreatedCard(cardData);
        sessionStorage.removeItem("pending_card_details");

        // Clean query parameters from URL without full reload
        router.replace(window.location.pathname);
      } catch (err: any) {
        console.error("Verification error:", err);
        setErrorMsg(
          err.response?.data?.message ||
            "Payment complete, but failed to save patient card record."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndSaveCard();
  }, [searchParams, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectCard = (slug: SpecialtySlug) => {
    setErrorMsg("");
    setSelectedSpecialty(slug);
  };

  const closeModal = () => {
    setSelectedSpecialty(null);
    setErrorMsg("");
    setFormData({
      age: "",
      maritalStatus: "single",
      nextOfKinName: "",
      nextOfKinPhone: "",
      stateOfOrigin: "",
    });
  };

  // 3. Submit Form -> Cache data -> Initialize Paystack with callback_url -> Redirect
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSpecialty) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");
const registrationDetails = {
  specialty: selectedSpecialty,
  age: Number(formData.age),
  maritalStatus: formData.maritalStatus,
  nextOfKinName: formData.nextOfKinName.trim(),
  nextOfKinPhone: formData.nextOfKinPhone.trim(),
  stateOfOrigin: formData.stateOfOrigin.trim(),
  // Send the exact path of the registration page:
  callback_url: `${window.location.origin}/patient-card`, // Or wherever this page lives
};
      // Save form details in session storage before leaving the app
      sessionStorage.setItem(
        "pending_card_details",
        JSON.stringify(registrationDetails)
      );

      // Initialize Paystack payment URL
      const res: any = await initializePayment(registrationDetails);
      const payload = res?.data?.data || res?.data || res;

      const paymentUrl =
        payload?.authorizationUrl ||
        payload?.authorization_url ||
        payload?.paymentUrl ||
        payload?.payment_url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setErrorMsg("Failed to obtain Paystack checkout URL. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Initialization failed:", err);
      setErrorMsg(
        err.response?.data?.message ||
          err?.message ||
          "Could not initialize payment. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <CreditCard className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          Get Your Patient Card
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Select a specialty card below to initialize payment and complete
          registration.
        </p>
      </div>

      {/* Global Error Banner */}
      {errorMsg && !selectedSpecialty && (
        <div className="mb-6 flex items-center gap-2 rounded-md bg-destructive/15 p-4 text-sm text-destructive max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loader overlay while verifying payment on return from Paystack */}
      {isVerifying && (
        <div className="mb-6 flex items-center justify-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm font-medium text-primary max-w-2xl mx-auto">
          <Loader2 className="h-5 w-5 animate-spin shrink-0" />
          <span>Verifying payment and creating your patient card...</span>
        </div>
      )}

      {/* Grid of Specialty Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loadingSpecialties
          ? Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-60 rounded-xl" />
            ))
          : specialities.toReversed().map((s) => {
              const slug = s.slug as SpecialtySlug;

              return (
                <div
                  key={s._id}
                  className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div>
                    <div className="text-4xl mb-3">{s.icon}</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {s.category}
                    </span>
                    <h3 className="font-semibold text-lg mt-1">{s.name}</h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                      {s.tagline || s.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => handleSelectCard(slug)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Get Patient Card
                    </button>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Registration Modal */}
      {selectedSpecialty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl relative">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold mb-1">
              Patient Registration Details
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Specialty:{" "}
              <span className="font-semibold text-primary uppercase">
                {selectedSpecialty}
              </span>
            </p>

            {errorMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Age *</label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">
                    Marital Status *
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">State of Origin *</label>
                <input
                  type="text"
                  name="stateOfOrigin"
                  required
                  placeholder="e.g. Lagos"
                  value={formData.stateOfOrigin}
                  onChange={handleInputChange}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Next of Kin Name *
                </label>
                <input
                  type="text"
                  name="nextOfKinName"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.nextOfKinName}
                  onChange={handleInputChange}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Next of Kin Phone *
                </label>
                <input
                  type="tel"
                  name="nextOfKinPhone"
                  required
                  placeholder="e.g. +2348000000000"
                  value={formData.nextOfKinPhone}
                  onChange={handleInputChange}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to Paystack...
                    </>
                  ) : (
                    "Proceed to Paystack Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {createdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-emerald-500/30 bg-background p-6 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setCreatedCard(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold text-foreground">
              Patient Card Created!
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Your payment was verified and your record is active in the database.
            </p>

            <div className="rounded-lg border border-border bg-muted/40 p-4 text-left space-y-2 text-xs mb-6">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Card / Ref ID:</span>
                <span className="font-mono font-medium">
                  {createdCard?.cardNumber || createdCard?.reference || "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Specialty:</span>
                <span className="font-medium capitalize">
                  {createdCard?.specialty || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-emerald-600 capitalize">
                  {createdCard?.status || "Active"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCreatedCard(null)}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}