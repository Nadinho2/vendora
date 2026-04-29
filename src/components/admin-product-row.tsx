"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteProduct } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/store/products";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function AdminProductRow({ product }: { product: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
      <Link
        href={`/products/${product.id}`}
        className="relative h-12 w-12 overflow-hidden rounded-xl border border-border bg-muted/30"
      >
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-sm font-medium">{product.title}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div>{formatMoney(product.price)}</div>
          {product.category ? <div>· {product.category}</div> : null}
          {typeof product.rating === "number" ? <div>· {product.rating.toFixed(1)}★</div> : null}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Delete product"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await deleteProduct(product.id);
            if (!res.success) {
              toast.error(res.error);
              return;
            }
            toast.success("Deleted product");
            router.refresh();
          })
        }
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
