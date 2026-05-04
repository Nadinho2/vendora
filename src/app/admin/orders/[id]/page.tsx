import Link from "next/link";
import { notFound } from "next/navigation";

import { updateOrderStatus } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function statusVariant(status: string) {
  if (status === "delivered") return "default";
  if (status === "approved") return "secondary";
  if (status === "sent") return "secondary";
  if (status === "confirmed") return "secondary";
  if (status === "paid") return "secondary";
  return "outline";
}

const statusOptions = ["pending", "confirmed", "approved", "sent", "delivered", "cancelled"] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  async function setStatus(formData: FormData) {
    "use server";
    const orderId = String(formData.get("orderId") ?? "");
    const status = String(formData.get("status") ?? "");
    await updateOrderStatus({ orderId, status });
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: orderRow } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  const order = orderRow as
    | {
        id: string;
        user_id: string;
        status: string;
        total: number;
        currency: string;
        shipping_address: unknown | null;
        payment_method: string | null;
        created_at: string;
      }
    | null;

  if (!order) notFound();

  const { data: itemsData } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const items =
    (itemsData as Array<{
      id: string;
      product_id: string;
      title: string;
      unit_price: number;
      quantity: number;
    }> | null) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-tight">
            Order {order.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/admin/orders">Back to orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold tracking-tight">Items</div>
            <div className="text-sm font-semibold">
              {formatMoney(order.total, order.currency)}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="mt-4 text-sm text-muted-foreground">No items found for this order.</div>
          ) : (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[120px] text-right">Unit</TableHead>
                    <TableHead className="w-[110px] text-right">Qty</TableHead>
                    <TableHead className="w-[140px] text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.title}</TableCell>
                      <TableCell className="text-right">{formatMoney(i.unit_price, order.currency)}</TableCell>
                      <TableCell className="text-right">{i.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatMoney(i.unit_price * i.quantity, order.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="text-sm font-semibold tracking-tight">Status</div>
            <div className="mt-2">
              <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
            </div>

            <form action={setStatus} className="mt-4 space-y-2">
              <input type="hidden" name="orderId" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="h-11 w-full rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button type="submit" className="h-11 w-full rounded-2xl">
                Update status
              </Button>
            </form>
          </Card>

          <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="text-sm font-semibold tracking-tight">Customer</div>
            <div className="mt-1 text-sm text-muted-foreground">{order.user_id}</div>
            {order.payment_method ? (
              <div className="mt-4">
                <div className="text-xs font-medium text-muted-foreground">Payment</div>
                <div className="mt-1 text-sm">{order.payment_method}</div>
              </div>
            ) : null}
          </Card>

          {order.shipping_address ? (
            <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
              <div className="text-sm font-semibold tracking-tight">Shipping address</div>
              <pre className="mt-3 max-h-72 overflow-auto rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs">
                {JSON.stringify(order.shipping_address, null, 2)}
              </pre>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
