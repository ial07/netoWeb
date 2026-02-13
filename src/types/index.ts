// ============================================
// Product Types
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_percentage: number | null;
  stock: number;
  category: string;
  image_url: string;
  created_at: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "name_asc";
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_percentage: number | null;
  stock: number;
  category: string;
  image_url: string;
}

// ============================================
// Cart Types
// ============================================

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

export interface CartItemWithProduct extends CartItem {
  products: Product;
}

export interface GuestCartItem {
  product_id: string;
  quantity: number;
  product?: Product;
}

// ============================================
// Pricing Types
// ============================================

export interface DiscountBreakdown {
  type: "product" | "bulk" | "member" | "promo";
  label: string;
  percentage: number;
  amount: number;
}

export interface PricingResult {
  originalPrice: number;
  finalPrice: number;
  discounts: DiscountBreakdown[];
  totalDiscount: number;
}

export interface ShippingResult {
  cost: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
}

export interface TaxResult {
  rate: number;
  amount: number;
  label: string;
}

export interface CartSummaryData {
  subtotal: number;
  pricing: PricingResult;
  shipping: ShippingResult;
  tax: TaxResult;
  total: number;
  itemCount: number;
}

// ============================================
// API Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Auth Types
// ============================================

export interface AuthUser {
  id: string;
  email: string;
}

// ============================================
// Product Variant Types
// (Maps to Neto's built-in variant system)
// ============================================

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  options: Record<string, string>; // e.g. { size: "L", color: "Black" }
  price_modifier: number; // Added/subtracted from base price
  stock: number;
}

export interface VariantOption {
  name: string; // e.g. "Size", "Color"
  values: string[]; // e.g. ["S", "M", "L", "XL"]
}

// ============================================
// Promo Code Types
// (Maps to Neto's coupon/discount code system)
// ============================================

export interface PromoCode {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  expires_at: string | null;
}

export interface PromoResult {
  valid: boolean;
  code: string;
  discount_amount: number;
  error?: string;
}

// ============================================
// Order Types
// (Maps to Neto's order management system)
// ============================================

export interface Order {
  id: string;
  user_id: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  subtotal: number;
  discount_total: number;
  tax_amount: number;
  shipping_cost: number;
  total: number;
  promo_code: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
  variant_options: Record<string, string> | null;
}
