import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CartItemWithProduct } from "@/types";

/**
 * Get all cart items for a user, joined with product data.
 */
export async function getCartItems(
  userId: string,
): Promise<CartItemWithProduct[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select("*, products(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch cart items: ${error.message}`);
  }

  return (data as CartItemWithProduct[]) || [];
}

/**
 * Add a product to the cart (or increase quantity if already exists).
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Check if item already exists in cart
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (existing) {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);

    if (error) {
      throw new Error(`Failed to update cart: ${error.message}`);
    }
  } else {
    // Insert new item
    const { error } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: productId,
      quantity,
    });

    if (error) {
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }
}

/**
 * Update the quantity of a cart item.
 */
export async function updateCartItem(
  itemId: string,
  userId: string,
  quantity: number,
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  if (quantity <= 0) {
    await removeCartItem(itemId, userId);
    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update cart item: ${error.message}`);
  }
}

/**
 * Remove an item from the cart.
 */
export async function removeCartItem(
  itemId: string,
  userId: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to remove cart item: ${error.message}`);
  }
}

/**
 * Get cart item count for a user.
 */
export async function getCartCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();

  const { count, error } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    return 0;
  }

  return count || 0;
}
