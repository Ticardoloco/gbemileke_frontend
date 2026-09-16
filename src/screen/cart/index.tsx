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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-14">
      {/* Responsive Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold sm:text-4xl">Your Cart</h1>
        {cart.length > 0 && (
          <span className="text-xs text-muted-foreground sm:text-sm">
            {cart.reduce((total, item) => total + item.quantity, 0)} items
          </span>
        )}
      </div>

      {cart.length === 0 ? (
        <Card className="mt-6 border-dashed sm:mt-8">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-accent text-primary sm:h-16 sm:w-16">
              <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold sm:text-xl">
              Your cart is empty
            </h2>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
              Looks like you haven&apos;t added any remedies to your cart yet.
            </p>
            <Link href="/shop">
              <Button className="mt-6" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Browse Pharmacy
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_320px] lg:gap-8">
          {/* Cart Item List */}
          <div className="space-y-3 sm:space-y-4">
            {cart.map((item) => {
              const itemId = item._id as string;
              const hasValidImage =
                item.image &&
                (item.image.startsWith("http") || item.image.startsWith("/"));

              return (
                <Card key={itemId} className="overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                      {/* Item Image / Placeholder */}
                      <div className="relative h-16 w-16 shrink-0 grid place-items-center overflow-hidden rounded-lg bg-accent text-xl sm:h-20 sm:w-20 sm:text-2xl">
                        {hasValidImage ? (
                          <Image
                            fill
                            src={item.image as string}
                            alt={item.name}
                            sizes="(max-width: 640px) 64px, 80px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-medium">
                            {item.name?.charAt(0) ?? "?"}
                          </span>
                        )}
                      </div>

                      {/* Details & Delete Button (Top Mobile Row) */}
                      <div className="flex flex-1 flex-col justify-between self-stretch">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="line-clamp-2 text-sm font-semibold sm:text-base">
                              {item.name}
                            </h3>
                            <div className="text-xs text-muted-foreground sm:text-sm">
                              {formatNaira(item.price)} each
                            </div>
                          </div>

                          {/* Desktop Delete Button (Hidden on Mobile) */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hidden h-8 w-8 text-muted-foreground hover:text-destructive sm:flex"
                            onClick={() => handleRemove(itemId, item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Desktop Controls (Inline with image & titles) */}
                        <div className="hidden items-center justify-between sm:flex">
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

                          <div className="font-display text-base font-semibold text-primary">
                            {formatNaira(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Controls Row (Visible on Mobile only) */}
                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 sm:hidden">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-lg border bg-secondary/40 p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md hover:bg-background"
                            onClick={() =>
                              handleDecreaseQuantity(
                                itemId,
                                item.quantity,
                                item.name,
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-semibold select-none">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md hover:bg-background"
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
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(itemId, item.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="font-display text-sm font-semibold text-primary">
                        {formatNaira(item.price * item.quantity)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-display text-base font-semibold sm:text-lg">
                  Order Summary
                </h3>
                <div className="mt-4 space-y-2 text-xs sm:text-sm">
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

                <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-base font-semibold sm:text-lg">
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