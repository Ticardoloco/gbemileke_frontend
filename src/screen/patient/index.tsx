// "use client";

// import { useState } from "react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useApp } from "@/lib/app-store";
// import { formatNaira, specialties } from "@/lib/mock-data";
// import { CalendarDays, Leaf, Pill, LogOut } from "lucide-react";

// export default function PatientDashboard() {
//   const { user, signIn, signOut, appointments, orders, patients } = useApp();
//   const [email, setEmail] = useState("");
//   const [name, setName] = useState("");

//   if (!user) {
//     return (
//       <div className="mx-auto max-w-md px-4 py-20">
//         <Card>
//           <CardContent className="p-6">
//             <h1 className="font-display text-2xl font-semibold">Sign in</h1>
//             <p className="mt-1 text-sm text-muted-foreground">
//               Access your care dashboard. Demo — no password required.
//             </p>
//             <div className="mt-6 grid gap-3">
//               <div>
//                 <Label htmlFor="n">Name</Label>
//                 <Input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adaeze Okafor" />
//               </div>
//               <div>
//                 <Label htmlFor="e">Email</Label>
//                 <Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
//               </div>
//               <Button
//                 onClick={() => {
//                   if (!name.trim() || !email.trim()) {
//                     toast.error("Please enter name and email.");
//                     return;
//                   }
//                   signIn({ name: name.trim(), email: email.trim(), role: "patient" });
//                   toast.success(`Welcome, ${name.split(" ")[0]}!`);
//                 }}
//               >
//                 Continue
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const mine = appointments.filter((a) => a.patient.toLowerCase() === user.name.toLowerCase());
//   const myOrders = orders.filter((o) => o.customer.toLowerCase() === user.name.toLowerCase());
//   const record = patients.find((p) => p.name.toLowerCase() === user.name.toLowerCase());

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-14">
//       <div className="flex flex-wrap items-end justify-between gap-4">
//         <div>
//           <div className="text-xs font-medium uppercase tracking-widest text-primary">Patient Dashboard</div>
//           <h1 className="mt-1 font-display text-4xl font-semibold">Welcome, {user.name.split(" ")[0]}</h1>
//           <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
//         </div>
//         <Button variant="outline" onClick={signOut}>
//           <LogOut className="mr-2 h-4 w-4" /> Sign out
//         </Button>
//       </div>

//       <Tabs defaultValue="appointments" className="mt-8">
//         <TabsList>
//           <TabsTrigger value="appointments">
//             <CalendarDays className="mr-2 h-4 w-4" />Appointments
//           </TabsTrigger>
//           <TabsTrigger value="prescriptions">
//             <Pill className="mr-2 h-4 w-4" />Prescriptions
//           </TabsTrigger>
//           <TabsTrigger value="notes">
//             <Leaf className="mr-2 h-4 w-4" />Medical notes
//           </TabsTrigger>
//           <TabsTrigger value="orders">Orders</TabsTrigger>
//         </TabsList>

//         <TabsContent value="appointments">
//           {mine.length === 0 ? (
//             <Empty text="No appointments yet. Book your first consultation." />
//           ) : (
//             <div className="grid gap-3">
//               {mine.map((a) => (
//                 <Card key={a.id}>
//                   <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
//                     <div>
//                       <div className="font-semibold">
//                         {specialties.find((s) => s.slug === a.specialty)?.name}
//                       </div>
//                       <div className="text-sm text-muted-foreground">
//                         {a.date} · {a.time} · {a.type}
//                       </div>
//                       <p className="mt-1 max-w-xl text-sm">{a.symptoms}</p>
//                     </div>
//                     <StatusBadge status={a.status} />
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         <TabsContent value="prescriptions">
//           {record?.prescriptions.length ? (
//             <div className="grid gap-3">
//               {record.prescriptions.map((r, i) => (
//                 <Card key={i}>
//                   <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
//                     <div>
//                       <div className="font-semibold">{r.product}</div>
//                       <div className="text-sm text-muted-foreground">{r.dosage}</div>
//                     </div>
//                     <div className="text-sm text-muted-foreground">Issued {r.date}</div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           ) : (
//             <Empty text="No prescriptions on file yet." />
//           )}
//         </TabsContent>

//         <TabsContent value="notes">
//           {record?.history.length ? (
//             <ol className="relative ml-3 space-y-6 border-l border-border pl-6">
//               {record.history.map((h, i) => (
//                 <li key={i} className="relative">
//                   <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full bg-primary" />
//                   <div className="text-xs uppercase tracking-widest text-muted-foreground">
//                     {h.date} · {h.author}
//                   </div>
//                   <p className="mt-1">{h.note}</p>
//                 </li>
//               ))}
//             </ol>
//           ) : (
//             <Empty text="No medical notes have been recorded yet." />
//           )}
//         </TabsContent>

