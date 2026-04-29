"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { checkout } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";

export function CheckoutForm({ productId }: { productId?: string }) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"affiliate" | "order">("affiliate");

  const canAffiliate = useMemo(() => Boolean(productId), [productId]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="text-sm font-semibold">Checkout mode</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="text-sm font-medium">Affiliate redirect</div>
              <div className="text-xs text-muted-foreground">
                Opens the retailer link.
              </div>
            </div>
            <input
              type="radio"
              name="mode"
              value="affiliate"
              checked={mode === "affiliate"}
              disabled={!canAffiliate}
              onChange={() => setMode("affiliate")}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="text-sm font-medium">Save order</div>
              <div className="text-xs text-muted-foreground">
                Stores in Supabase and emails you.
              </div>
            </div>
            <input
              type="radio"
              name="mode"
              value="order"
              checked={mode === "order"}
              onChange={() => setMode("order")}
            />
          </label>
        </div>
        {!canAffiliate ? (
          <div className="text-xs text-muted-foreground">
            Affiliate redirect is only available for Buy Now single-product checkout.
          </div>
        ) : null}
      </div>

      <Button
        className="h-11 w-full"
        disabled={pending || (!canAffiliate && mode === "affiliate")}
        onClick={() =>
          startTransition(async () => {
            toast.loading("Processing checkout…", { id: "checkout" });
            await checkout({ productId, mode });
          })
        }
      >
        {pending ? "Processing…" : "Complete checkout"}
      </Button>
    </div>
  );
}

