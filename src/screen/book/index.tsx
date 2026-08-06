/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/store/appStore";

import { Check, ChevronRight } from "lucide-react";
import { getSpecialities, SpecialitiesType } from "@/services/specialitiesService";
import { BookingPayload, postBooking } from "@/services/bookService";
import { SpecialtySlug } from "../patient-card";

const times = ["08:30", "09:30", "11:00", "12:30", "14:00", "15:30", "17:00"];

export default function BookPage() {
  const [specialties, setSpecialities] = useState<SpecialitiesType[] | undefined>([]);
  const [specialtiesLoading, setSpecialitiesLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();

  // Next.js Search Parameters replacement for TanStack Router
  const initialSpecialty = searchParams.get("specialty") as SpecialtySlug | null;

  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState<SpecialtySlug | "">(
    initialSpecialty && specialties?.some((s) => s.slug === initialSpecialty) 
      ? initialSpecialty 
      : ""
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"In-person" | "Virtual">("In-person");
  const [name, setName] = useState(user?.fullName ?? "");
  const [symptoms, setSymptoms] = useState("");

  const canNext = useMemo(() => {
    if (step === 1) return !!specialty;
    if (step === 2) return !!date && !!time;
    if (step === 3) return !!type;
    return true;
  }, [step, specialty, date, time, type]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setSpecialitiesLoading(true);
        const res = await getSpecialities();
        setSpecialities(res?.specialities || undefined);
      } catch (error) {
        console.error("Failed to load specialties", error);
      } finally {
        setSpecialitiesLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  const submit = async () => {
    try {
      const payload: BookingPayload = {
        specialty: specialty,
        date: date,
        time: time,
        type: type,
        symptoms: symptoms,
      };

      if (!name.trim() || !symptoms.trim() || symptoms.length < 10) {
        toast.error("Please add your name and describe symptoms (min 10 chars).");
        return;
      }

      await postBooking(payload);

      toast.success("Appointment requested! We'll confirm shortly.");
      router.push("/book/appointments");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to Book Appointment";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="text-xs font-medium uppercase tracking-widest text-primary">Book a consultation</div>
      <h1 className="mt-2 font-display text-4xl font-semibold">Reserve your visit</h1>
      <p className="mt-2 text-muted-foreground">Four short steps. In-person at our Ibadan center or over video.</p>

      {/* Progress Steps */}
      <ol className="mt-8 flex items-center gap-3">
        {["Specialty", "Date & time", "Type", "Details"].map((label, i) => {
          const idx = i + 1;
          const active = step === idx;
          const done = step > idx;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                done ? "bg-primary text-primary-foreground" : active ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {done ? <Check className="h-4 w-4" /> : idx}
              </span>
              <span className={`hidden text-sm sm:inline ${active ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
              {idx < 4 && <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />}
            </li>
          );
        })}
      </ol>

      <Card className="mt-8">
        <CardContent className="p-6">
          {/* Step 1: Specialty selection */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-semibold">Choose a department</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {specialtiesLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border p-4 space-y-2"
                    >
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-5 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                  ))
                ) : (
                  specialties?.toReversed().map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => setSpecialty(s.slug as SpecialtySlug)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        specialty === s.slug ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="text-2xl">{s.icon}</div>
                      <div className="mt-2 font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.tagline}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time pickers */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-semibold">Pick date & time</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="d">Date</Label>
                  <Input 
                    id="d" 
                    type="date" 
                    min={new Date().toISOString().slice(0, 10)} 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                  />
                </div>
                <div>
                  <Label>Available times</Label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {times.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className={`rounded-md border px-2 py-2 text-sm ${
                          time === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Modality option */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-semibold">Consultation type</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["In-person", "Virtual"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-xl border p-6 text-left ${
                      type === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="text-lg font-semibold">{t}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t === "In-person" ? "Visit our Ibadan center for a hands-on session." : "Join securely from anywhere over video."}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Medical History Entry */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-xl font-semibold">Your details</h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="n">Full name</Label>
                  <Input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Adaeze Okafor" maxLength={80} />
                </div>
                <div>
                  <Label htmlFor="s">Describe your symptoms</Label>
                  <Textarea id="s" rows={5} maxLength={1000} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="What brings you in?" />
                </div>
                <div className="rounded-lg bg-secondary/60 p-4 text-sm space-y-1">
                  <div><b>Department:</b> {specialties?.find((x) => x.slug === specialty)?.name}</div>
                  <div><b>When:</b> {date} at {time}</div>
                  <div><b>Type:</b> {type}</div>
                </div>
              </div>
            </div>
          )}

          {/* Step Controls */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" type="button" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < 4 ? (
              <Button type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button type="button" onClick={submit}>Request appointment</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}