# 🛒 NetoStore — Mini E-Commerce Platform

> A production-ready mini e-commerce platform demonstrating **Neto-style template customization** with dynamic pricing, cart system, discount engine, and admin panel.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Pricing Engine](#-pricing-engine)
- [Neto Translation Guide](#-neto-translation-guide)
- [Neto Platform Constraints & Optimization](#-neto-platform-constraints--optimization-awareness)
- [Features](#-features)
- [Setup Instructions](#-setup-instructions)
- [API Reference](#-api-reference)
- [How This Project Demonstrates Neto Readiness](#-how-this-project-demonstrates-neto-readiness)
- [Neto Theme Simulator](#-neto-theme-simulator)
- [Learning Roadmap for Neto](#-learning-roadmap-for-neto)

---

## 🎯 Project Overview

NetoStore is a mini e-commerce platform designed to demonstrate how **Neto-style Liquid-based template customization** translates into modern web architecture. It showcases:

- **Dynamic product templating** with conditional rendering (premium badges, stock statuses, sale prices)
- **Business rule logic** encapsulated in a reusable pricing engine
- **Cart system** with server-side persistence and guest localStorage fallback
- **Discount engine** with bulk, member, and product-level discounts
- **Admin panel** for product management (CRUD, stock updates)
- **Clean architecture** with separation of concerns (services, types, lib, components)

---

## 🛠 Tech Stack

| Layer          | Technology               | Purpose                                 |
| -------------- | ------------------------ | --------------------------------------- |
| **Framework**  | Next.js 15 (App Router)  | Server/client rendering, routing, API   |
| **Language**   | TypeScript (strict mode) | Type safety across the codebase         |
| **Styling**    | TailwindCSS 4            | Rapid UI development, responsive design |
| **Database**   | Supabase (PostgreSQL)    | Data storage, RLS security              |
| **Auth**       | Supabase Auth            | Email/password authentication           |
| **Rendering**  | React Server Components  | Performance-optimized data fetching     |
| **Deployment** | Vercel                   | Edge-ready, CI/CD                       |

---

## 🏗 Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── admin/              # Admin panel (protected)
│   ├── api/                # REST API endpoints
│   │   ├── products/       # Product endpoints
│   │   ├── cart/           # Cart endpoints
│   │   ├── admin/          # Admin CRUD endpoints
│   │   └── auth/           # Auth callback
│   ├── cart/               # Cart page
│   ├── category/[slug]/    # Category pages
│   ├── product/[slug]/     # Product detail pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (product listing)
│   └── not-found.tsx       # 404 page
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── products/           # ProductCard, Grid, Filters, AddToCart
│   ├── providers/          # AuthProvider, CartProvider
│   └── ui/                 # Badge, LoadingSpinner, EmptyState, ErrorState
├── lib/
│   ├── supabase/           # Supabase client (server + browser)
│   └── pricing-engine.ts   # Neto-style pricing logic
├── services/               # Data access layer
│   ├── product-service.ts
│   └── cart-service.ts
├── types/                  # TypeScript type definitions
│   └── index.ts
└── middleware.ts            # Auth session refresh + route protection
```

### Key Architectural Decisions

1. **Service Layer Pattern**: All database queries go through service functions, not directly in components or routes
2. **Pricing Engine Separation**: Business rules are isolated in `lib/pricing-engine.ts`, reusable across server and client
3. **Server Components First**: Product listing and detail pages use RSC for optimal performance
4. **Dual Cart Strategy**: Authenticated users have server-side carts; guests use localStorage with the same UI

---

## 🗄 Database Schema

### Products Table

| Column                | Type          | Description                             |
| --------------------- | ------------- | --------------------------------------- |
| `id`                  | UUID (PK)     | Auto-generated unique identifier        |
| `name`                | TEXT          | Product display name                    |
| `slug`                | TEXT (UNIQUE) | URL-friendly identifier                 |
| `description`         | TEXT          | Product description                     |
| `price`               | NUMERIC(10,2) | Base price in USD                       |
| `discount_percentage` | NUMERIC(5,2)  | Optional product-level discount (0-100) |
| `stock`               | INTEGER       | Available inventory count               |
| `category`            | TEXT          | Product category                        |
| `image_url`           | TEXT          | Product image URL                       |
| `created_at`          | TIMESTAMPTZ   | Auto-set creation timestamp             |

### Cart Items Table

| Column       | Type        | Description                      |
| ------------ | ----------- | -------------------------------- |
| `id`         | UUID (PK)   | Auto-generated unique identifier |
| `user_id`    | UUID (FK)   | References `auth.users(id)`      |
| `product_id` | UUID (FK)   | References `products(id)`        |
| `quantity`   | INTEGER     | Item quantity (min: 1)           |
| `created_at` | TIMESTAMPTZ | Auto-set creation timestamp      |

### Row Level Security

- **Products**: Anyone can read; authenticated users can create/update/delete
- **Cart Items**: Users can only access their own cart items

---

## 💰 Pricing Engine

The pricing engine (`src/lib/pricing-engine.ts`) is the core business logic layer, simulating how Neto's Liquid templating handles conditional pricing.

### Discount Rules

| Rule                 | Condition                         | Discount    |
| -------------------- | --------------------------------- | ----------- |
| **Product Discount** | Product has `discount_percentage` | Variable %  |
| **Bulk Discount**    | Quantity ≥ 3                      | 10%         |
| **Member Discount**  | User is authenticated             | 5%          |
| **Free Shipping**    | Cart total > $1,000               | $15 savings |

### How Discounts Stack

Discounts are applied **sequentially** (not compounding from original):

1. Product discount is applied to the base price
2. Bulk discount is applied to the post-product-discount price
3. Member discount is applied to the post-bulk-discount price

### Key Functions

```typescript
calculateProductPrice(product, quantity, isAuthenticated) → PricingResult
applyBulkDiscount(subtotal, quantity) → number
applyMemberDiscount(subtotal, isAuthenticated) → number
calculateShipping(total) → ShippingResult
calculateTax(amount, taxRate?) → TaxResult
applyPromoCode(code, orderTotal) → PromoResult
calculateCartSummary(items, isAuthenticated, promoCode?) → CartSummaryData
```

All functions return detailed breakdowns showing every discount applied, making it easy to display to users.

---

## 🔗 Neto Translation Guide

This section maps every component of NetoStore to its Neto (Maropost Commerce Cloud) equivalent, demonstrating deep understanding of the platform's template system.

### Component → Template Mapping

| NetoStore Component                      | Neto Equivalent                         | Notes                        |
| ---------------------------------------- | --------------------------------------- | ---------------------------- |
| `src/app/page.tsx`                       | `page.home.template.html`               | Homepage with product grid   |
| `src/app/product/[slug]/page.tsx`        | `page.product.template.html`            | Product detail with variants |
| `src/app/cart/page.tsx`                  | `page.cart.template.html`               | Cart with pricing breakdown  |
| `src/app/checkout/page.tsx`              | `page.checkout.template.html`           | Order review before payment  |
| `src/app/checkout/confirmation/page.tsx` | `page.order-confirmation.template.html` | Post-purchase confirmation   |
| `src/app/(auth)/login/page.tsx`          | Neto built-in auth                      | Handled by platform          |
| `src/app/admin/page.tsx`                 | Neto Admin Panel                        | `admin.neto.com.au`          |

### Service Layer → Neto Data Objects

| NetoStore Service                     | Neto Object        | Access Pattern                                        |
| ------------------------------------- | ------------------ | ----------------------------------------------------- |
| `product-service.ts: getProducts()`   | `{{ product }}`    | Automatically available in product templates          |
| `product-service.ts: getCategories()` | `{{ categories }}` | Available via `{% for cat in categories %}`           |
| `cart-provider.tsx`                   | `{{ cart }}`       | Global object: `{{ cart.items }}`, `{{ cart.total }}` |
| `auth-provider.tsx`                   | `{{ customer }}`   | `{{ customer.name }}`, `{{ customer.group }}`         |
| `config/settings.json`                | `[@settings]`      | Theme configuration via Neto admin                    |

### Pricing Engine → Liquid Logic

| TypeScript Function       | Liquid Equivalent                                                        |
| ------------------------- | ------------------------------------------------------------------------ |
| `calculateProductPrice()` | `{% assign discount = price \| times: 0.01 %}`                           |
| `applyBulkDiscount()`     | `{% if qty >= settings.bulk_threshold %}`                                |
| `applyMemberDiscount()`   | `{% if customer %}{% assign disc = price \| times: 0.05 %}{% endif %}`   |
| `calculateShipping()`     | `{% if cart.total > settings.free_shipping_threshold %}`                 |
| `calculateTax()`          | `{% assign tax = subtotal \| times: settings.tax_rate \| times: 0.01 %}` |
| `applyPromoCode()`        | Neto's Marketing → Discount Coupons system                               |

### Template Hierarchy Understanding

```
Neto Theme Structure:
├── Base Layout (header.html, footer.html)
│   └── Page Template (page.product.template.html)
│       ├── {% include 'snippet.product-card' %}     ← Reusable partial
│       ├── {% include 'snippet.price-display' %}     ← Business logic
│       └── {% include 'snippet.cart-summary' %}      ← Cart calculation
└── Config (settings.json)                            ← Admin-editable constants

NetoStore Equivalent:
├── Layout (layout.tsx + header/footer components)
│   └── Page Component (page.tsx)
│       ├── <ProductCard />                           ← React component
│       ├── calculateProductPrice()                   ← TypeScript function
│       └── <CartSummary />                           ← Component + pricing engine
└── Constants (pricing-engine.ts constants)            ← Hardcoded (would be DB/admin)
```

> 📁 See `/neto-theme-simulator/` for working Liquid templates that implement the same business rules.
> 📄 See `/docs/liquid-vs-typescript.md` for detailed side-by-side code comparisons.

---

## 🔧 Neto Platform Constraints & Optimization Awareness

### Template Performance Best Practices

**Avoid Nested Loops:** In Liquid, nested `{% for %}` loops are expensive because the template engine processes them server-side on every page load. Unlike Next.js where React handles efficient DOM diffing, Liquid re-renders the entire template output.

```liquid
{# ❌ BAD: Nested loops create O(n²) rendering #}
{% for product in products %}
  {% for variant in product.variants %}
    {% for option in variant.options %}
      {{ option.name }}
    {% endfor %}
  {% endfor %}
{% endfor %}

{# ✅ GOOD: Flatten data before rendering, or use snippets #}
{% for product in products %}
  {% include 'snippet.product-card' with product %}
{% endfor %}
```

### Snippet Reusability

Snippets in Neto function like React components — reusable, parameterized template partials:

- Extract repeated markup into `/templates/snippets/`
- Pass data via `{% include 'snippet-name' with variable %}`
- Keep snippets focused on one responsibility
- Name descriptively: `snippet.product-card.liquid`, not `card.liquid`

### Asset Organization & CDN

```
/httpdocs/assets/
├── css/
│   ├── theme.css          ← Main stylesheet
│   └── components/        ← Component-specific styles
├── js/
│   ├── theme.js           ← Main JavaScript
│   └── components/        ← Component scripts
└── images/
    ├── logo.svg
    └── icons/
```

- Neto serves static assets via CDN automatically
- Minify CSS/JS before uploading
- Use image optimization (WebP format where possible)
- Reference assets via `{{ asset_url 'theme.css' }}` for CDN paths

### Debugging Slow Liquid Templates

1. **Check for N+1 queries:** Avoid loading related data inside loops
2. **Profile with Neto's debug mode:** Add `?debug=template` to preview URLs
3. **Reduce object depth:** Access `{{ product.name }}` not `{{ product.category.parent.name }}` repeatedly
4. **Cache expensive calculations:** Use `{% assign %}` at the top of templates, not inline
5. **Limit pagination:** Don't load 100+ products per page; use Neto's built-in pagination

### Handling Theme Updates Safely

1. **Version control:** Always keep themes in Git before deploying
2. **Use Neto's theme editor preview** before publishing changes
3. **Test on staging domain** if available
4. **Back up `settings.json`** — this contains all admin-configured theme values
5. **Never edit core Neto templates** — override with custom snippets instead
6. **Document custom changes** in a `CHANGELOG.md` within the theme folder

---

## ✨ Features

### Core

- ✅ Product listing with filters, sort, search, pagination
- ✅ Product detail with SEO metadata and JSON-LD structured data
- ✅ Cart system (server-side for auth, localStorage for guests)
- ✅ Dynamic pricing with discount breakdown display
- ✅ Checkout flow (order review → confirmation)
- ✅ Tax calculation (10% GST, configurable)
- ✅ Promo code system (SAVE10, FLAT20, WELCOME15)
- ✅ Supabase email authentication
- ✅ Admin panel with product CRUD and stock management
- ✅ Responsive dark theme with glassmorphism design

### Bonus

- ✅ Product search
- ✅ Pagination
- ✅ Category pages
- ✅ SEO metadata per page
- ✅ JSON-LD structured data
- ✅ Custom 404 page
- ✅ Loading, empty, and error states
- ✅ Premium badge for products > $500
- ✅ Stock status indicators

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com/) account (free tier works)

### 1. Clone & Install

```bash
cd /path/to/NetoWeb
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Set Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Schema

1. Go to your Supabase dashboard → SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL — this creates tables, indexes, RLS policies, and seed data

### 5. Configure Auth (Optional)

For testing without email confirmation:

1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", disable "Confirm email"

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### 7. Deploy to Vercel

```bash
npx vercel
```

Add your environment variables in the Vercel dashboard.

---

## 📡 API Reference

### Products

| Method | Endpoint             | Description                                                |
| ------ | -------------------- | ---------------------------------------------------------- |
| `GET`  | `/api/products`      | List products (query: category, sort, search, page, limit) |
| `GET`  | `/api/products/[id]` | Get single product by ID                                   |

### Cart (Authenticated)

| Method   | Endpoint    | Description                           |
| -------- | ----------- | ------------------------------------- |
| `GET`    | `/api/cart` | Get user's cart items                 |
| `POST`   | `/api/cart` | Add item (body: product_id, quantity) |
| `PATCH`  | `/api/cart` | Update item (body: item_id, quantity) |
| `DELETE` | `/api/cart` | Remove item (body: item_id)           |

### Admin (Authenticated)

| Method   | Endpoint              | Description                          |
| -------- | --------------------- | ------------------------------------ |
| `POST`   | `/api/admin/products` | Create product                       |
| `PATCH`  | `/api/admin/products` | Update product (body: id, ...fields) |
| `DELETE` | `/api/admin/products` | Delete product (body: id)            |

---

## 🔑 Demo Credentials

Create a test account via the sign-up page, or pre-create one in Supabase Dashboard → Authentication → Users.

**Suggested test user:**

- Email: `admin@netostore.com`
- Password: `admin123456`

> **Note:** If email confirmation is enabled, you'll need to confirm the email address first.

---

## 📸 Screenshots

> _Screenshots can be added after deployment._

| Page           | Description                              |
| -------------- | ---------------------------------------- |
| Home           | Product grid with filters and search     |
| Product Detail | Detailed view with pricing benefits      |
| Cart           | Full pricing breakdown with discounts    |
| Admin          | Product management with CRUD operations  |
| Login          | Authentication with glassmorphism design |

---

## 🎯 How This Project Demonstrates Neto Readiness

### What This Project Proves

1. **I understand conditional business logic in templates.** The pricing engine implements the same rules that Neto enforces through Liquid tags — bulk discounts, member pricing, and stock-based display logic. The `/neto-theme-simulator/` folder contains working Liquid implementations of every rule.

2. **I separate concerns correctly.** Neto themes work best when logic is organized into snippets and templates with clear responsibilities. My architecture mirrors this: services for data, a pricing engine for business rules, and components for display.

3. **I understand Neto's data model.** The type system maps directly to Neto objects (`{{ product }}`, `{{ cart }}`, `{{ customer }}`). See the translation guide above for exact mappings.

4. **I can write production Liquid.** The `neto-theme-simulator/` contains real Liquid templates with correct syntax for conditionals, loops, filters, assign statements, and snippet includes. See `docs/liquid-vs-typescript.md` for side-by-side proof.

5. **I know platform constraints.** The performance and optimization section demonstrates awareness of Neto-specific pitfalls: nested loop costs, CDN asset handling, template debugging, and safe update practices.

### Transferable Skills

| Skill                  | Evidence                       | Neto Application                   |
| ---------------------- | ------------------------------ | ---------------------------------- |
| TypeScript/strict mode | Entire codebase                | Quick learning of any typed system |
| Service layer pattern  | `services/product-service.ts`  | Clean data access in any platform  |
| Pricing logic          | `lib/pricing-engine.ts`        | Direct translation to Liquid rules |
| Security (RLS)         | `supabase/schema.sql`          | Understanding permission models    |
| Responsive design      | TailwindCSS implementation     | Theme customization for any device |
| E-commerce workflows   | Cart → Checkout → Confirmation | Neto's order lifecycle             |

### Honest Assessment

I have not worked directly with the Neto admin panel or deployed a live Neto theme to production. This project is my way of demonstrating that I understand the **concepts, constraints, and patterns** that make a Neto developer effective. I learn quickly, I write clean code, and I'm ready to apply these skills to the actual platform.

---

## 🗂 Neto Theme Simulator

The `/neto-theme-simulator/` folder contains a realistic Neto theme structure:

```
neto-theme-simulator/
├── templates/
│   ├── pages/
│   │   ├── page.home.template.html     ← Homepage (Liquid)
│   │   └── page.product.template.html  ← Product page (Liquid)
│   └── snippets/
│       ├── snippet.product-card.liquid  ← Reusable product card
│       ├── snippet.price-display.liquid ← Full pricing engine in Liquid
│       └── snippet.cart-summary.liquid  ← Cart totals with tax/shipping
├── assets/
│   └── theme.css                       ← Theme stylesheet
├── config/
│   └── settings.json                   ← Theme configuration values
└── README.md                           ← Detailed documentation
```

Every template uses **real Liquid syntax** with Neto-specific objects. The pricing snippet implements the same sequential discount logic as `pricing-engine.ts`.

---

## 📚 Learning Roadmap for Neto

### 1. Understand Liquid Templates

- Learn [Liquid syntax](https://shopify.github.io/liquid/) (conditionals, loops, filters)
- Study how Neto uses Liquid for product rendering

### 2. Template Customization Patterns

- Conditional display based on product attributes
- Price formatting with Liquid filters
- Customer group-specific content

### 3. Business Logic in Templates

- Quantity-based pricing tiers
- Discount rules and promotion logic
- Shipping calculations based on cart value

### 4. Modern Equivalent (This Project)

- React Server Components for templating
- TypeScript pricing engine for business rules
- API routes for backend logic
- Supabase for data persistence

### 5. Advanced Neto Concepts

- Theme customization and branding
- Product variant management
- Inventory tracking
- Order workflow automation

---

## 📄 License

This is a demonstration project for educational purposes. Built with ❤️ using Next.js, Supabase, and TailwindCSS.
