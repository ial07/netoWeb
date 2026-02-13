"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
}

export default function AddToCartButton({
  product,
  disabled,
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addToGuestCart, refreshCartCount } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAddToCart = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (user) {
        // Authenticated: add via API
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: product.id,
            quantity,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add to cart");
        }

        refreshCartCount();
        setMessage({ type: "success", text: "Added to cart!" });
      } else {
        // Guest: add to localStorage
        addToGuestCart(product.id, quantity);
        setMessage({
          type: "success",
          text: "Added to cart! Sign in for member discounts.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-text-secondary font-medium">Qty:</label>
        <div className="flex items-center rounded-lg border border-border/50 overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 flex items-center justify-center bg-surface-light hover:bg-surface-lighter transition-colors text-text-secondary"
            disabled={disabled}
          >
            −
          </button>
          <span className="h-10 w-12 flex items-center justify-center bg-surface text-sm font-medium text-text-primary border-x border-border/50">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="h-10 w-10 flex items-center justify-center bg-surface-light hover:bg-surface-lighter transition-colors text-text-secondary"
            disabled={disabled}
          >
            +
          </button>
        </div>
        {quantity >= 3 && (
          <span className="text-xs text-success font-medium">
            🎉 10% bulk discount applied!
          </span>
        )}
      </div>

      {/* Add to Cart button */}
      <button
        onClick={handleAddToCart}
        disabled={disabled || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : disabled ? (
          "Out of Stock"
        ) : (
          <>
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
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            Add to Cart
          </>
        )}
      </button>

      {/* View Cart link */}
      {message?.type === "success" && (
        <button
          onClick={() => router.push("/cart")}
          className="w-full h-10 rounded-xl bg-surface-light text-text-secondary text-sm font-medium hover:bg-surface-lighter transition-colors"
        >
          View Cart →
        </button>
      )}

      {/* Message */}
      {message && (
        <p
          className={`text-sm text-center ${
            message.type === "success" ? "text-success" : "text-danger"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