//         <TabsContent value="orders">
//           {myOrders.length === 0 ? (
//             <Empty text="You haven't placed any orders yet." />
//           ) : (
//             <div className="grid gap-3">
//               {myOrders.map((o) => (
//                 <Card key={o.id}>
//                   <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
//                     <div>
//                       <div className="font-semibold">{o.id}</div>
//                       <div className="text-sm text-muted-foreground">{o.items}</div>
//                       <div className="text-xs text-muted-foreground">{o.date}</div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="font-semibold">{formatNaira(o.total)}</div>
//                       <Badge variant="secondary">{o.status}</Badge>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// function Empty({ text }: { text: string }) {
//   return (
//     <Card className="mt-4">
//       <CardContent className="p-10 text-center text-muted-foreground">{text}</CardContent>
//     </Card>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const map: Record<string, string> = {
//     Pending: "bg-accent text-accent-foreground",
//     Approved: "bg-primary text-primary-foreground",
//     Completed: "bg-secondary text-secondary-foreground",
//     Cancelled: "bg-destructive text-destructive-foreground",
//   };
//   return (
//     <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] ?? ""}`}>
//       {status}
//     </span>
//   );
// }

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/app-store";
import { formatNaira, specialties } from "@/lib/mock-data";
import { CalendarDays, Leaf, Pill, LogOut } from "lucide-react";

export default function PatientDashboard() {
  const { user, signIn, signOut, appointments, orders, patients } = useApp();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <Card>
          <CardContent className="p-6">
            <h1 className="font-display text-2xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Access your care dashboard. Demo — no password required.
            </p>
            <div className="mt-6 grid gap-3">
              <div>
                <Label htmlFor="n">Name</Label>
                <Input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adaeze Okafor" />
              </div>
              <div>
                <Label htmlFor="e">Email</Label>
                <Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <Button
                onClick={() => {
                  if (!name.trim() || !email.trim()) {
                    toast.error("Please enter name and email.");
                    return;
                  }
                  signIn({ name: name.trim(), email: email.trim(), role: "patient" });
                  toast.success(`Welcome, ${name.split(" ")[0]}!`);
                }}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mine = appointments.filter((a) => a.patient.toLowerCase() === user.name.toLowerCase());
  const myOrders = orders.filter((o) => o.customer.toLowerCase() === user.name.toLowerCase());
  const record = patients.find((p) => p.name.toLowerCase() === user.name.toLowerCase());

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-primary">Patient Dashboard</div>
          <h1 className="mt-1 font-display text-4xl font-semibold">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      <Tabs defaultValue="appointments" className="mt-8 flex flex-col">
        <TabsList>
          <TabsTrigger value="appointments">
            <CalendarDays className="mr-2 h-4 w-4" />Appointments
          </TabsTrigger>
          <TabsTrigger value="prescriptions">
            <Pill className="mr-2 h-4 w-4" />Prescriptions
          </TabsTrigger>
          <TabsTrigger value="notes">
            <Leaf className="mr-2 h-4 w-4" />Medical notes
          </TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          {mine.length === 0 ? (
            <Empty text="No appointments yet. Book your first consultation." />
          ) : (
            <div className="grid gap-3">
              {mine.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                      <div className="font-semibold">
                        {specialties.find((s) => s.slug === a.specialty)?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {a.date} · {a.time} · {a.type}
                      </div>
                      <p className="mt-1 max-w-xl text-sm">{a.symptoms}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prescriptions">
          {record?.prescriptions.length ? (
            <div className="grid gap-3">
              {record.prescriptions.map((r, i) => (
                <Card key={i}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                      <div className="font-semibold">{r.product}</div>
                      <div className="text-sm text-muted-foreground">{r.dosage}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Issued {r.date}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Empty text="No prescriptions on file yet." />
          )}
        </TabsContent>

        <TabsContent value="notes">
          {record?.history.length ? (
            <ol className="relative ml-3 space-y-6 border-l border-border pl-6">
              {record.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-7.75 top-1 grid h-4 w-4 place-items-center rounded-full bg-primary" />
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {h.date} · {h.author}
                  </div>
                  <p className="mt-1">{h.note}</p>
                </li>
              ))}
            </ol>
          ) : (
            <Empty text="No medical notes have been recorded yet." />
          )}
        </TabsContent>

        <TabsContent value="orders">
          {myOrders.length === 0 ? (
            <Empty text="You haven't placed any orders yet." />
          ) : (
            <div className="grid gap-3">
              {myOrders.map((o) => (
                <Card key={o.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <div className="font-semibold">{o.id}</div>
                      <div className="text-sm text-muted-foreground">{o.items}</div>
                      <div className="text-xs text-muted-foreground">{o.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-semibold">{formatNaira(o.total)}</div>
                      <Badge variant="secondary">{o.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card className="mt-4">
      <CardContent className="p-10 text-center text-muted-foreground">{text}</CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-accent text-accent-foreground",
    Approved: "bg-primary text-primary-foreground",
    Completed: "bg-secondary text-secondary-foreground",
    Cancelled: "bg-destructive text-destructive-foreground",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}