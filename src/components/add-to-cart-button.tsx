"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { addToCart } from "@/app/actions/cart";
import { Button, type ButtonProps } from "@/components/ui/button";

export function AddToCartButton({
  productId,
  quantity = 1,
  ...buttonProps
}: { productId: string; quantity?: number } & ButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      {...buttonProps}
      disabled={pending || buttonProps.disabled}
      onClick={() =>
        startTransition(async () => {
          await addToCart({ productId, quantity });
          toast.success("Added to cart");
        })
      }
    >
      {pending ? "Adding…" : buttonProps.children ?? "Add to cart"}
    </Button>
  );
}

