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

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabaseIssue = getSupabaseEnvIssue();
  if (supabaseIssue) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="p-8">
          <div className="text-sm font-medium">Supabase not configured</div>
          <div className="mt-1 text-sm text-muted-foreground">{supabaseIssue}</div>
          <div className="mt-6">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!order) redirect("/");

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="p-8">
        <div className="text-sm font-medium">Order confirmed</div>
        <div className="mt-1 text-sm text-muted-foreground">
          We saved your order and sent a confirmation email (if email is configured).
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-semibold">Order ID</div>
            <div className="rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs">
              {order.id}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-sm font-semibold">
                {formatMoney(order.total, order.currency)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">Items</div>
            <div className="space-y-2">
              {(items ?? []).map((i) => (
                <div
                  key={i.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border p-3"
                >
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-sm font-medium">{i.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Qty {i.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatMoney(i.unit_price * i.quantity, order.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cart">View cart</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
