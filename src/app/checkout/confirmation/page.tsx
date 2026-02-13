"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Order Confirmation Page
 *
 * Maps to Neto's order confirmation template:
 * templates/pages/page.order-confirmation.template.html
 *
 * In Neto, this page is shown after successful payment
 * and displays the order ID, items, and total.
 */
function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "ORD-DEMO";
  const total = params.get("total") || "0.00";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      {/* Success Icon */}
      <div className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-10 w-10 text-success"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-text-primary mb-2">
        Order Confirmed! 🎉
      </h1>
      <p className="text-text-muted mb-8">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

      {/* Order Details Card */}
      <div className="glass rounded-xl p-6 text-left mb-8 max-w-md mx-auto">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Order Details
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Order ID</span>
            <span className="font-mono font-semibold text-primary-light">
              {orderId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Status</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success">
              Confirmed
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Total Paid</span>
            <span className="font-bold text-text-primary">${total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Date</span>
            <span className="text-text-secondary">
              {new Date().toLocaleDateString("en-AU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="border-t border-border/50 mt-4 pt-4">
          <p className="text-xs text-text-muted">
            In Neto, order confirmation emails are sent automatically via the
            platform&apos;s notification system. Order status updates are
            managed through the Neto admin panel under Orders → Pending.
          </p>
        </div>
      </div>

      {/* Neto Context Note */}
      <div className="glass rounded-xl p-4 mb-8 max-w-md mx-auto text-left">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          Neto Platform Mapping
        </h3>
        <ul className="text-xs text-text-muted space-y-1">
          <li>
            • This page maps to{" "}
            <code className="text-primary-light">
              page.order-confirmation.template.html
            </code>
          </li>
          <li>• Neto auto-generates order IDs via the Orders API</li>
          <li>
            • Payment is handled by Neto&apos;s integrated gateway (Stripe,
            PayPal, etc.)
          </li>
          <li>• Stock is auto-decremented on order placement</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-surface-lighter text-sm font-medium text-text-secondary hover:bg-surface-light transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-text-muted">Loading confirmation...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
