import { Leaf } from "lucide-react";

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
            <li>Anti-Natal</li>
            <li>Post-Natal</li>
            <li>Bone Setting</li>
            <li>Stroke Recovery</li>
            <li>Infertility</li>
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