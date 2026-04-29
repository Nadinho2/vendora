"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireUserId() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) redirect("/login");
  return { supabase, userId };
}

export async function addToCart(input: { productId: string; quantity?: number }) {
  const { supabase, userId } = await requireUserId();
  const quantity = Math.max(1, Math.floor(input.quantity ?? 1));

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id,quantity")
    .eq("user_id", userId)
    .eq("product_id", input.productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: input.productId,
      quantity,
      updated_at: new Date().toISOString(),
    });
  }

  revalidatePath("/cart");
  revalidatePath("/");
}

export async function updateCartItemQuantity(input: { cartItemId: string; quantity: number }) {
  const { supabase, userId } = await requireUserId();
  const quantity = Math.max(1, Math.floor(input.quantity));

  await supabase
    .from("cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("id", input.cartItemId)
    .eq("user_id", userId);

  revalidatePath("/cart");
}

export async function removeCartItem(input: { cartItemId: string }) {
  const { supabase, userId } = await requireUserId();

  await supabase
    .from("cart_items")
    .delete()
    .eq("id", input.cartItemId)
    .eq("user_id", userId);

  revalidatePath("/cart");
}

export async function clearCart() {
  const { supabase, userId } = await requireUserId();
  await supabase.from("cart_items").delete().eq("user_id", userId);
  revalidatePath("/cart");
}
