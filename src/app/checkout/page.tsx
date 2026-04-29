import Link from "next/link";

import { CheckoutForm } from "@/components/checkout-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCartItems } from "@/lib/store/cart";
import { getProductById } from "@/lib/store/products";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const productId = typeof sp.productId === "string" ? sp.productId : undefined;
  const nextPath = `/checkout${productId ? `?productId=${encodeURIComponent(productId)}` : ""}`;

  const { items: cartItems, userEmail } = await getCartItems();
  if (!userEmail) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="p-8">
          <div className="text-sm font-medium">Sign in to checkout.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Orders and carts are linked to your account.
          </div>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const buyNowProduct = productId ? await getProductById(productId) : null;

  const lineItems = buyNowProduct
    ? [
        {
          id: buyNowProduct.id,
          title: buyNowProduct.title,
          quantity: 1,
          unitPrice: buyNowProduct.price,
        },
      ]
    : cartItems
        .map((i) =>
          i.product
            ? {
                id: i.product.id,
                title: i.product.title,
                quantity: i.quantity,
                unitPrice: i.product.price,
              }
            : null,
        )
        .filter(Boolean) as Array<{ id: string; title: string; quantity: number; unitPrice: number }>;

  const total = lineItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <Card className="p-6">
          <div className="text-sm font-semibold">Order summary</div>
          <div className="mt-4 space-y-3">
            {lineItems.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Your cart is empty.
              </div>
            ) : (
              lineItems.map((i) => (
                <div key={i.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-sm font-medium">{i.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Qty {i.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatMoney(i.unitPrice * i.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 h-px bg-border" />
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Total</div>
            <div className="text-lg font-semibold">{formatMoney(total)}</div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline">
              <Link href={buyNowProduct ? `/products/${buyNowProduct.id}` : "/cart"}>
                Back
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
        </Card>

        <Card className="h-fit p-6">
          <div className="text-sm font-semibold">Checkout</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {buyNowProduct ? "Buy Now checkout" : "Cart checkout"}
          </div>
          <div className="mt-6">
            <CheckoutForm productId={buyNowProduct?.id} />
          </div>
        </Card>
      </div>
    </div>
  );
}
