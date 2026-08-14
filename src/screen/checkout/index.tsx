"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/store/appStore";
import { createOrder } from "@/services/orderService";
import { formatNaira } from "../cart";

// Helper function to calculate delivery fee based on state and subtotal
function calculateDeliveryFee(state: string, itemsPrice: number): number {
  if (itemsPrice === 0) return 0;

  // Free delivery threshold for orders ₦200,000 and above
  if (itemsPrice >= 200000) {
    return 0;
  }

  const normalizedState = state ? state.trim().toLowerCase() : "";

  switch (normalizedState) {
    case "lagos":
      return 5000;
    case "osun":
    case "ondo":
    case "ogun":
    case "oyo":
    case "kwara":
    case "edo":
    case "ekiti":
      return 8000;
    case "rivers":
    case "kano":
    case "kaduna":
    case "enugu":
    case "delta":
    case "abia":
    case "adamawa":
    case "akwa ibom":
    case "cross river":
    case "ebonyi":
    case "anambra":
    case "gombe":
    case "imo":
    case "katsina":
    case "kogi":
    case "plateau":
    case "taraba":
    case "yobe":
    case "zamfara":
    case "abuja":
      return 12000;
    default:
      // Default rate across Nigeria if state is empty or unspecified
      return 5000;
  }
}

export default function Checkout() {
  const { cart, clearCart } = useApp();

  // Form states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [paymentMethod] = useState("paystack");
  const [loading, setLoading] = useState(false);

  // Calculations
  const itemsPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = calculateDeliveryFee(state, itemsPrice);
  const grandTotal = itemsPrice + deliveryFee;

  const submit = async () => {
    if (
      !fullName.trim() ||
      !phoneNumber.trim() ||
      !streetAddress.trim() ||
      !city.trim() ||
      !state.trim() ||
      !country.trim()
    ) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const payload = {
      orderItems: cart.map((item) => ({
        product: String(item._id || ""),
        quantity: item.quantity,
        image: item.image || "",
      })),
      shippingAddress: {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
      },
      paymentInfo: {
        paymentMethod,
      },
    };

    try {
      setLoading(true);

      const res = await createOrder(payload);
      console.log("Order Service Response:", res);

      // Deep lookup matching your exact network payload
      const authUrl = res?.data?.order?.paymentInfo?.authorizationUrl;

      if (authUrl) {
        clearCart();
        toast.success("Order created! Redirecting to Paystack...");

        // Perform full browser redirect to Paystack payment gateway
        window.location.href = authUrl;
      } else {
        console.error("Authorization URL missing in response payload:", res);
        toast.error("Could not retrieve Paystack checkout URL.");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">Checkout</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        {/* Delivery Form */}
        <Card>
          <CardContent className="grid gap-4 p-6">
            <h3 className="font-display text-lg font-semibold">Delivery Details</h3>

            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                maxLength={80}
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  maxLength={20}
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  maxLength={200}
                  placeholder="House No., Street name"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  maxLength={50}
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  maxLength={50}
                  placeholder="e.g. Lagos"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  maxLength={50}
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg bg-secondary/60 p-4 text-sm text-muted-foreground">
              💳 Payment method selected: <strong className="capitalize">{paymentMethod}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="h-fit">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold">Order Summary</h3>

            <ul className="mt-4 space-y-2 text-sm">
              {cart.map((i) => (
                <li key={i._id} className="flex justify-between gap-2">
                  <span className="line-clamp-1">
                    {i.name} ×{i.quantity}
                  </span>
                  <span className="font-medium">
                    {formatNaira(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span>{formatNaira(itemsPrice)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 && itemsPrice >= 200000 ? (
                    <span className="font-semibold text-emerald-600">FREE</span>
                  ) : (
                    formatNaira(deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-semibold text-foreground">
                <span>Total</span>
                <span>{formatNaira(grandTotal)}</span>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              onClick={submit}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Processing..." : "Place order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}