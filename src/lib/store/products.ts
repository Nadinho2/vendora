import { getSupabaseEnvIssue } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Product = {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  images: string[];
  category: string | null;
  rating: number | null;
  description: string | null;
  affiliate_url: string | null;
  shipping_info: unknown | null;
  variants: unknown | null;
  created_at: string;
  updated_at: string;
};

export type ProductFilters = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
};

export async function getProducts(filters: ProductFilters) {
  if (getSupabaseEnvIssue()) return [];

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);

  if (filters.q) {
    const q = filters.q.trim();
    if (q.length > 0) query = query.ilike("title", `%${q}%`);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (typeof filters.minPrice === "number") {
    query = query.gte("price", filters.minPrice);
  }

  if (typeof filters.maxPrice === "number") {
    query = query.lte("price", filters.maxPrice);
  }

  if (typeof filters.minRating === "number") {
    query = query.gte("rating", filters.minRating);
  }

  const { data } = await query;
  return (data ?? []) as Product[];
}

export async function getProductById(id: string) {
  if (getSupabaseEnvIssue()) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Product | null;
}

export async function getCategories() {
  if (getSupabaseEnvIssue()) return [];

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null)
    .limit(200);

  const categories = new Set<string>();
  for (const row of (data ?? []) as Array<{ category: string | null }>) {
    if (row.category) categories.add(row.category);
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}
