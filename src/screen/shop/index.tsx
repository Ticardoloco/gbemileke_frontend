"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/store/appStore";
import { formatNaira, specialties, type SpecialtySlug } from "@/lib/mock-data";

export default function Shop() {
  const { products, addToCart } = useApp();
  const [filter, setFilter] = useState<SpecialtySlug | "all">("all");
  const list = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <div className="text-xs font-medium uppercase tracking-widest text-primary">Herbal Pharmacy</div>
      <h1 className="mt-2 font-display text-4xl font-semibold">Remedies from our garden</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Freshly prepared herbal formulas, curated by our practitioners.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        {specialties.map((s) => (
          <button
            key={s.slug}
            onClick={() => setFilter(s.slug)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === s.slug ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => (
          <Card key={p.id} className="flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-soft">
            <div className="grid h-40 place-items-center bg-linear-to-br from-accent to-sage text-6xl">
              {p.emoji}
            </div>
            <CardContent className="flex flex-1 flex-col p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                {specialties.find((s) => s.slug === p.category)?.name}
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <b>Use:</b> {p.usage}
              </p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <div className="font-display text-lg font-semibold text-primary">{formatNaira(p.price)}</div>
                <Button
                  size="sm"
                  onClick={() => {
                    addToCart(p);
                    toast.success(`${p.name} added to cart`);
                  }}
                  disabled={p.stock === 0}
                >
                  {p.stock === 0 ? "Out of stock" : "Add"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}