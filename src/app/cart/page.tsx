"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { calculateProductPrice, calculateShipping } from "@/lib/pricing-engine";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EmptyState from "@/components/ui/empty-state";
import type { CartItemWithProduct, Product, GuestCartItem } from "@/types";

interface CartDisplayItem {
  id: string;
  product: Product;
  quantity: number;
  isGuest: boolean;
}

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    guestCart,
    updateGuestCartItem,
    removeFromGuestCart,
    refreshCartCount,
  } = useCart();
  const [items, setItems] = useState<CartDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
        // Guest cart — need to fetch product details
        if (guestCart.length > 0) {
          const productIds = guestCart.map((item) => item.product_id);
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

  const handleUpdateQuantity = async (
    item: CartDisplayItem,
    newQty: number,
  ) => {
    if (newQty < 1) return handleRemove(item);
    setUpdating(item.id);
    try {
      if (item.isGuest) {
        updateGuestCartItem(item.id, newQty);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i)),
        );
      } else {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: item.id, quantity: newQty }),
        });
        if (res.ok) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, quantity: newQty } : i,
            ),
          );
        }
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (item: CartDisplayItem) => {
    setUpdating(item.id);
    try {
      if (item.isGuest) {
        removeFromGuestCart(item.id);
      } else {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: item.id }),
        });
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      refreshCartCount();
    } finally {
      setUpdating(null);
    }
  };

  // Calculate pricing
  const isAuthenticated = !!user;
  const itemPricings = items.map((item) => ({
    ...item,
    pricing: calculateProductPrice(
      item.product,
      item.quantity,
      isAuthenticated,
    ),
  }));

  const totalAfterDiscounts = itemPricings.reduce(
    (sum, item) => sum + item.pricing.finalPrice,
    0,
  );
  const subtotal = itemPricings.reduce(
    (sum, item) => sum + item.pricing.originalPrice,
    0,
  );
  const totalDiscount = subtotal - totalAfterDiscounts;
  const shipping = calculateShipping(totalAfterDiscounts);
  const grandTotal = totalAfterDiscounts + shipping.cost;

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse our products and add items to your cart to get started."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          }
          action={
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {itemPricings.map((item) => (
              <div
                key={item.id}
                className={`glass rounded-xl p-4 flex gap-4 ${
                  updating === item.id ? "opacity-50" : ""
                }`}
              >
                {/* Image */}
                <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-lighter">
                  <Image
                    src={item.product.image_url || "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="text-sm font-semibold text-text-primary hover:text-primary-light transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-text-muted capitalize mt-1">
                    {item.product.category}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-text-primary">
                      ${item.pricing.finalPrice.toFixed(2)}
                    </span>
                    {item.pricing.totalDiscount > 0 && (
                      <span className="text-xs text-text-muted line-through">
                        ${item.pricing.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Discounts applied */}
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

                {/* Quantity & Remove */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-text-muted hover:text-danger transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center rounded-lg border border-border/50 overflow-hidden">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item, item.quantity - 1)
                      }
                      className="h-8 w-8 flex items-center justify-center bg-surface-light hover:bg-surface-lighter transition-colors text-xs"
                    >
                      −
                    </button>
                    <span className="h-8 w-10 flex items-center justify-center text-xs font-medium border-x border-border/50">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item, item.quantity + 1)
                      }
                      className="h-8 w-8 flex items-center justify-center bg-surface-light hover:bg-surface-lighter transition-colors text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
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

                {!shipping.isFreeShipping && (
                  <p className="text-xs text-text-muted">
                    Free shipping on orders over $
                    {shipping.freeShippingThreshold.toLocaleString()}
                  </p>
                )}

                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between text-lg font-bold text-text-primary">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Discount breakdown */}
              {itemPricings.some((i) => i.pricing.discounts.length > 0) && (
                <div className="border-t border-border/50 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Applied Discounts
                  </h3>
                  <div className="space-y-1.5">
                    {itemPricings.flatMap((item) =>
                      item.pricing.discounts.map((d, i) => (
                        <div
                          key={`${item.id}-${i}`}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-success">{d.label}</span>
                          <span className="text-success">
                            -${d.amount.toFixed(2)}
                          </span>
                        </div>
                      )),
                    )}
                  </div>
                </div>
              )}

              {!user && (
                <div className="border-t border-border/50 pt-4">
                  <Link
                    href="/login?redirect=/cart"
                    className="block w-full text-center py-2.5 rounded-xl bg-surface-lighter text-sm font-medium text-primary-light hover:bg-surface-light transition-colors"
                  >
                    Sign in for 5% member discount →
                  </Link>
                </div>
              )}

              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
