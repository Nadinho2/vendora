"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { createProduct, updateProduct } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type AdminProductDraft = {
  title: string;
  price: string;
  original_price: string;
  rating: string;
  category: string;
  description: string;
  images: string[];
};

const emptyDraft: AdminProductDraft = {
  title: "",
  price: "",
  original_price: "",
  rating: "",
  category: "",
  description: "",
  images: [""],
};

export function ProductForm({
  title,
  initialValue,
  backHref,
  productId,
}: {
  title: string;
  initialValue?: Partial<AdminProductDraft>;
  backHref: string;
  productId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<AdminProductDraft>({
    ...emptyDraft,
    ...initialValue,
    images: initialValue?.images?.length ? initialValue.images : [""],
  });

  const validImages = useMemo(
    () => draft.images.map((s) => s.trim()).filter(Boolean),
    [draft.images],
  );

  function parseNumber(input: string) {
    const value = Number(input);
    return Number.isFinite(value) ? value : null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <div className="text-sm text-muted-foreground">
            Add product details and publish them to your storefront.
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href={backHref}>Back</Link>
          </Button>
          <Button
            className="rounded-2xl"
            disabled={pending}
            onClick={() => {
              const price = parseNumber(draft.price.trim());
              if (price === null || price < 0) {
                toast.error("Enter a valid price");
                return;
              }

              const originalPriceRaw = draft.original_price.trim();
              const originalPrice =
                originalPriceRaw.length > 0 ? parseNumber(originalPriceRaw) : null;
              if (originalPriceRaw.length > 0 && (originalPrice === null || originalPrice < 0)) {
                toast.error("Enter a valid original price");
                return;
              }

              const ratingRaw = draft.rating.trim();
              const rating = ratingRaw.length > 0 ? parseNumber(ratingRaw) : null;
              if (ratingRaw.length > 0 && (rating === null || rating < 0 || rating > 5)) {
                toast.error("Rating must be between 0 and 5");
                return;
              }

              const payload = {
                title: draft.title.trim(),
                price,
                original_price: originalPriceRaw.length > 0 ? originalPrice : null,
                description: draft.description.trim().length ? draft.description.trim() : null,
                category: draft.category.trim().length ? draft.category.trim() : null,
                images: validImages,
                rating: ratingRaw.length > 0 ? rating : null,
              };

              startTransition(async () => {
                const res = productId
                  ? await updateProduct({ id: productId, productData: payload })
                  : await createProduct(payload);

                if (!res.success) {
                  toast.error(res.error);
                  return;
                }

                toast.success(productId ? "Product updated" : "Product created");
                const nextId = res.data.product.id;
                router.replace(`/admin/products/${encodeURIComponent(nextId)}`);
                router.refresh();
              });
            }}
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Product title"
                className="h-11 rounded-2xl bg-background/60"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  value={draft.price}
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                  placeholder="e.g. 29.99"
                  inputMode="decimal"
                  className="h-11 rounded-2xl bg-background/60"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Original Price</label>
                <Input
                  value={draft.original_price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, original_price: e.target.value }))
                  }
                  placeholder="e.g. 49.99"
                  inputMode="decimal"
                  className="h-11 rounded-2xl bg-background/60"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  placeholder="e.g. Electronics"
                  className="h-11 rounded-2xl bg-background/60"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Rating</label>
                <Input
                  value={draft.rating}
                  onChange={(e) => setDraft((d) => ({ ...d, rating: e.target.value }))}
                  placeholder="e.g. 4.7"
                  inputMode="decimal"
                  className="h-11 rounded-2xl bg-background/60"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Write a clean, concise description…"
                className="rounded-2xl bg-background/60"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold tracking-tight">Images</div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-2xl"
                onClick={() =>
                  setDraft((d) => ({ ...d, images: [...d.images, ""] }))
                }
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {draft.images.map((value, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={value}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        images: d.images.map((x, idx) =>
                          idx === i ? e.target.value : x,
                        ),
                      }))
                    }
                    placeholder="https://…"
                    className="h-11 rounded-2xl bg-background/60"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove image"
                    className="rounded-2xl"
                    disabled={draft.images.length <= 1}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        images: d.images.filter((_, idx) => idx !== i),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Use multiple image URLs for best results.
            </div>
          </Card>

          <Card className="rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="text-sm font-semibold tracking-tight">Preview</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {validImages.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {validImages.slice(0, 6).map((src) => (
                    <div
                      key={src}
                      className={cn(
                        "aspect-square rounded-2xl border border-border/60 bg-muted/30",
                      )}
                      style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  Add at least one image URL to see previews.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
