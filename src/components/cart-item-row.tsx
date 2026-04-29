"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { removeCartItem, updateCartItemQuantity } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import type { CartItemWithProduct } from "@/lib/store/cart";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function CartItemRow({ item }: { item: CartItemWithProduct }) {
  const [pending, startTransition] = useTransition();
  const product = item.product;

  if (!product) return null;

  return (
    <div className="rounded-3xl border border-border/60 bg-card/40 p-4 backdrop-blur">
      <div className="flex gap-4">
        <Link
          href={`/products/${product.id}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/30"
        >
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : null}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/products/${product.id}`}
                className="line-clamp-2 text-sm font-medium tracking-tight hover:underline"
              >
                {product.title}
              </Link>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatMoney(product.price)}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove"
              disabled={pending}
              className="shrink-0"
              onClick={() =>
                startTransition(async () => {
                  await removeCartItem({ cartItemId: item.id });
                  toast.success("Removed from cart");
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-2xl bg-background/50"
                disabled={pending || item.quantity <= 1}
                onClick={() =>
                  startTransition(async () => {
                    await updateCartItemQuantity({
                      cartItemId: item.id,
                      quantity: Math.max(1, item.quantity - 1),
                    });
                    toast.success("Updated cart");
                  })
                }
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex h-10 min-w-14 items-center justify-center rounded-2xl border border-border/70 bg-background/50 text-sm font-semibold">
                {item.quantity}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-2xl bg-background/50"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await updateCartItemQuantity({
                      cartItemId: item.id,
                      quantity: item.quantity + 1,
                    });
                    toast.success("Updated cart");
                  })
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-right text-sm font-semibold">
              {formatMoney(product.price * item.quantity)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
