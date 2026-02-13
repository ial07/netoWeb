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
  type: "product" | "bulk" | "member";
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

export interface CartSummaryData {
  subtotal: number;
  pricing: PricingResult;
  shipping: ShippingResult;
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
