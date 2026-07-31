"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Leaf, Users, CalendarCheck, PackageSearch, Wallet, Home, Plus, Trash2, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/store/appStore";
import { formatNaira, specialties, type MockAppointment, type Product, type SpecialtySlug } from "@/lib/mock-data";

export default function AdminDashboard() {
  const app = useApp();
  const [tab, setTab] = useState("overview");

  const stats = useMemo(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    const today = local.toISOString().split("T")[0];

    return {
      patients: app.patients.length,
      today: app.appointments.filter((a) => a.date >= today && a.date <= today).length || app.appointments.filter((a) => a.status === "Approved").length,
      pendingOrders: app.orders.filter((o) => o.status === "Pending").length,
      revenue: app.orders.reduce((s, o) => s + o.total, 0),
    };
  }, [app.patients, app.appointments, app.orders]);

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold leading-none">Gbemileke · Staff</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Practitioner Dashboard</div>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" /> Public site
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Clinic overview</h1>
        <p className="text-sm text-muted-foreground">Operations, patients, and pharmacy — all in one place.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Users className="h-4 w-4" />} label="Total patients" value={stats.patients} />
          <Stat icon={<CalendarCheck className="h-4 w-4" />} label="Today's appointments" value={stats.today} />
          <Stat icon={<PackageSearch className="h-4 w-4" />} label="Pending orders" value={stats.pendingOrders} />
          <Stat icon={<Wallet className="h-4 w-4" />} label="Monthly revenue" value={formatNaira(stats.revenue)} />
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-8 flex flex-col">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients (EHR)</TabsTrigger>
            <TabsTrigger value="inventory">Herbal Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold">Upcoming appointments</h3>
                  <div className="mt-4 space-y-2">
                    {app.appointments.slice(0, 5).map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                        <div>
                          <div className="font-semibold">{a.patient}</div>
                          <div className="text-xs text-muted-foreground">
                            {specialties.find((s) => s.slug === a.specialty)?.name} · {a.date} {a.time}
                          </div>
                        </div>
                        <Badge variant="secondary">{a.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold">Low stock alerts</h3>
                  <div className="mt-4 space-y-2">
                    {app.products.filter((p) => p.stock < 25).map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                        <div>
                          <b>{p.name}</b> <span className="text-muted-foreground">· {p.stock} in stock</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setTab("inventory")}>
                          Restock
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments"><AppointmentsPanel /></TabsContent>
          <TabsContent value="patients"><PatientsPanel /></TabsContent>
          <TabsContent value="inventory"><InventoryPanel /></TabsContent>
          <TabsContent value="orders"><OrdersPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">{icon}</span>
          {label}
        </div>
        <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AppointmentsPanel() {
  const { appointments, updateAppointment } = useApp();
  const setStatus = (a: MockAppointment, status: MockAppointment["status"]) => {
    updateAppointment(a.id, { status });
    toast.success(`${a.id} marked ${status}`);
  };
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{a.id}</TableCell>
                <TableCell>{a.patient}</TableCell>
                <TableCell>{specialties.find((s) => s.slug === a.specialty)?.name}</TableCell>
                <TableCell>{a.date} · {a.time}</TableCell>
                <TableCell>{a.type}</TableCell>
                <TableCell><Badge variant="secondary">{a.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => setStatus(a, "Approved")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const d = prompt("New date (YYYY-MM-DD)", a.date);
                      const t = prompt("New time (HH:MM)", a.time);
                      if (d && t) { updateAppointment(a.id, { date: d, time: t }); toast.success("Rescheduled"); }
                    }}>Reschedule</Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(a, "Completed")}>Complete</Button>
                    <Button size="sm" variant="destructive" onClick={() => setStatus(a, "Cancelled")}>Cancel</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PatientsPanel() {
  const { patients, addPatientNote, addPatientRx, products } = useApp();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [rxProduct, setRxProduct] = useState<string | null>(null);
  const [rxDosage, setRxDosage] = useState("");

  const list = patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));
  const open = patients.find((p) => p.id === openId) ?? null;

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search patients..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="mt-3 max-h-130 space-y-1 overflow-y-auto">
            {list.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                  openId === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                }`}
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.id} · {p.age}{p.gender} · {specialties.find((s) => s.slug === p.specialty)?.name}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {open ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold">{open.name}</h2>
                <div className="text-sm text-muted-foreground">{open.id} · {open.age}{open.gender} · {open.phone}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-primary">
                  {specialties.find((s) => s.slug === open.specialty)?.name}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold">Add consultation note</h3>
                <Textarea rows={4} maxLength={800} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Progress, observations, next steps..." className="mt-2" />
                <Button className="mt-3 w-full" onClick={() => {
                  if (note.trim().length < 5) { toast.error("Note is too short."); return; }
                  addPatientNote(open.id, note.trim(), "Dr. Ogunleye");
                  setNote(""); toast.success("Note saved");
                }}>Save note</Button>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold">Issue prescription</h3>
                <div className="mt-2 grid gap-2">
                  <Select value={rxProduct} onValueChange={setRxProduct}>
                    <SelectTrigger><SelectValue placeholder="Choose herbal product" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Dosage e.g. 1 tbsp x2 daily" maxLength={80} value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} />
                  <Button onClick={() => {
                    if (!rxProduct || !rxDosage.trim()) { toast.error("Pick a product and dosage."); return; }
                    addPatientRx(open.id, rxProduct, rxDosage.trim());
                    setRxProduct(""); setRxDosage(""); toast.success("Prescription added");
                  }}>Add prescription</Button>
                </div>
              </div>
            </div>

            <h3 className="mt-8 font-display text-lg font-semibold">Medical history</h3>
            <ol className="relative mt-4 ml-3 space-y-5 border-l border-border pl-5">
              {open.history.map((h, i) => (
                <li key={i}>
                  <span className="absolute -left-1.75 mt-1 grid h-3 w-3 place-items-center rounded-full bg-primary" />
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{h.date} · {h.author}</div>
                  <p className="mt-1 text-sm">{h.note}</p>
                </li>
              ))}
            </ol>

            <h3 className="mt-8 font-display text-lg font-semibold">Prescriptions</h3>
            <div className="mt-3 grid gap-2">
              {open.prescriptions.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <div><b>{r.product}</b> · <span className="text-muted-foreground">{r.dosage}</span></div>
                  <div className="text-xs text-muted-foreground">{r.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Select a patient to view their record.</CardContent></Card>
      )}
    </div>
  );
}

function InventoryPanel() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-display text-lg font-semibold">Herbal products</h3>
          <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" /> Add product</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{specialties.find((s) => s.slug === p.category)?.name}</TableCell>
                <TableCell className={p.stock < 25 ? "text-destructive font-semibold" : ""}>{p.stock}</TableCell>
                <TableCell>{formatNaira(p.price)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="destructive" className="ml-2" onClick={() => {
                    if (confirm(`Delete ${p.name}?`)) { deleteProduct(p.id); toast.success("Deleted"); }
                  }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {(editing || creating) && (
          <ProductDialog
            initial={editing ?? undefined}
            onClose={() => { setEditing(null); setCreating(false); }}
            onSave={(data) => {
              if (editing) { updateProduct(editing.id, data); toast.success("Updated"); }
              else { addProduct(data as Omit<Product, "id">); toast.success("Added"); }
              setEditing(null); setCreating(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ProductDialog({ initial, onClose, onSave }: { initial?: Product; onClose: () => void; onSave: (p: Omit<Product, "id">) => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<SpecialtySlug>(initial?.category ?? "anti-natal");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [usage, setUsage] = useState(initial?.usage ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🌿");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Edit product" : "Add product"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Name</Label><Input maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Department</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as SpecialtySlug)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{specialties.map((s) => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Emoji</Label><Input maxLength={4} value={emoji} onChange={(e) => setEmoji(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Price (₦)</Label><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
            <div><Label>Stock</Label><Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><Label>Usage</Label><Textarea rows={2} maxLength={200} value={usage} onChange={(e) => setUsage(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!name.trim() || price < 0 || stock < 0) { toast.error("Please complete all fields."); return; }
            onSave({ name: name.trim(), category, price, stock, description: description.trim(), usage: usage.trim(), emoji });
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrdersPanel() {
  const { orders, updateOrder } = useApp();
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell className="max-w-xs text-sm text-muted-foreground">{o.items}</TableCell>
                <TableCell>{formatNaira(o.total)}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => { updateOrder(o.id, { status: "Fulfilled" }); toast.success("Marked fulfilled"); }}>Fulfill</Button>
                  <Button size="sm" variant="outline" className="ml-2" onClick={() => { updateOrder(o.id, { status: "Shipped" }); toast.success("Marked shipped"); }}>Ship</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}