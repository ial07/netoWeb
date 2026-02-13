import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/product-service";

/**
 * Helper: ensure authenticated user for admin operations
 */
async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * POST /api/admin/products
 * Create a new product.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      discount_percentage,
      stock,
      category,
      image_url,
    } = body;

    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Required fields: name, description, price, stock" },
        { status: 400 },
      );
    }

    const product = await createProduct({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      price: parseFloat(price),
      discount_percentage: discount_percentage
        ? parseFloat(discount_percentage)
        : null,
      stock: parseInt(stock),
      category: category || "uncategorized",
      image_url: image_url || "",
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/products
 * Update an existing product.
 * Body: { id: string, ...fields }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const product = await updateProduct(id, updateData);

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products
 * Delete a product.
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    await deleteProduct(id);

    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
