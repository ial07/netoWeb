/**
 * ============================================
 * Neto-Style Pricing Engine
 * ============================================
 *
 * This pricing engine simulates how Liquid-based e-commerce templates
 * like Neto handle conditional rendering and pricing logic.
 *
 * In Neto's template system (based on Liquid), pricing rules are applied
 * through conditional template logic. For example:
 *
 *   {% if item.quantity >= 3 %}
 *     {% assign discount = item.price | times: 0.10 %}
 *   {% endif %}
 *
 * This engine abstracts that same conditional, rule-based approach into
 * reusable TypeScript functions, providing:
 *
 * 1. Clear rule-based pricing (similar to Liquid conditionals)
 * 2. Separation from UI layer (like template helpers in Neto)
 * 3. Reusable, testable logic
 * 4. Transparent discount breakdown for display
 *
 * Rules:
 * - Product discount: Applied if product has `discount_percentage`
 * - Bulk discount: 10% off if quantity >= 3
 * - Member discount: Extra 5% off if user is authenticated
 * - Free shipping: If cart total > $1000
 * ============================================
 */

import type {
  Product,
  DiscountBreakdown,
  PricingResult,
  ShippingResult,
  TaxResult,
  PromoCode,
  PromoResult,
} from "@/types";

// ============================================
// Constants (no hardcoded values in logic)
// ============================================

const BULK_DISCOUNT_THRESHOLD = 3;
const BULK_DISCOUNT_PERCENTAGE = 10;
const MEMBER_DISCOUNT_PERCENTAGE = 5;
const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_COST = 15;

// ============================================
// Core Pricing Functions
// ============================================

/**
 * Calculate the final price for a product considering all applicable discounts.
 *
 * Simulates Neto's Liquid-style conditional pricing:
 * - First applies product-level discount (like Neto's sale price)
 * - Then applies bulk discount (quantity-based tier pricing)
 * - Then applies member discount (authenticated user benefits)
 *
 * @param product - The product being priced
 * @param quantity - Number of units being purchased
 * @param isAuthenticated - Whether the user is logged in
 * @returns PricingResult with full discount breakdown
 */
export function calculateProductPrice(
  product: Product,
  quantity: number,
  isAuthenticated: boolean,
): PricingResult {
  const discounts: DiscountBreakdown[] = [];
  const originalPrice = product.price * quantity;
  let currentPrice = originalPrice;

  // Rule 1: Product-level discount (equivalent to Neto's "sale_price" tag)
  if (product.discount_percentage && product.discount_percentage > 0) {
    const discountAmount = currentPrice * (product.discount_percentage / 100);
    discounts.push({
      type: "product",
      label: `${product.discount_percentage}% Product Discount`,
      percentage: product.discount_percentage,
      amount: Math.round(discountAmount * 100) / 100,
    });
    currentPrice -= discountAmount;
  }

  // Rule 2: Bulk discount (equivalent to Neto's quantity-based pricing tiers)
  const bulkDiscount = applyBulkDiscount(currentPrice, quantity);
  if (bulkDiscount > 0) {
    discounts.push({
      type: "bulk",
      label: `${BULK_DISCOUNT_PERCENTAGE}% Bulk Discount (${BULK_DISCOUNT_THRESHOLD}+ items)`,
      percentage: BULK_DISCOUNT_PERCENTAGE,
      amount: Math.round(bulkDiscount * 100) / 100,
    });
    currentPrice -= bulkDiscount;
  }

  // Rule 3: Member discount (equivalent to Neto's customer group pricing)
  const memberDiscount = applyMemberDiscount(currentPrice, isAuthenticated);
  if (memberDiscount > 0) {
    discounts.push({
      type: "member",
      label: `${MEMBER_DISCOUNT_PERCENTAGE}% Member Discount`,
      percentage: MEMBER_DISCOUNT_PERCENTAGE,
      amount: Math.round(memberDiscount * 100) / 100,
    });
    currentPrice -= memberDiscount;
  }

  const finalPrice = Math.round(currentPrice * 100) / 100;
  const totalDiscount = Math.round((originalPrice - finalPrice) * 100) / 100;

  return {
    originalPrice: Math.round(originalPrice * 100) / 100,
    finalPrice,
    discounts,
    totalDiscount,
  };
}

/**
 * Apply bulk discount based on quantity.
 * Simulates Neto's quantity break pricing rules.
 *
 * @param subtotal - Current subtotal after previous discounts
 * @param quantity - Number of items
 * @returns The discount amount to subtract
 */
export function applyBulkDiscount(subtotal: number, quantity: number): number {
  if (quantity >= BULK_DISCOUNT_THRESHOLD) {
    return subtotal * (BULK_DISCOUNT_PERCENTAGE / 100);
  }
  return 0;
}

/**
 * Apply member discount for authenticated users.
 * Simulates Neto's customer group pricing logic.
 *
 * @param subtotal - Current subtotal after previous discounts
 * @param isAuthenticated - Whether user is logged in
 * @returns The discount amount to subtract
 */
export function applyMemberDiscount(
  subtotal: number,
  isAuthenticated: boolean,
): number {
  if (isAuthenticated) {
    return subtotal * (MEMBER_DISCOUNT_PERCENTAGE / 100);
  }
  return 0;
}

/**
 * Calculate shipping cost based on order total.
 * Simulates Neto's conditional shipping rules.
 *
 * In Liquid: {% if cart.total > 1000 %}Free Shipping{% endif %}
 *
 * @param total - The cart total after discounts
 * @returns ShippingResult with cost and free shipping flag
 */
export function calculateShipping(total: number): ShippingResult {
  const isFreeShipping = total > FREE_SHIPPING_THRESHOLD;

  return {
    cost: isFreeShipping ? 0 : STANDARD_SHIPPING_COST,
    isFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };
}

