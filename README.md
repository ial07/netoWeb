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
- [How This Relates to Neto](#-how-this-relates-to-neto-template-customization)
- [Features](#-features)
- [Setup Instructions](#-setup-instructions)
- [API Reference](#-api-reference)
- [Demo Credentials](#-demo-credentials)
- [Screenshots](#-screenshots)
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
calculateCartSummary(items, isAuthenticated) → CartSummaryData
```

All functions return detailed breakdowns showing every discount applied, making it easy to display to users.

---

## 🔗 How This Relates to Neto Template Customization

### Neto's Approach (Liquid Templates)

Neto uses **Liquid-based templates** where business logic is embedded in template tags:

```liquid
{% if item.price > 500 %}
  <span class="badge premium">Premium</span>
{% endif %}

{% if item.quantity >= 3 %}
  {% assign discount = item.subtotal | times: 0.10 %}
  <span class="discount">Bulk: -{{ discount | money }}</span>
{% endif %}

{% if customer.logged_in %}
  {% assign member_discount = item.subtotal | times: 0.05 %}
{% endif %}
```

### Our Approach (TypeScript Engine)

We extract the same logic into **pure TypeScript functions**:

```typescript
// Equivalent to Neto's Liquid conditional blocks
export function calculateProductPrice(product, quantity, isAuthenticated) {
  // Rule 1: Product discount (≈ Neto's sale_price tag)
  // Rule 2: Bulk discount (≈ Neto's quantity break pricing)
  // Rule 3: Member discount (≈ Neto's customer group pricing)
  return { originalPrice, finalPrice, discounts, totalDiscount };
}
```

### Why This Matters

| Neto (Liquid)        | NetoStore (TypeScript) |
| -------------------- | ---------------------- |
| Logic in templates   | Logic in service layer |
| Hard to test         | Easy to unit test      |
| Coupled to rendering | Reusable anywhere      |
| Template variables   | Typed function returns |
| Conditional tags     | If/switch statements   |

This demonstrates that **the same business rules** can be implemented in modern frameworks while maintaining the concept of template-driven conditional logic.

---

## ✨ Features

### Core

- ✅ Product listing with filters, sort, search, pagination
- ✅ Product detail with SEO metadata and JSON-LD structured data
- ✅ Cart system (server-side for auth, localStorage for guests)
- ✅ Dynamic pricing with discount breakdown display
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
