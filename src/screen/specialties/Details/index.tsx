"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { findSpecialty } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function SpecialtyDetail() {
  const params = useParams();
  
  // Safely extract the slug from the URL dynamic folder name [slug]
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const s = findSpecialty(slug);

  // Trigger a redirect to the local 404 page if not found
  if (!s) {
    notFound();
  }

  return (
    <div className="grid gap-10 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="text-6xl">{s.icon}</div>
        <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
          {s.category}
        </div>
        <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
          {s.name}
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">{s.tagline}</p>
        <p className="mt-6 leading-relaxed">{s.description}</p>

        <h3 className="mt-10 font-display text-xl font-semibold">
          Our holistic approach
        </h3>
        <ul className="mt-4 space-y-3">
          {s.approach.map((a: string) => (
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
              Book a first consultation with a practitioner in {s.name}.
            </p>

            {/* Standard Next.js query parameter format */}
            <Link href={`/book?specialty=${s.slug}`}>
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