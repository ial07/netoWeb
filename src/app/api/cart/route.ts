import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "@/services/cart-service";

/**
 * Helper: get authenticated user or return 401 response
 */
async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * GET /api/cart
 * Get all cart items for the authenticated user.
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const items = await getCartItems(user.id);

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Add an item to the cart.
 * Body: { product_id: string, quantity?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { product_id, quantity = 1 } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 },
      );
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "quantity must be a positive number" },
        { status: 400 },
      );
    }

    await addToCart(user.id, product_id, quantity);

    return NextResponse.json(
      { message: "Item added to cart" },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/cart
 * Update a cart item's quantity.
 * Body: { item_id: string, quantity: number }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { item_id, quantity } = body;

    if (!item_id) {
      return NextResponse.json(
        { error: "item_id is required" },
        { status: 400 },
      );
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json(
        { error: "quantity must be a non-negative number" },
        { status: 400 },
      );
    }

    await updateCartItem(item_id, user.id, quantity);

    return NextResponse.json({ message: "Cart updated" }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/cart
 * Remove an item from the cart.
 * Body: { item_id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { item_id } = body;

    if (!item_id) {
      return NextResponse.json(
        { error: "item_id is required" },
        { status: 400 },
      );
    }

    await removeCartItem(item_id, user.id);

    return NextResponse.json(
      { message: "Item removed from cart" },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
