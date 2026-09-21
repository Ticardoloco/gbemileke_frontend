import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Star } from 'lucide-react'
import { TestimonialResponse } from '@/services/testimonialServices'

const TestimonialCard = ({testimonial}: {testimonial: TestimonialResponse}) => {
  return (
     <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 text-primary">
                    {Array.from({ length: Number(testimonial.rating) }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground">
                    &ldquo;{testimonial.message}&ldquo;
                  </p>
                  <div className="mt-4 border-t border-border/60 pt-4 text-sm">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.care}
                    </div>
                  </div>
                </CardContent>
              </Card>
  )
}

export default TestimonialCard