"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sendOrderConfirmationEmail } from "@/lib/resend";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function checkout(input: { productId?: string; mode?: "affiliate" | "order" }) {
  const { supabase, user } = await requireUser();

  const mode = input.mode ?? "affiliate";

  let items: Array<{
    product_id: string;
    title: string;
    unit_price: number;
    quantity: number;
    affiliate_url: string | null;
  }> = [];

  if (input.productId) {
    const { data: product } = await supabase
      .from("products")
      .select("id,title,price,affiliate_url")
      .eq("id", input.productId)
      .maybeSingle();

    if (!product) redirect("/");

    items = [
      {
        product_id: product.id,
        title: product.title,
        unit_price: product.price,
        quantity: 1,
        affiliate_url: product.affiliate_url ?? null,
      },
    ];

    if (mode === "affiliate" && product.affiliate_url) {
      redirect(product.affiliate_url);
    }
  } else {
    type ProductLite = {
      id: string;
      title: string;
      price: number;
      affiliate_url: string | null;
    };

    function toProductLite(value: unknown): ProductLite | null {
      const v = Array.isArray(value) ? value[0] : value;
      if (!v || typeof v !== "object") return null;
      const obj = v as Record<string, unknown>;
      if (typeof obj.id !== "string") return null;
      if (typeof obj.title !== "string") return null;
      if (typeof obj.price !== "number") return null;
      const affiliate_url =
        typeof obj.affiliate_url === "string" ? obj.affiliate_url : null;
      return {
        id: obj.id,
        title: obj.title,
        price: obj.price,
        affiliate_url,
      };
    }

    const { data } = await supabase
      .from("cart_items")
      .select("quantity,product:products(id,title,price,affiliate_url)")
      .eq("user_id", user.id);

    const rows = (data ?? []) as Array<{ quantity: number; product: unknown }>;
    items = rows.flatMap((row) => {
      const product = toProductLite(row.product);
      if (!product) return [];
      return [
        {
          product_id: product.id,
          title: product.title,
          unit_price: product.price,
          quantity: row.quantity,
          affiliate_url: product.affiliate_url ?? null,
        },
      ];
    });
  }

  if (items.length === 0) redirect("/cart");

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const currency = "USD";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total,
      currency,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    redirect("/checkout?error=order");
  }

  await supabase.from("order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      title: i.title,
      unit_price: i.unit_price,
      quantity: i.quantity,
    })),
  );

  if (!input.productId) {
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    revalidatePath("/cart");
  }

  if (user.email) {
    await sendOrderConfirmationEmail({
      to: user.email,
      orderId: order.id,
      items: items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        unitPrice: i.unit_price,
      })),
      total,
      currency,
    });
  }

  revalidatePath("/");
  redirect(`/orders/${order.id}`);
}
