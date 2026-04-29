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

  return (
    <ProductForm
      title="Edit Product"
      backHref="/admin/products"
      productId={product.id}
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
