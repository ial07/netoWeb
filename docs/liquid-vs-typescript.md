# TypeScript ↔ Liquid: Side-by-Side Comparison

This document demonstrates fluency in **both TypeScript and Liquid** by showing how the same business logic is implemented in each. Every rule in `src/lib/pricing-engine.ts` has a direct Liquid equivalent in the `neto-theme-simulator/` folder.

---

## 1. Bulk Discount

**Rule:** 10% off when quantity ≥ 3

### TypeScript (`pricing-engine.ts`)

```typescript
const BULK_DISCOUNT_THRESHOLD = 3;
const BULK_DISCOUNT_PERCENTAGE = 10;

export function applyBulkDiscount(subtotal: number, quantity: number): number {
  if (quantity >= BULK_DISCOUNT_THRESHOLD) {
    return subtotal * (BULK_DISCOUNT_PERCENTAGE / 100);
  }
  return 0;
}
```

### Liquid (`snippet.price-display.liquid`)

```liquid
{% if settings.bulk_discount_enabled and qty >= settings.bulk_discount_threshold %}
  {% assign bulk_discount_rate = settings.bulk_discount_percentage | times: 0.01 %}
  {% assign bulk_discount_amount = current_price | times: bulk_discount_rate %}
  {% assign current_price = current_price | minus: bulk_discount_amount %}
{% endif %}
```

### Key Differences

| Aspect      | TypeScript                      | Liquid                            |
| ----------- | ------------------------------- | --------------------------------- | ------------------------- |
| Constants   | Module-level `const`            | `settings.json` via `[@settings]` |
| Math        | `subtotal * (percentage / 100)` | `                                 | times: 0.01` filter chain |
| Return      | Returns discount amount         | Mutates `current_price` assign    |
| Testability | Unit testable with Jest         | Manual template preview           |

---

## 2. Member Discount

**Rule:** 5% off for authenticated users

### TypeScript (`pricing-engine.ts`)

```typescript
const MEMBER_DISCOUNT_PERCENTAGE = 5;

export function applyMemberDiscount(
  subtotal: number,
  isAuthenticated: boolean,
): number {
  if (isAuthenticated) {
    return subtotal * (MEMBER_DISCOUNT_PERCENTAGE / 100);
  }
  return 0;
}
```

### Liquid (`snippet.price-display.liquid`)

```liquid
{% if settings.member_discount_enabled and customer %}
  {% assign member_discount_rate = settings.member_discount_percentage | times: 0.01 %}
  {% assign member_discount_amount = current_price | times: member_discount_rate %}
  {% assign current_price = current_price | minus: member_discount_amount %}
{% endif %}

{% comment %}
  For non-authenticated users, show a teaser:
{% endcomment %}
{% unless customer %}
  <p class="discount-list__item--locked">
    🔒 Sign in for {{ settings.member_discount_percentage }}% off
  </p>
{% endunless %}
```

### Key Differences

| Aspect     | TypeScript                 | Liquid                         |
| ---------- | -------------------------- | ------------------------------ |
| Auth check | `isAuthenticated` boolean  | `customer` object truthiness   |
| User data  | Passed as parameter        | Global `{{ customer }}` object |
| UI logic   | Separated from calculation | Embedded in same template      |

---

## 3. Free Shipping Threshold

**Rule:** Free shipping when cart total > $1,000

### TypeScript (`pricing-engine.ts`)

```typescript
const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_COST = 15;

export function calculateShipping(total: number): ShippingResult {
  const isFreeShipping = total > FREE_SHIPPING_THRESHOLD;
  return {
    cost: isFreeShipping ? 0 : STANDARD_SHIPPING_COST,
    isFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };
}
```

### Liquid (`snippet.cart-summary.liquid`)

```liquid
{% if settings.free_shipping_enabled and cart_after_discounts > settings.free_shipping_threshold %}
  <div class="cart-summary__row cart-summary__row--free-shipping">
    <span>Shipping</span>
    <span class="free-shipping-badge">FREE</span>
  </div>
{% else %}
  <div class="cart-summary__row">
    <span>Shipping</span>
    <span>{{ settings.standard_shipping_cost | money }}</span>
  </div>

  {% assign remaining = settings.free_shipping_threshold | minus: cart_after_discounts %}
  {% if remaining > 0 %}
    <p class="cart-summary__free-shipping-hint">
      Add {{ remaining | money }} more for free shipping!
    </p>
  {% endif %}
{% endif %}
```

