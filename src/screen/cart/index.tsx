"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/store/appStore";

export const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useApp();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleDecreaseQuantity = (
    itemId: string,
    currentQty: number,
    itemName: string,
  ) => {
    if (currentQty <= 1) {
      removeFromCart(itemId);
      toast.info(`${itemName} removed from cart`);
    } else {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleIncreaseQuantity = (
    itemId: string,
    currentQty: number,
    stock?: number,
  ) => {
    if (stock !== undefined && currentQty >= stock) {
      toast.error("Maximum available stock reached");
      return;
    }
    updateQuantity(itemId, currentQty + 1);
  };

  const handleRemove = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    toast.info(`${itemName} removed from cart`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold">Your Cart</h1>
        {cart.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {cart.reduce((total, item) => total + item.quantity, 0)} items
          </span>
        )}
      </div>

      {cart.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold">
              Your cart is empty
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Looks like you haven&apos;t added any remedies to your cart yet.
            </p>
            <Link href="/shop">
              <Button className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Browse Pharmacy
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Cart Item List */}
          <div className="space-y-4">
            {cart.map((item) => {
              const itemId = item._id as string;
              const hasValidImage =
                item.image &&
                (item.image.startsWith("http") || item.image.startsWith("/"));

              return (
                <Card key={itemId} className="overflow-hidden">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Item Image / Emoji Container */}
                    <div className="relative h-16 w-16 shrink-0 grid place-items-center overflow-hidden rounded-lg bg-accent text-2xl">
                      {hasValidImage ? (
                        <Image
                          fill
                          src={item.image as string}
                          alt={item.name}
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium truncate">
                          {item.name?.charAt(0) ?? "?"}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {item.name}
                      </h3>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {formatNaira(item.price)} each
                      </div>
                    </div>

                    {/* Quantity Stepper Control */}
                    <div className="flex items-center gap-1 rounded-lg border bg-secondary/40 p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md hover:bg-background"
                        onClick={() =>
                          handleDecreaseQuantity(
                            itemId,
                            item.quantity,
                            item.name,
                          )
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-7 text-center text-xs font-semibold select-none">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md hover:bg-background"
                        disabled={
                          item.stock !== undefined &&
                          item.quantity >= item.stock
                        }
                        onClick={() =>
                          handleIncreaseQuantity(
                            itemId,
                            item.quantity,
                            item.stock,
                          )
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Item Total Price */}
                    <div className="w-20 sm:w-24 text-right font-display text-sm sm:text-base font-semibold text-primary">
                      {formatNaira(item.price * item.quantity)}
                    </div>

                    {/* Remove Action */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(itemId, item.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold">
                  Order Summary
                </h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatNaira(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-xs text-muted-foreground">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatNaira(subtotal)}</span>
                </div>

                <Link href="/checkout" className="mt-6 block w-full">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="mt-4 text-center">
                  <Link
                    href="/shop"
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Continue shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
