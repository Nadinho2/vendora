import { AdminProductsTable } from "@/components/admin/products-table";
import { Card } from "@/components/ui/card";
import { getSupabaseEnvIssue } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/store/products";

export default async function AdminProductsPage() {
  const supabaseIssue = getSupabaseEnvIssue();
  if (supabaseIssue) {
    return (
      <Card className="rounded-3xl border-border/60 bg-card/40 p-8 backdrop-blur">
        <div className="text-sm font-semibold tracking-tight">
          Supabase not configured
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {supabaseIssue}
        </div>
      </Card>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-5">
      {products.length === 0 ? (
        <Card className="rounded-3xl border-border/60 bg-card/40 p-8 backdrop-blur">
          <div className="text-sm font-semibold tracking-tight">No products yet.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Import products to populate the storefront, or add a new product manually.
          </div>
        </Card>
      ) : null}

      <AdminProductsTable products={products} />
    </div>
  );
}
