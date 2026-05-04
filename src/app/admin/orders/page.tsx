import Link from "next/link";

import { getAllOrders, updateOrderStatus } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default async function AdminOrdersPage() {
  async function setStatus(formData: FormData) {
    "use server";
    const orderId = String(formData.get("orderId") ?? "");
    const status = String(formData.get("status") ?? "");
    await updateOrderStatus({ orderId, status });
  }

  const res = await getAllOrders({});
  if (!res.success) {
    return (
      <Card className="rounded-3xl border-border/60 bg-card/40 p-8 backdrop-blur">
        <div className="text-sm font-semibold tracking-tight">Orders unavailable</div>
        <div className="mt-1 text-sm text-muted-foreground">{res.error}</div>
      </Card>
    );
  }

  const orders = res.data.orders;

  return (
    <div className="space-y-5">
      <Card className="rounded-3xl border-border/60 bg-card/40 p-5 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold tracking-tight">Orders</div>
            <div className="text-sm text-muted-foreground">{orders.length} total</div>
          </div>
          <Button asChild className="h-11 rounded-2xl">
            <Link href="/admin/orders/new">Add order</Link>
          </Button>
        </div>
      </Card>

      {orders.length === 0 ? (
        <Card className="rounded-3xl border-border/60 bg-card/40 p-10 backdrop-blur">
          <div className="text-sm font-semibold tracking-tight">No orders yet.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Orders will appear here after customers checkout, or when you add one manually.
          </div>
        </Card>
      ) : (
        <Card className="rounded-3xl border-border/60 bg-card/40 p-3 backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Order</TableHead>
                <TableHead className="w-[160px]">Status</TableHead>
                <TableHead className="w-[160px]">Total</TableHead>
                <TableHead className="w-[220px]">Created</TableHead>
                <TableHead className="w-[260px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="hover:underline"
                    >
                      {o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatMoney(o.total, o.currency)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" className="h-9 rounded-2xl">
                        <Link href={`/admin/orders/${o.id}`}>View</Link>
                      </Button>
                      <form action={setStatus} className="flex items-center gap-2">
                        <input type="hidden" name="orderId" value={o.id} />
                        <select
                          name="status"
                          defaultValue={o.status}
                          className="h-9 rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" variant="secondary" className="h-9 rounded-2xl">
                          Update
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
