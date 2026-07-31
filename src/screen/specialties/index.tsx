"use client"
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getSpecialities, SpecialitiesType } from "@/services/specialitiesService";
import { SpecialtiesIndexSkeleton } from "@/components/skeleton/SpecialityPageSkeleton";

export default function SpecialtiesIndex() {
    const [specialities, setSpecialities] = useState<SpecialitiesType[]>([]);
    const [specialitiesLoading, setSpecialitiesLoading] = useState<boolean>(true);

    useEffect(()=>{
      let isMounted = true;
      const fetchSpecialities = async () =>{
        try {
          setSpecialitiesLoading(true);
          const res = await getSpecialities();
          if (isMounted) { 
            setSpecialities(res?.specialities || [])
          }
        } catch (error) {
         if (isMounted) console.error("Failed to fetch specialities", error);
        } finally{
          if(isMounted) setSpecialitiesLoading(false)
        }
      }

      fetchSpecialities();
      return ()=>{
        isMounted = false;
      }
    },[])

    
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {specialitiesLoading ? (
        Array.from({length: 7}).map((_, index)=>(
          <SpecialtiesIndexSkeleton key={index}/>
        ))
      ): (
        specialities.toReversed().map((s) => (
        <Link key={s.slug} href={`/specialties/${s.slug}`}>
          <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-soft">
            <CardContent className="flex gap-5 p-6">
              <div className="text-4xl">{s.icon}</div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                  {s.category}
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold">{s.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))
      )}
    </div>
  );
}