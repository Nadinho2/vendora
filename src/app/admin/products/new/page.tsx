import { ProductForm } from "@/components/admin/product-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("category").limit(500);
  const categories = Array.from(
    new Set(
      ((data as Array<{ category: string | null }> | null) ?? [])
        .map((r) => r.category)
        .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
        .map((c) => c.trim()),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <ProductForm title="Add New Product" backHref="/admin/products" categories={categories} />
  );
}
