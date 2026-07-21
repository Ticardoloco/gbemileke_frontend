"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-store";
import { formatNaira } from "@/lib/mock-data";

export default function Checkout() {
  const { cart, placeOrder, clearCart, user } = useApp();
  const router = useRouter();
  
  const [name, setName] = useState(user?.name ?? "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const submit = () => {
    if (!name.trim() || !address.trim() || !phone.trim()) {
      toast.error("Please fill in all delivery fields.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty.");
      return;
    }
    placeOrder(name.trim(), cart);
    clearCart();
    toast.success("Order placed! We'll dispatch it shortly.");
    
    // Standard Next.js route navigation
    router.push("/patient");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">Checkout</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="grid gap-4 p-6">
            <h3 className="font-display text-lg font-semibold">Delivery details</h3>
            <div>
              <Label htmlFor="n">Full name</Label>
              <Input id="n" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="a">Address</Label>
              <Input id="a" maxLength={200} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p">Phone</Label>
              <Input id="p" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="rounded-lg bg-secondary/60 p-4 text-sm text-muted-foreground">
              💳 Payment is a simulation — no real charge will be made.
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-fit">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold">Order</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {cart.map((i) => (
                <li key={i.product.id} className="flex justify-between">
                  <span>{i.product.name} ×{i.qty}</span>
                  <span>{formatNaira(i.product.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-semibold">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>
            <Button className="mt-4 w-full" onClick={submit}>Place order</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}