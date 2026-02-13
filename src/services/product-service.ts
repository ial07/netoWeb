import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, ProductFilters, PaginatedResponse } from "@/types";

/**
 * Fetch products with filtering, sorting, search, and pagination.
 */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<Product>> {
  const supabase = await createSupabaseServerClient();
  const { category, search, sort = "newest", page = 1, limit = 12 } = filters;

  let query = supabase.from("products").select("*", { count: "exact" });

  // Filter by category
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  // Search by name or description
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Sorting
  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return {
    data: (data as Product[]) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Fetch a single product by slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data as Product;
}

/**
 * Fetch a single product by ID.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data as Product;
}

/**
 * Get all distinct categories.
 */
export async function getCategories(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("category")
    .order("category");

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categories = [...new Set((data || []).map((p) => p.category))];
  return categories;
}

/**
 * Create a new product.
 */
export async function createProduct(
  productData: Omit<Product, "id" | "created_at">,
): Promise<Product> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data as Product;
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  id: string,
  productData: Partial<Omit<Product, "id" | "created_at">>,
): Promise<Product> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return data as Product;
}

/**
 * Delete a product.
 */
export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}
