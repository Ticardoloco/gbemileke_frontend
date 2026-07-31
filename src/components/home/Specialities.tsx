import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Card, CardContent } from '../ui/card'
import { SpecialitiesType } from '@/services/specialitiesService'
import Link from 'next/link'

const Specialities = ({item}: {item: SpecialitiesType;}) => {
  return (
    
    <Link
                  href={`/specialties/${item.slug}`}
                  className="block"
                >
                  <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-soft">
                    <CardContent className="p-6">
                      <div className="text-4xl">{item.icon}</div>
                      <div className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-primary">
                        {item.category}
                      </div>
                      <h3 className="mt-1 font-display text-xl font-semibold">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.tagline}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Learn more{" "}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
  )
}

export default Specialities