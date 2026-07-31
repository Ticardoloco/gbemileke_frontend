"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/store/appStore";
import { formatNaira } from "@/lib/mock-data";

export default function CartPage() {
  const { cart, updateQty, removeFromCart } = useApp();
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">Your cart</h1>
      
      {cart.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link href="/shop" passHref>
              <Button className="mt-4">Browse pharmacy</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {cart.map((i) => (
              <Card key={i.product.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="grid h-16 w-16 place-items-center rounded-lg bg-accent text-3xl">
                    {i.product.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{i.product.name}</div>
                    <div className="text-sm text-muted-foreground">{formatNaira(i.product.price)}</div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) => updateQty(i.product.id, Number(e.target.value))}
                    className="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm"
                  />
                  <div className="w-24 text-right font-semibold">
                    {formatNaira(i.product.price * i.qty)}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(i.product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="h-fit">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold">Summary</h3>
              <div className="mt-4 flex justify-between text-sm">
                <span>Subtotal</span><span>{formatNaira(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery</span><span>Calculated at next step</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-semibold">
                <span>Total</span><span>{formatNaira(total)}</span>
              </div>
              <Link href="/checkout" passHref>
                <Button className="mt-4 w-full">Checkout</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}