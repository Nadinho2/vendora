"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) redirect("/login?next=/admin/products");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin,role")
    .eq("id", userId)
    .maybeSingle();

  const profileValue = profile as { is_admin?: boolean | null; role?: string | null } | null;
  const role = (profileValue?.role ?? "").toLowerCase();
  const isAdmin = role === "admin" || profileValue?.is_admin === true;
  if (!isAdmin) redirect("/");
  return supabase;
}

export async function deleteProduct(input: { productId: string }) {
  const supabase = await requireAdmin();
  await supabase.from("products").delete().eq("id", input.productId);
  revalidatePath("/");
  revalidatePath("/admin/products");
}
