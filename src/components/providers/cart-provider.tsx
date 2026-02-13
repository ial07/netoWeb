"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/providers/auth-provider";
import type { GuestCartItem } from "@/types";

interface CartContextType {
  cartCount: number;
  guestCart: GuestCartItem[];
  addToGuestCart: (productId: string, quantity?: number) => void;
  updateGuestCartItem: (productId: string, quantity: number) => void;
  removeFromGuestCart: (productId: string) => void;
  clearGuestCart: () => void;
  refreshCartCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "neto-guest-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);

  // Load guest cart from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        setGuestCart(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save guest cart to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
  }, [guestCart]);

  // Refresh cart count from server for authenticated users
  const refreshCartCount = useCallback(async () => {
    if (user) {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          setCartCount(data.data?.length || 0);
        }
      } catch {
        // ignore
      }
    } else {
      setCartCount(guestCart.length);
    }
  }, [user, guestCart.length]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  const addToGuestCart = useCallback(
    (productId: string, quantity: number = 1) => {
      setGuestCart((prev) => {
        const existing = prev.find((item) => item.product_id === productId);
        if (existing) {
          return prev.map((item) =>
            item.product_id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...prev, { product_id: productId, quantity }];
      });
    },
    [],
  );

  const updateGuestCartItem = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromGuestCart(productId);
        return;
      }
      setGuestCart((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item,
        ),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const removeFromGuestCart = useCallback((productId: string) => {
    setGuestCart((prev) =>
      prev.filter((item) => item.product_id !== productId),
    );
  }, []);

  const clearGuestCart = useCallback(() => {
    setGuestCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        guestCart,
        addToGuestCart,
        updateGuestCartItem,
        removeFromGuestCart,
        clearGuestCart,
        refreshCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
