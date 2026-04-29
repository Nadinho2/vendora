"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/store/products";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function Stars({ value }: { value: number }) {
  const stars = Math.max(0, Math.min(5, value));
  const full = Math.floor(stars);
  const half = stars - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            className={cn("h-3.5 w-3.5", filled ? "fill-primary text-primary" : "text-muted-foreground/50")}
          />
        );
      })}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] ?? null;
  const hasOriginal =
    typeof product.original_price === "number" &&
    product.original_price > product.price;
  const [open, setOpen] = useState(false);
  const safeImages = useMemo(() => (product.images ?? []).filter(Boolean), [product.images]);

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="group h-full overflow-hidden border-border/70 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
            <Link href={`/products/${product.id}`} className="absolute inset-0 z-10">
              <span className="sr-only">{product.title}</span>
            </Link>

            {image ? (
              <Image
                src={image}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
              {product.category ? (
                <Badge className="border border-border/60 bg-background/60 text-foreground backdrop-blur">
                  {product.category}
                </Badge>
              ) : null}
              {hasOriginal ? (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Sale
                </Badge>
              ) : null}
            </div>

            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="pointer-events-auto inline-flex h-10 items-center justify-center rounded-xl border border-border/60 bg-background/70 px-4 text-sm font-medium backdrop-blur transition-colors hover:bg-background"
                  >
                    Quick View
                  </button>
                </DialogTrigger>
                <DialogContent className="overflow-hidden">
                  <div className="grid gap-0 md:grid-cols-2">
                    <div className="relative aspect-square bg-muted/30 md:aspect-auto md:h-full">
                      {safeImages[0] ? (
                        <Image
                          src={safeImages[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-medium tracking-widest text-muted-foreground">
                        VENDORA
                      </div>
                      <div className="mt-2 text-balance text-xl font-semibold tracking-tight">
                        {product.title}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <div className="text-lg font-semibold">
                            {formatMoney(product.price)}
                          </div>
                          {hasOriginal ? (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatMoney(product.original_price as number)}
                            </div>
                          ) : null}
                        </div>
                        {typeof product.rating === "number" ? (
                          <Stars value={product.rating} />
                        ) : null}
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <AddToCartButton
                          productId={product.id}
                          className="h-11 w-full"
                        >
                          Add to cart
                        </AddToCartButton>
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
                        >
                          View details
                        </Link>
                      </div>
                      {product.description ? (
                        <div className="mt-5 line-clamp-4 text-sm text-muted-foreground">
                          {product.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <AddToCartButton
                productId={product.id}
                className="pointer-events-auto h-10 rounded-xl px-4"
              >
                Add
              </AddToCartButton>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 p-4">
          <Link href={`/products/${product.id}`} className="block">
            <CardTitle className="line-clamp-2 text-sm font-medium">
              {product.title}
            </CardTitle>
          </Link>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <div className="text-sm font-semibold">{formatMoney(product.price)}</div>
              {hasOriginal ? (
                <div className="text-xs text-muted-foreground line-through">
                  {formatMoney(product.original_price as number)}
                </div>
              ) : null}
            </div>
            {typeof product.rating === "number" ? (
              <Stars value={product.rating} />
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 sm:hidden">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-border/70 bg-background/50 px-3 text-sm font-medium backdrop-blur hover:bg-accent"
                >
                  Quick View
                </button>
              </DialogTrigger>
              <DialogContent className="overflow-hidden">
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="relative aspect-square bg-muted/30 md:aspect-auto md:h-full">
                    {safeImages[0] ? (
                      <Image
                        src={safeImages[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-medium tracking-widest text-muted-foreground">
                      VENDORA
                    </div>
                    <div className="mt-2 text-balance text-xl font-semibold tracking-tight">
                      {product.title}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <div className="text-lg font-semibold">
                          {formatMoney(product.price)}
                        </div>
                        {hasOriginal ? (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatMoney(product.original_price as number)}
                          </div>
                        ) : null}
                      </div>
                      {typeof product.rating === "number" ? (
                        <Stars value={product.rating} />
                      ) : null}
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <AddToCartButton productId={product.id} className="h-11 w-full">
                        Add to cart
                      </AddToCartButton>
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
                      >
                        View details
                      </Link>
                    </div>
                    {product.description ? (
                      <div className="mt-5 line-clamp-4 text-sm text-muted-foreground">
                        {product.description}
                      </div>
                    ) : null}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <AddToCartButton productId={product.id} className="h-10 rounded-2xl">
              Add
            </AddToCartButton>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3 px-4 pb-4 pt-0">
          <div className="text-xs text-muted-foreground">
            {product.category ? product.category : "Curated"}
          </div>
          <div className="text-xs text-muted-foreground">Premium picks</div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
