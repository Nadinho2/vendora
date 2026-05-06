import { ProductForm } from "@/components/admin/product-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  const product = data as
    | {
        id: string;
        title: string;
        price: number;
        original_price: number | null;
        rating: number | null;
        category: string | null;
        description: string | null;
        images: string[] | null;
      }
    | null;

  if (!product) notFound();

  const { data: categoriesData } = await supabase.from("products").select("category").limit(500);
  const categories = Array.from(
    new Set(
      ((categoriesData as Array<{ category: string | null }> | null) ?? [])
        .map((r) => r.category)
        .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
        .map((c) => c.trim()),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <ProductForm
      title="Edit Product"
      backHref="/admin/products"
      productId={product.id}
      categories={categories}
      initialValue={{
        title: product.title ?? "",
        price: typeof product.price === "number" ? String(product.price) : "",
        original_price:
          typeof product.original_price === "number" ? String(product.original_price) : "",
        rating: typeof product.rating === "number" ? String(product.rating) : "",
        category: product.category ?? "",
        description: product.description ?? "",
        images: product.images?.length ? product.images : [""],
      }}
    />
  );
}
