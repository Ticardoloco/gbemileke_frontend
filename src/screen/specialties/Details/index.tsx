"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { getSpecialty, SpecialitiesType } from "@/services/specialitiesService";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

export default function SpecialtyDetail() {
  const [specialty, setSpecialty] = useState<SpecialitiesType | null>(null);
  const [specialtyLoading, setSpecialtyLoading] = useState<boolean>(true);
  const params = useParams();
  
  // Safely extract the slug from the URL dynamic folder name [slug]
  const slug = typeof params?.slug === "string" ? params.slug : "";

  useEffect(()=>{
    if(!slug) return;
    const fetchSpecialty = async () =>{
      try {
        setSpecialtyLoading(true);
        const res = await getSpecialty(slug);

        setSpecialty(res?.speciality || null)
      } catch (error) {
        console.error("Failed to fetch specialty", error);
        setSpecialty(null)
      } finally{
        setSpecialtyLoading(false);
      }
    }

    fetchSpecialty();
  },[slug]);

 if (specialtyLoading || !specialty) {
    return (
      <div className="grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full mt-6" />
        </div>
        <aside className="md:col-span-1">
          <Skeleton className="h-64 w-full rounded-xl" />
        </aside>
      </div>
    );
  }
  
  

  // Trigger a redirect to the local 404 page if not found

  return (
    <div className="grid gap-10 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="text-6xl">{specialty.icon}</div>
        <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
          {specialty.category}
        </div>
        <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
          {specialty.name}
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">{specialty.tagline}</p>
        <p className="mt-6 leading-relaxed">{specialty.description}</p>

        <h3 className="mt-10 font-display text-xl font-semibold">
          Our holistic approach
        </h3>
        <ul className="mt-4 space-y-3">
          {specialty.approach.map((a: string) => (
            <li key={a} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="md:col-span-1">
        <Card className="sticky top-24 bg-primary text-primary-foreground shadow-glow">
          <CardContent className="p-6">
            <h4 className="font-display text-lg font-semibold">Ready to begin?</h4>
            <p className="mt-2 text-sm opacity-90">
              Book a first consultation with a practitioner in {specialty.name}.
            </p>

            {/* Standard Next.js query parameter format */}
            <Link href={`/book?specialty=${specialty.slug}`}>
              <Button variant="secondary" className="mt-4 w-full">
                Book consultation
              </Button>
            </Link>

            <Link href="/shop">
              <Button
                variant="outline"
                className="mt-2 w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Browse herbal remedies
              </Button>
            </Link>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}