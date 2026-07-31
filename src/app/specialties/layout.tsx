"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSpecialities, SpecialitiesType } from "@/services/specialitiesService";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SpecialtiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isIndex = pathname === "/specialties";
  const [specialities, setSpecialities] = useState<SpecialitiesType[]>([]);
  const [specialitiesLoading, setSpecialitiesLoading] = useState<boolean>(true);

  useEffect(()=>{
    const fetchSpecialities = async ()=>{
      try {
        setSpecialitiesLoading(true);
        const res = await getSpecialities();
        setSpecialities(res?.specialities || []);
      } catch (error) {
        console.error("Failed to fetch specialities data", error);  
      }finally{
        setSpecialitiesLoading(false)
      }
    }
    fetchSpecialities()

  },[])
  

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <div className="text-xs font-medium uppercase tracking-widest text-primary">
        Care Departments
      </div>
      <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
        Our Specialties
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Five focused departments — each one blending traditional herbal knowledge with modern clinical practice.
      </p>

      {/* Navigation Pills */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4">
        <Link
          href="/specialties"
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            isIndex
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-accent"
          }`}
        >
          All
        </Link>
        {specialitiesLoading ? (
          Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={index}
              width={112}
              height={36}
              borderRadius={9999}
              containerClassName="leading-none"
            />
          ))
        ) : (
          specialities.toReversed().map((s) => {
            const active = pathname === `/specialties/${s.slug}`;
            return (
              <Link
                key={s.slug}
                href={`/specialties/${s.slug}`}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-accent"
                }`}
              >
                {s.name}
              </Link>
            );
          })
        )}
      </div>

      {/* Nested pages automatically render here via the children prop */}
      <div className="mt-10">{children}</div>
    </div>
  );
}