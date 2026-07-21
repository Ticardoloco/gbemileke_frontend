"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, ShoppingCart, User as UserIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const nav = [
  { href: "/", label: "Home" },
  { href: "/specialties", label: "Specialties" },
  { href: "/book", label: "Book" },
  { href: "/shop", label: "Herbal Store" },
  { href: "/patient", label: "My Care" },
];

export function SiteHeader() {
  const { cart, user } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold text-foreground">Gbemileke</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Tradomedical</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Link>
          <Link href="/patient" className="hidden md:block">
            <Button variant="outline" size="sm">
              <UserIcon className="mr-2 h-4 w-4" />
              {user ? user.name.split(" ")[0] : "Sign in"}
            </Button>
          </Link>
          <Link href="/admin" className="hidden md:block">
            <Button size="sm">Staff</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 p-3">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
              Staff Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-display font-semibold">Gbemileke Tradomedical</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Bridging ancestral wisdom and modern care since 1987.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Care</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Anti-Natal</li><li>Post-Natal</li><li>Bone Setting</li><li>Stroke Recovery</li><li>Infertility</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Visit</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            9 Anjorin Dada Street<br />Off Ijagemo Road, Ijegun Ikotun Lagos Nigeria<br />Mon–Sat · 8am–7pm
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            +234 803 331 84232<br />care@gbemileke.health
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Gbemileke Tradomedical Hospital
      </div>
    </footer>
  );
}