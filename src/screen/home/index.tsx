"use client";
import Link from "next/link";
import {
  ArrowRight,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  getSpecialities,
  SpecialitiesType,
} from "@/services/specialitiesService";
import Specialities from "@/components/home/Specialities";
import { SpecialitiesSkeleton } from "@/components/skeleton/SpecialitiesLoader";

const stats = [
  { label: "Patients cared for", value: "12,400+" },
  { label: "Years of practice", value: "38" },
  { label: "Recovery rate", value: "93%" },
  { label: "Herbal formulas", value: "60+" },
];

const testimonials = [
  {
    name: "Amina S.",
    care: "Anti-Natal Care",
    quote:
      "Every visit felt like being wrapped in warmth. My pregnancy was smooth from start to finish.",
  },
  {
    name: "Kola O.",
    care: "Bone Setting",
    quote:
      "They set my fractured wrist without surgery. Six weeks later I was back to work — pain-free.",
  },
  {
    name: "Rita E.",
    care: "Infertility Care",
    quote:
      "After two years of trying, their herbal protocol changed everything. We are expecting in October.",
  },
];

export default function LandingPage() {
  const [specialities, setSpecialities] = useState<SpecialitiesType[]>([]);
  const [specialitiesLoading, setSpecialitiesLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        setSpecialitiesLoading(true);
        const res = await getSpecialities();
        if (res) setSpecialities(res?.specialities || []);
      } catch (error) {
        console.error("failed to fetch specialities", error);
      } finally{
        setSpecialitiesLoading(false)
      }
    };

    fetchSpecialities();
  }, []);
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-medium text-primary">
              <Leaf className="h-3.5 w-3.5" /> Rooted in tradition · Guided by
              science
            </div>
            <h1 className="mt-5 font-display text-5xl font-semibold text-balance text-foreground md:text-6xl">
              Healing that honors the body,
              <br className="hidden md:block" /> the land, and the story you
              carry.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Gbemileke Tradomedical Hospital blends generations of Yoruba
              herbal wisdom with modern clinical practice — for maternal
              wellness, physical recovery, and fertility care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" passHref>
                <Button size="lg" className="gap-2">
                  Book a consultation <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/specialties" passHref>
                <Button size="lg" variant="outline">
                  Explore our care
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border/60 pt-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-semibold text-primary">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-4xl bg-primary/10 blur-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-card p-6 shadow-soft">
                <HeartPulse className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  Maternal Care
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prenatal tracking, herbal tonics, and post-natal recovery
                  baths.
                </p>
              </div>
              <div className="mt-8 rounded-3xl bg-primary p-6 text-primary-foreground shadow-glow">
                <Sparkles className="h-8 w-8" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  Fertility Journey
                </h3>
                <p className="mt-1 text-sm opacity-90">
                  A guided, holistic path — from cycle tracking to womb
                  cleansing.
                </p>
              </div>
              <div className="rounded-3xl bg-accent p-6 text-accent-foreground shadow-soft">
                <ShieldCheck className="h-8 w-8" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  Bone Setting
                </h3>
                <p className="mt-1 text-sm opacity-90">
                  Non-surgical realignment with herbal poultices for accelerated
                  healing.
                </p>
              </div>
              <div className="mt-8 rounded-3xl bg-card p-6 shadow-soft">
                <Leaf className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  Herbal Pharmacy
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Proprietary blends prepared fresh from our garden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-primary">
              Our Specialties
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              Eight departments. One holistic promise.
            </h2>
          </div>
          <Link
            href="/specialties"
            className="hidden text-sm font-medium text-primary hover:underline md:inline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          
          {specialitiesLoading ? (
      /* Show 6 skeletons while loading */
      Array.from({ length: 6 }).map((_, index) => (
        <SpecialitiesSkeleton key={index} />
      ))
    ) : (
      /* Show items after fetch completes */
      specialities.toReversed().slice(0, 3).map((item) => (
        <Specialities key={item.slug} item={item} />
      ))
    )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-widest text-primary">
              What patients say
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              Stories of trust and recovery
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&ldquo;
                  </p>
                  <div className="mt-4 border-t border-border/60 pt-4 text-sm">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.care}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-3xl bg-primary p-10 text-primary-foreground shadow-glow md:p-14">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="font-display text-3xl font-semibold md:text-4xl">
                Start your care journey today.
              </h3>
              <p className="mt-3 max-w-lg opacity-90">
                Book a consultation with one of our practitioners. In-person or
                virtual — we meet you where you are.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/book" passHref>
                <Button size="lg" variant="secondary">
                  Book consultation
                </Button>
              </Link>
              <Link href="/shop" passHref>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Visit pharmacy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
