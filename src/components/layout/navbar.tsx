"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useState } from "react";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="text-xl font-bold gradient-text group-hover:opacity-80 transition-opacity">
              NetoStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Products
            </Link>
            <Link
              href="/category/electronics"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Electronics
            </Link>
            <Link
              href="/category/furniture"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Furniture
            </Link>
            <Link
              href="/category/accessories"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Accessories
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-surface-light hover:bg-surface-lighter transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white pulse-badge">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {loading ? (
              <div className="h-10 w-20 rounded-lg shimmer" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/products"
                  className="hidden sm:inline-flex h-10 items-center px-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
                >
                  Admin
                </Link>
                <button
                  onClick={signOut}
                  className="h-10 px-4 rounded-lg text-sm font-medium bg-surface-light text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="h-10 px-4 inline-flex items-center rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-primary-dark text-white hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-surface-light"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-light"
              onClick={() => setMobileOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/category/electronics"
              className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-light"
              onClick={() => setMobileOpen(false)}
            >
              Electronics
            </Link>
            <Link
              href="/category/furniture"
              className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-light"
              onClick={() => setMobileOpen(false)}
            >
              Furniture
            </Link>
            <Link
              href="/category/accessories"
              className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-light"
              onClick={() => setMobileOpen(false)}
            >
              Accessories
            </Link>
            {user && (
              <Link
                href="/admin/products"
                className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-light"
                onClick={() => setMobileOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
