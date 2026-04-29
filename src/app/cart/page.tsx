import Link from "next/link";

import { CartItemRow } from "@/components/cart-item-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCartItems } from "@/lib/store/cart";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function CartPage() {
  const { items, userEmail } = await getCartItems();
  const total = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0,
  );

  if (!userEmail) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="rounded-3xl border-border/60 bg-card/40 p-10 backdrop-blur">
          <div className="text-sm font-semibold tracking-tight">Sign in to use your cart.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Your cart is stored securely with your account.
          </div>
          <div className="mt-6 flex gap-3">
            <Button asChild className="rounded-2xl">
              <Link href="/login?next=%2Fcart">Sign in</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_30%_0%,rgba(34,197,94,0.18),rgba(34,197,94,0))]" />
        <div className="relative px-6 py-10 sm:px-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
              <div className="text-sm text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"} in your bag
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 backdrop-blur">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-semibold tracking-tight">
                {formatMoney(total)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <Card className="mt-8 rounded-3xl border-border/60 bg-card/40 p-10 backdrop-blur">
          <div className="text-sm font-semibold tracking-tight">Your cart is empty.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Find something you love and add it to your cart.
          </div>
          <div className="mt-6">
            <Button asChild className="rounded-2xl">
              <Link href="/">Browse products</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
          <Card className="h-fit rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur lg:sticky lg:top-24">
            <div className="text-sm font-semibold tracking-tight">Checkout</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Subtotal</div>
                <div className="font-medium">{formatMoney(total)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Shipping</div>
                <div className="font-medium">Calculated later</div>
              </div>
              <div className="h-px bg-border/70" />
              <div className="flex items-center justify-between">
                <div className="font-semibold">Total</div>
                <div className="font-semibold">{formatMoney(total)}</div>
              </div>
            </div>
            <Button asChild className="mt-5 h-12 w-full rounded-2xl">
              <Link href="/checkout">Continue to checkout</Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 h-12 w-full rounded-2xl">
              <Link href="/">Keep shopping</Link>
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
