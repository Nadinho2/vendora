import Link from "next/link";
import { redirect } from "next/navigation";

import { createAdminOrder } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusOptions = ["pending", "confirmed", "approved", "sent", "delivered", "cancelled"] as const;

export default async function AdminNewOrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  async function create(formData: FormData) {
    "use server";

    const userId = String(formData.get("userId") ?? "");
    const productId = String(formData.get("productId") ?? "");
    const qty = Number(formData.get("quantity") ?? 1);
    const status = String(formData.get("status") ?? "pending");
    const paymentMethod = String(formData.get("payment_method") ?? "").trim();

    if (!userId || !productId || !Number.isFinite(qty) || qty < 1) {
      redirect("/admin/orders/new?error=Invalid%20input");
    }

    const res = await createAdminOrder({
      userId,
      status,
      payment_method: paymentMethod.length ? paymentMethod : null,
      items: [{ productId, quantity: Math.floor(qty) }],
    });

    if (!res.success) {
      redirect(`/admin/orders/new?error=${encodeURIComponent(res.error)}`);
    }

    redirect(`/admin/orders/${encodeURIComponent(res.data.orderId)}`);
  }

  const sp = (await searchParams) ?? {};
  const error = sp.error ? decodeURIComponent(sp.error) : null;

  const supabase = await createSupabaseServerClient();
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id,email,full_name")
    .order("created_at", { ascending: false })
    .limit(200);

  const profiles =
    (profilesData as Array<{ id: string; email: string | null; full_name: string | null }> | null) ?? [];

  const { data: productsData } = await supabase
    .from("products")
    .select("id,title")
    .order("created_at", { ascending: false })
    .limit(500);

  const products = (productsData as Array<{ id: string; title: string }> | null) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-tight">Add order</div>
          <div className="text-sm text-muted-foreground">Create an order for an existing user.</div>
        </div>
        <Button asChild variant="outline" className="rounded-2xl">
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      </div>

      {error ? (
        <Card className="rounded-3xl border-border/60 bg-card/40 p-5 backdrop-blur">
          <div className="text-sm font-semibold tracking-tight">Could not create order</div>
          <div className="mt-1 text-sm text-muted-foreground">{error}</div>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
        <form action={create} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Customer</div>
            <select
              name="userId"
              className="h-11 rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select a customer…
              </option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {(p.full_name ?? "").trim() || p.email || p.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Status</div>
            <select
              name="status"
              className="h-11 rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              defaultValue="pending"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <div className="text-sm font-medium">Product</div>
            <select
              name="productId"
              className="h-11 rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select a product…
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Quantity</div>
            <Input
              name="quantity"
              type="number"
              min={1}
              defaultValue={1}
              className="h-11 rounded-2xl bg-background/60"
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Payment method (optional)</div>
            <Input
              name="payment_method"
              placeholder="e.g. cash, bank transfer"
              className="h-11 rounded-2xl bg-background/60"
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="h-11 w-full rounded-2xl">
              Create order
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