### Key Differences

| Aspect           | TypeScript                         | Liquid                   |
| ---------------- | ---------------------------------- | ------------------------ |
| Return           | Structured `ShippingResult` object | Inline HTML rendering    |
| "Remaining" calc | Done in UI component               | Done in template         |
| Reusability      | Called from any service            | Coupled to cart template |

---

## 4. Low Stock Warning

**Rule:** Show "Only X left" when stock ≤ 5

### TypeScript (`product-card.tsx`)

```tsx
// In the React component
{
  product.stock > 0 && product.stock <= 5 && (
    <Badge variant="low-stock">Only {product.stock} left</Badge>
  );
}
{
  product.stock <= 0 && <Badge variant="out-of-stock">Out of Stock</Badge>;
}
```

### Liquid (`snippet.product-card.liquid`)

```liquid
{% if product.stock <= 0 %}
  <span class="badge badge--out-of-stock">Out of Stock</span>
{% elsif product.stock <= settings.low_stock_threshold %}
  <span class="badge badge--low-stock">
    Only {{ product.stock }} left
  </span>
{% endif %}
```

### Key Differences

| Aspect    | TypeScript                   | Liquid                               |
| --------- | ---------------------------- | ------------------------------------ |
| Threshold | Hardcoded `5` in component   | Configurable via `settings.json`     |
| Component | Reusable `<Badge>` component | Inline `<span>` with CSS class       |
| Ordering  | Positive check first         | Negative check first (more readable) |

---

## 5. Premium Badge

**Rule:** Show "Premium" badge for products priced > $500

### TypeScript (`product-card.tsx`)

```tsx
// In the React component
{
  product.price > 500 && <Badge variant="premium">Premium</Badge>;
}

// Badge component renders:
<span
  className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold 
  bg-gradient-to-r from-amber-500 to-orange-500 text-white"
>
  Premium
</span>;
```

### Liquid (`snippet.product-card.liquid`)

```liquid
{% if product.price > settings.premium_badge_threshold %}
  <span class="badge badge--premium">
    {{ settings.badges.premium.label | default: 'Premium' }}
  </span>
{% endif %}
```

### Key Differences

| Aspect        | TypeScript               | Liquid                                          |
| ------------- | ------------------------ | ----------------------------------------------- |
| Threshold     | Hardcoded `500`          | Configurable `settings.premium_badge_threshold` |
| Label         | Hardcoded `"Premium"`    | Configurable `settings.badges.premium.label`    |
| Styling       | Tailwind utility classes | Semantic CSS class + stylesheet                 |
| Customization | Requires code change     | Admin panel settings change                     |

---

## Summary: Architecture Comparison

| Concept            | TypeScript (NetoStore)         | Liquid (Neto)                           |
| ------------------ | ------------------------------ | --------------------------------------- |
| **Business Logic** | `lib/pricing-engine.ts`        | `snippets/snippet.price-display.liquid` |
| **Configuration**  | Constants in source code       | `config/settings.json` (admin-editable) |
| **Components**     | React components (`.tsx`)      | Liquid snippets (`.liquid`)             |
| **Data Access**    | Service functions → Supabase   | Neto data objects (`{{ product }}`)     |
| **Templating**     | JSX with conditional rendering | Liquid tags (`{% if %}`, `{% for %}`)   |
| **State**          | React Context / Server state   | Global Liquid objects                   |
| **Styling**        | TailwindCSS utility classes    | Semantic CSS with BEM naming            |
| **Testing**        | Jest / Vitest unit tests       | Manual preview in theme editor          |

### The Core Insight

Both approaches solve the same problem: **conditional rendering of business rules in templates**. The difference is where the logic lives:

- **Neto/Liquid:** Logic is _in_ the template, reading from platform objects
- **Next.js/TypeScript:** Logic is _separated_ from the template, passed as props

A developer fluent in one approach can translate to the other because the **mental model is identical**: evaluate conditions → apply rules → render output.
