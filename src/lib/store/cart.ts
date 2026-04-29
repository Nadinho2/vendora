import { getSupabaseEnvIssue } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    original_price: number | null;
    images: string[];
    affiliate_url: string | null;
  } | null;
};

export async function getCartItems() {
  if (getSupabaseEnvIssue()) {
    return { items: [] as CartItemWithProduct[], userEmail: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { items: [] as CartItemWithProduct[], userEmail: null };

  const { data } = await supabase
    .from("cart_items")
    .select("id,quantity,product:products(id,title,price,original_price,images,affiliate_url)")
    .order("created_at", { ascending: false });

  return { items: (data as unknown as CartItemWithProduct[]) ?? [], userEmail: user.email ?? null };
}
