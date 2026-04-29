"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VariantGroup = { name: string; values: string[] };

function extractVariantGroups(variants: unknown): VariantGroup[] {
  if (!variants || typeof variants !== "object") return [];
  const obj = variants as Record<string, unknown>;
  const groups = obj.groups;
  if (!Array.isArray(groups)) return [];
  const out: VariantGroup[] = [];
  for (const g of groups) {
    if (!g || typeof g !== "object") continue;
    const gg = g as Record<string, unknown>;
    if (typeof gg.name !== "string" || !Array.isArray(gg.values)) continue;
    const values = gg.values.filter((v): v is string => typeof v === "string");
    if (values.length) out.push({ name: gg.name, values });
  }
  return out.slice(0, 2);
}

export function ProductPurchasePanel({
  productId,
  buyNowHref,
  variants,
}: {
  productId: string;
  buyNowHref: string;
  variants: unknown;
}) {
  const groups = useMemo(() => extractVariantGroups(variants), [variants]);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const disabled = groups.some((g) => !selected[g.name]);

  return (
    <Card className="rounded-3xl border-border/60 bg-card/40 p-5 backdrop-blur">
      {groups.length ? (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.name} className="space-y-2">
              <div className="text-sm font-medium">{g.name}</div>
              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
                {g.values.slice(0, 10).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelected((s) => ({ ...s, [g.name]: v }))}
                    className={cn(
                      "h-10 shrink-0 rounded-2xl border border-border/70 bg-background/60 px-3 text-sm backdrop-blur transition-colors hover:bg-accent sm:shrink",
                      selected[g.name] === v && "border-primary/50 ring-2 ring-ring ring-offset-2 ring-offset-background",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-tight">Variants</div>
          <div className="text-sm text-muted-foreground">
            Variants will appear here when available.
          </div>
        </div>
      )}

      <div className={cn("mt-5", groups.length ? "" : "pt-4")}>
        <div className="text-sm font-medium">Quantity</div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-2xl"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex h-11 min-w-16 items-center justify-center rounded-2xl border border-border/70 bg-background/60 text-sm font-semibold backdrop-blur">
            {quantity}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-2xl"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <AddToCartButton
          productId={productId}
          quantity={quantity}
          className="h-12 rounded-2xl"
          disabled={disabled}
        >
          Add to Cart
        </AddToCartButton>
        <Button asChild variant="outline" className="h-12 rounded-2xl">
          <Link href={buyNowHref}>Buy Now</Link>
        </Button>
      </div>

      {disabled ? (
        <div className="mt-3 text-xs text-muted-foreground">
          Select options to continue.
        </div>
      ) : null}
    </Card>
  );
}