// ============================================
// Tax Calculation
// (Maps to Neto's GST/tax configuration)
// ============================================

const DEFAULT_TAX_RATE = 10; // 10% GST (Australian standard)

/**
 * Calculate tax on the given amount.
 * Simulates Neto's GST calculation which is configurable per-store.
 *
 * In Neto, tax is typically applied after discounts but before shipping.
 *
 * @param amount - The amount to calculate tax on
 * @param taxRate - Tax rate as a percentage (default: 10% GST)
 * @returns TaxResult with rate, amount, and label
 */
export function calculateTax(
  amount: number,
  taxRate: number = DEFAULT_TAX_RATE,
): TaxResult {
  const taxAmount = Math.round(amount * (taxRate / 100) * 100) / 100;
  return {
    rate: taxRate,
    amount: taxAmount,
    label: `GST (${taxRate}%)`,
  };
}

// ============================================
// Promo Code System
// (Maps to Neto's coupon/discount code engine)
// ============================================

/**
 * Built-in demo promo codes.
 * In production, these would come from the database.
 * In Neto, this is managed via Marketing → Discount Coupons.
 */
const PROMO_CODES: PromoCode[] = [
  {
    code: "SAVE10",
    discount_type: "percentage",
    discount_value: 10,
    min_order_amount: 50,
    max_uses: null,
    current_uses: 0,
    active: true,
    expires_at: null,
  },
  {
    code: "FLAT20",
    discount_type: "fixed",
    discount_value: 20,
    min_order_amount: 100,
    max_uses: 100,
    current_uses: 12,
    active: true,
    expires_at: null,
  },
  {
    code: "WELCOME15",
    discount_type: "percentage",
    discount_value: 15,
    min_order_amount: null,
    max_uses: 1,
    current_uses: 0,
    active: true,
    expires_at: null,
  },
];

/**
 * Validate and apply a promo code.
 * Simulates Neto's coupon validation logic.
 *
 * @param code - The promo code string
 * @param orderTotal - Current order total before promo
 * @returns PromoResult with validation status and discount amount
 */
export function applyPromoCode(code: string, orderTotal: number): PromoResult {
  const normalized = code.trim().toUpperCase();
  const promo = PROMO_CODES.find((p) => p.code === normalized);

  if (!promo) {
    return {
      valid: false,
      code: normalized,
      discount_amount: 0,
      error: "Invalid promo code",
    };
  }

  if (!promo.active) {
    return {
      valid: false,
      code: normalized,
      discount_amount: 0,
      error: "This promo code is no longer active",
    };
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return {
      valid: false,
      code: normalized,
      discount_amount: 0,
      error: "This promo code has expired",
    };
  }

  if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
    return {
      valid: false,
      code: normalized,
      discount_amount: 0,
      error: "This promo code has reached its usage limit",
    };
  }

  if (promo.min_order_amount !== null && orderTotal < promo.min_order_amount) {
    return {
      valid: false,
      code: normalized,
      discount_amount: 0,
      error: `Minimum order of $${promo.min_order_amount.toFixed(2)} required`,
    };
  }

  let discount_amount: number;
  if (promo.discount_type === "percentage") {
    discount_amount =
      Math.round(orderTotal * (promo.discount_value / 100) * 100) / 100;
  } else {
    discount_amount = Math.min(promo.discount_value, orderTotal);
  }

  return { valid: true, code: normalized, discount_amount };
}

/**
 * Get list of available promo codes (for demo display).
 */
export function getAvailablePromoCodes(): PromoCode[] {
  return PROMO_CODES.filter((p) => p.active);
}

// ============================================
// Cart Summary (Full Calculation)
// ============================================

/**
 * Calculate complete cart summary including all items, discounts, tax, and shipping.
 *
 * @param items - Array of cart items with product data
 * @param isAuthenticated - Whether user is logged in
 * @param promoCode - Optional promo code to apply
 * @returns Complete cart summary with full pricing breakdown
 */
export function calculateCartSummary(
  items: Array<{ product: Product; quantity: number }>,
  isAuthenticated: boolean,
  promoCode?: string,
) {
  let subtotal = 0;
  const allDiscounts: DiscountBreakdown[] = [];

  const itemPricings = items.map((item) => {
    const pricing = calculateProductPrice(
      item.product,
      item.quantity,
      isAuthenticated,
    );
    subtotal += pricing.originalPrice;
    allDiscounts.push(...pricing.discounts);
    return {
      ...item,
      pricing,
    };
  });

  let totalAfterDiscounts = itemPricings.reduce(
    (sum, item) => sum + item.pricing.finalPrice,
    0,
  );

  // Apply promo code if provided
  let promoResult: PromoResult | undefined;
  if (promoCode) {
    promoResult = applyPromoCode(promoCode, totalAfterDiscounts);
    if (promoResult.valid) {
      allDiscounts.push({
        type: "promo",
        label: `Promo: ${promoResult.code}`,
        percentage: 0,
        amount: promoResult.discount_amount,
      });
      totalAfterDiscounts -= promoResult.discount_amount;
    }
  }

  // Calculate tax (after all discounts)
  const tax = calculateTax(totalAfterDiscounts);

  // Calculate shipping
  const shipping = calculateShipping(totalAfterDiscounts);

  const total =
    Math.round((totalAfterDiscounts + tax.amount + shipping.cost) * 100) / 100;

  return {
    items: itemPricings,
    subtotal: Math.round(subtotal * 100) / 100,
    totalAfterDiscounts: Math.round(totalAfterDiscounts * 100) / 100,
    totalDiscount: Math.round((subtotal - totalAfterDiscounts) * 100) / 100,
    discounts: allDiscounts,
    tax,
    shipping,
    promoResult,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
