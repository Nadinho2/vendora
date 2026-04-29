import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProductById } from "@/lib/store/products";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product" };

  const images = (product.images ?? []).slice(0, 1);

  return {
    title: product.title,
    description: product.description ?? "BUY BETTER WITH VENDORA",
    openGraph: {
      title: product.title,
      description: product.description ?? undefined,
      images: images.length ? images : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const hasOriginal =
    typeof product.original_price === "number" &&
    product.original_price > product.price;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Product</span>
        </div>
        <Button asChild variant="outline" className="rounded-2xl">
          <Link href="/cart">Cart</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <ProductGallery images={product.images ?? []} title={product.title} />

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              {product.category ? (
                <Badge className="border border-border/60 bg-background/60 text-foreground backdrop-blur">
                  {product.category}
                </Badge>
              ) : null}
              {typeof product.rating === "number" ? (
                <Badge variant="outline" className="border-border/60 bg-background/30">
                  {product.rating.toFixed(1)}★ rating
                </Badge>
              ) : null}
              {hasOriginal ? (
                <Badge className="bg-primary text-primary-foreground">Sale</Badge>
              ) : null}
            </div>

            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
              {product.title}
            </h1>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-semibold tracking-tight">
                  {formatMoney(product.price)}
                </div>
                {hasOriginal ? (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatMoney(product.original_price as number)}
                  </div>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">
                Secure checkout UI
              </div>
            </div>

            {product.description ? (
              <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </div>
            ) : null}
          </Card>

          <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="text-sm font-semibold tracking-tight">Shipping estimate</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {(product.shipping_info && typeof product.shipping_info === "object"
                ? "Estimated delivery: 7–15 business days."
                : "Estimated delivery: 7–15 business days.") as string}
            </div>
          </Card>

          <ProductPurchasePanel
            productId={product.id}
            buyNowHref={`/checkout?productId=${encodeURIComponent(product.id)}`}
            variants={product.variants}
          />
        </div>
      </div>
    </div>
  );
}
