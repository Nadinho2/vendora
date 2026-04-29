import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseEnvIssue } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function OrdersPage() {
  const supabaseIssue = getSupabaseEnvIssue();
  if (supabaseIssue) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="p-8">
          <div className="text-sm font-medium">Supabase not configured</div>
          <div className="mt-1 text-sm text-muted-foreground">{supabaseIssue}</div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login?next=/orders");

  const { data } = await supabase
    .from("orders")
    .select("id,status,total,currency,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const orders =
    (data as Array<{
      id: string;
      status: string;
      total: number;
      currency: string;
      created_at: string;
    }> | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
          <div className="text-sm text-muted-foreground">
            Review your recent purchases and confirmations.
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-2xl">
          <Link href="/account">Account</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="mt-8 rounded-3xl border-border/60 bg-card/40 p-10 backdrop-blur">
          <div className="text-sm font-semibold tracking-tight">No orders yet.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            When you place an order, it will show up here.
          </div>
          <div className="mt-6">
            <Button asChild className="rounded-2xl">
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur transition-colors hover:bg-card/55"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight">
                    Order {order.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className="text-sm text-muted-foreground">{order.status}</div>
                  <div className="text-sm font-semibold">
                    {formatMoney(order.total, order.currency)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
