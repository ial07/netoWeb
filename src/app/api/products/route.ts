import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/product-service";
import type { ProductFilters } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Fetch products with optional filters, sorting, search, and pagination.
 *
 * Query params:
 * - category: filter by category
 * - search: search by name/description
 * - sort: price_asc | price_desc | newest | name_asc
 * - page: page number (default 1)
 * - limit: items per page (default 12)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: ProductFilters = {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      sort: (searchParams.get("sort") as ProductFilters["sort"]) || "newest",
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "12", 10),
    };

    // Validation
    if (filters.page! < 1) filters.page = 1;
    if (filters.limit! < 1 || filters.limit! > 50) filters.limit = 12;

    const result = await getProducts(filters);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
