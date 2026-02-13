# Neto Theme Simulator

This folder contains a **realistic simulation** of a Neto (Maropost Commerce Cloud) theme structure. It demonstrates how the concepts implemented in the NetoStore Next.js application translate directly to Neto's Liquid-based template system.

## Folder Structure

```
neto-theme-simulator/
├── templates/
│   ├── pages/                          # Full page templates
│   │   ├── page.home.template.html     # Homepage layout
│   │   └── page.product.template.html  # Product detail page
│   └── snippets/                       # Reusable template partials
│       ├── snippet.product-card.liquid  # Product card component
│       ├── snippet.price-display.liquid # Pricing with discounts
│       └── snippet.cart-summary.liquid  # Cart totals & breakdown
├── assets/
│   └── theme.css                       # Theme stylesheet
├── config/
│   └── settings.json                   # Theme configuration
└── README.md                           # This file
```

## How Neto Templates Work

### Template Hierarchy

```
Base Layout (header, footer, nav)
  └── Page Template (page.product.template.html)
       ├── {% include 'snippet.product-card' %}
       ├── {% include 'snippet.price-display' %}
       └── {% include 'snippet.cart-summary' %}
```

### Key Neto Objects

| Object           | Description          | Example                                       |
| ---------------- | -------------------- | --------------------------------------------- |
| `{{ product }}`  | Current product data | `{{ product.name }}`, `{{ product.price }}`   |
| `{{ cart }}`     | Shopping cart state  | `{{ cart.items }}`, `{{ cart.total }}`        |
| `{{ customer }}` | Logged-in user data  | `{{ customer.name }}`, `{{ customer.group }}` |
| `[@settings]`    | Theme configuration  | `[@settings:bulk_discount_threshold@]`        |

### Mapping to NetoStore

| Neto Template                  | NetoStore Equivalent                       |
| ------------------------------ | ------------------------------------------ |
| `page.home.template.html`      | `src/app/page.tsx`                         |
| `page.product.template.html`   | `src/app/product/[slug]/page.tsx`          |
| `snippet.product-card.liquid`  | `src/components/products/product-card.tsx` |
| `snippet.price-display.liquid` | `src/lib/pricing-engine.ts` + UI           |
| `snippet.cart-summary.liquid`  | `src/app/cart/page.tsx`                    |
| `config/settings.json`         | Constants in `pricing-engine.ts`           |

## Usage

These templates are **documentation artifacts** demonstrating Liquid fluency. They use real Liquid syntax and Neto-specific template tags to show how the same business logic in `pricing-engine.ts` would be implemented in a Neto theme.
