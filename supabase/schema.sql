-- ============================================
-- Neto-Style Mini E-Commerce Database Schema
-- Run this SQL in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Products Table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  discount_percentage NUMERIC(5, 2) DEFAULT NULL CHECK (
    discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)
  ),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category TEXT NOT NULL DEFAULT 'uncategorized',
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================
-- Cart Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Indexes for cart queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete products (admin simulation)
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cart items
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- Seed Data
-- ============================================
INSERT INTO products (name, slug, description, price, discount_percentage, stock, category, image_url) VALUES
  (
    'Premium Wireless Headphones',
    'premium-wireless-headphones',
    'High-fidelity wireless headphones with active noise cancellation, 30-hour battery life, and premium comfort padding. Perfect for audiophiles and professionals.',
    599.99,
    10,
    15,
    'electronics',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'
  ),
  (
    'Mechanical Keyboard RGB',
    'mechanical-keyboard-rgb',
    'Full-size mechanical keyboard with Cherry MX switches, per-key RGB lighting, and aircraft-grade aluminum frame. Built for gaming and productivity.',
    189.99,
    NULL,
    25,
    'electronics',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=600&fit=crop'
  ),
  (
    'Ultra-Wide Monitor 34"',
    'ultra-wide-monitor-34',
    'Immersive 34-inch ultra-wide curved monitor with 4K resolution, 144Hz refresh rate, and HDR support. Ideal for creative professionals.',
    899.99,
    15,
    8,
    'electronics',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop'
  ),
  (
    'Ergonomic Office Chair',
    'ergonomic-office-chair',
    'Premium ergonomic office chair with lumbar support, adjustable armrests, breathable mesh back, and 10-year warranty.',
    449.99,
    NULL,
    12,
    'furniture',
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=600&fit=crop'
  ),
  (
    'Standing Desk Electric',
    'standing-desk-electric',
    'Electric height-adjustable standing desk with memory presets, cable management, and solid bamboo top. Supports up to 300 lbs.',
    699.99,
    20,
    3,
    'furniture',
    'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&h=600&fit=crop'
  ),
  (
    'Laptop Backpack Pro',
    'laptop-backpack-pro',
    'Water-resistant laptop backpack with 17" compartment, USB charging port, anti-theft design, and organizational pockets.',
    79.99,
    NULL,
    50,
    'accessories',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop'
  ),
  (
    'Wireless Mouse Ergonomic',
    'wireless-mouse-ergonomic',
    'Vertical ergonomic wireless mouse with adjustable DPI, quiet clicks, and rechargeable battery. Reduces wrist strain.',
    49.99,
    5,
    100,
    'accessories',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop'
  ),
  (
    'USB-C Hub 12-in-1',
    'usb-c-hub-12-in-1',
    'Universal USB-C hub with HDMI 4K, Ethernet, SD card reader, USB 3.0 ports, and 100W power delivery pass-through.',
    89.99,
    NULL,
    35,
    'accessories',
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&h=600&fit=crop'
  ),
  (
    'Smart Home Speaker',
    'smart-home-speaker',
    'AI-powered smart speaker with rich 360° sound, voice assistant, multi-room audio support, and smart home hub integration.',
    249.99,
    NULL,
    0,
    'electronics',
    'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&h=600&fit=crop'
  ),
  (
    'Designer Desk Lamp',
    'designer-desk-lamp',
    'Minimalist LED desk lamp with adjustable color temperature, brightness levels, wireless charging base, and touch controls.',
    129.99,
    10,
    20,
    'furniture',
    'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop'
  ),
  (
    'Professional Webcam 4K',
    'professional-webcam-4k',
    '4K Ultra HD webcam with auto-focus, built-in ring light, noise-canceling microphones, and privacy shutter.',
    179.99,
    NULL,
    18,
    'electronics',
    'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&h=600&fit=crop'
  ),
  (
    'Cable Management Kit',
    'cable-management-kit',
    'Complete cable management solution with clips, sleeves, ties, and adhesive mounts. Keep your workspace clean and organized.',
    29.99,
    NULL,
    200,
    'accessories',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'
  )
ON CONFLICT (slug) DO NOTHING;
