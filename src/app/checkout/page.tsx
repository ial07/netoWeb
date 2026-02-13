"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import {
  calculateProductPrice,
  calculateShipping,
  calculateTax,
  applyPromoCode,
} from "@/lib/pricing-engine";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { CartItemWithProduct, Product, GuestCartItem } from "@/types";

interface CartDisplayItem {
  id: string;
  product: Product;
  quantity: number;
  isGuest: boolean;
}

/**
 * Checkout Page — Order Review
 *
 * Maps to Neto's built-in checkout flow:
 * - Neto: /checkout/ → order review → payment → confirmation
 * - NetoStore: /checkout → review → /checkout/confirmation
 *
 * In Neto, the checkout template is customizable via
 * templates/pages/page.checkout.template.html
 */
export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { guestCart } = useCart();
  const router = useRouter();
  const [items, setItems] = useState<CartDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [promoCode] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          const cartItems: CartItemWithProduct[] = data.data || [];
          setItems(
            cartItems.map((item) => ({
              id: item.id,
              product: item.products,
              quantity: item.quantity,
              isGuest: false,
            })),
          );
        }
      } else {
        if (guestCart.length > 0) {
          const res = await fetch(`/api/products?limit=50`);
          if (res.ok) {
            const data = await res.json();
            const products: Product[] = data.data || [];
            const guestItems: CartDisplayItem[] = guestCart
              .map((item: GuestCartItem) => {
                const product = products.find(
                  (p: Product) => p.id === item.product_id,
                );
                if (!product) return null;
                return {
                  id: item.product_id,
                  product,
                  quantity: item.quantity,
                  isGuest: true,
                };
              })
              .filter(Boolean) as CartDisplayItem[];
            setItems(guestItems);
          }
        } else {
          setItems([]);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user, guestCart]);

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [authLoading, fetchCart]);

  // Pricing calculation
  const isAuthenticated = !!user;
  const itemPricings = items.map((item) => ({
    ...item,
    pricing: calculateProductPrice(
      item.product,
      item.quantity,
      isAuthenticated,
    ),
  }));

  let totalAfterDiscounts = itemPricings.reduce(
    (sum, item) => sum + item.pricing.finalPrice,
    0,
  );
  const subtotal = itemPricings.reduce(
    (sum, item) => sum + item.pricing.originalPrice,
    0,
  );

  let promoDiscount = 0;
  if (promoCode) {
    const result = applyPromoCode(promoCode, totalAfterDiscounts);
    if (result.valid) {
      promoDiscount = result.discount_amount;
      totalAfterDiscounts -= promoDiscount;
    }
  }

  const totalDiscount = subtotal - totalAfterDiscounts;
  const tax = calculateTax(totalAfterDiscounts);
  const shipping = calculateShipping(totalAfterDiscounts);
  const grandTotal = totalAfterDiscounts + tax.amount + shipping.cost;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    // Simulate order placement (in real Neto, this hits the order API)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    router.push(
      `/checkout/confirmation?orderId=${orderId}&total=${grandTotal.toFixed(2)}`,
    );
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Checkout</h1>
        <p className="text-text-muted mb-6">Your cart is empty.</p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary-light">
          Home
        </Link>
        <span className="mx-2">›</span>
        <Link href="/cart" className="hover:text-primary-light">
          Cart
        </Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">Checkout</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
        Order Review
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Items ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
            <div className="divide-y divide-border/30">
              {itemPricings.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-text-muted capitalize">
                      {item.product.category} · Qty: {item.quantity}
                    </p>
                    {item.pricing.discounts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.pricing.discounts.map((d, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-success/10 text-success font-medium"
                          >
                            {d.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-text-primary">
                      ${item.pricing.finalPrice.toFixed(2)}
                    </p>
                    {item.pricing.totalDiscount > 0 && (
                      <p className="text-xs text-text-muted line-through">
                        ${item.pricing.originalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Info (simulated) */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Shipping
            </h2>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-surface-lighter flex items-center justify-center text-text-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Standard Shipping
                </p>
                <p className="text-xs text-text-muted">
                  {shipping.isFreeShipping
                    ? "FREE — Order qualifies for free shipping"
                    : `$${shipping.cost.toFixed(2)} — Free on orders over $${shipping.freeShippingThreshold.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="glass rounded-xl p-6 sticky top-24 space-y-4">
            <h2 className="text-lg font-bold text-text-primary">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discounts</span>
                  <span>-${totalDiscount.toFixed(2)}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Promo: {promoCode}</span>
                  <span>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-text-secondary">
                <span>{tax.label}</span>
                <span>${tax.amount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span>
                  {shipping.isFreeShipping ? (
                    <span className="text-success font-medium">FREE</span>
                  ) : (
                    `$${shipping.cost.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="border-t border-border/50 pt-3">
                <div className="flex justify-between text-lg font-bold text-text-primary">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>

            <p className="text-[10px] text-text-muted text-center">
              Demo checkout — no real payment is processed.
              <br />
              In Neto, this connects to payment gateways via the Payments API.
            </p>

            <Link
              href="/cart"
              className="block text-center text-sm text-primary-light hover:underline"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
