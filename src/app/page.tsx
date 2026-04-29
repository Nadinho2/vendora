import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCategories, getProducts } from "@/lib/store/products";
import Link from "next/link";
import { Home as HomeIcon, Sparkles, Smartphone, Shirt } from "lucide-react";

function toNumber(v: string | string[] | undefined) {
  const raw = Array.isArray(v) ? v[0] : v;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const q = typeof sp.q === "string" ? sp.q : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const minPrice = toNumber(sp.minPrice);
  const maxPrice = toNumber(sp.maxPrice);
  const minRating = toNumber(sp.minRating);

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      q,
      category: category || undefined,
      minPrice,
      maxPrice,
      minRating,
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_30%_0%,rgba(34,197,94,0.24),rgba(34,197,94,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_90%_10%,rgba(34,197,94,0.16),rgba(34,197,94,0))]" />
        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Premium picks. Minimalist UI. Fast checkout.
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              BUY BETTER WITH VENDORA
            </h1>
            <p className="text-pretty text-base text-muted-foreground sm:text-lg">
              A modern e-commerce aggregator for curated imports, affiliate deals, and
              clean product discovery.
            </p>
          </div>

          <form action="/" className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search fashion, gadgets, home essentials…"
                className="h-12 rounded-2xl bg-background/60 pr-4"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <Button className="h-12 rounded-2xl px-6" type="submit">
                Search
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-2xl px-6">
                <a href="#shop">Shop Now</a>
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold tracking-tight">Featured categories</div>
            <div className="text-sm text-muted-foreground">
              Start with a curated lane.
            </div>
          </div>
          <div className="hidden text-sm text-muted-foreground sm:block">
            {categories.length ? `${categories.length} categories` : "Curated"}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/?category=Fashion" className="group">
            <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-card/40 p-5 backdrop-blur transition-colors hover:border-primary/40">
              <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_30%_0%,rgba(34,197,94,0.18),rgba(34,197,94,0))]" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/50">
                  <Shirt className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight">Fashion</div>
                  <div className="text-sm text-muted-foreground">Minimal fits</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/?category=Electronics" className="group">
            <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-card/40 p-5 backdrop-blur transition-colors hover:border-primary/40">
              <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_30%_0%,rgba(34,197,94,0.18),rgba(34,197,94,0))]" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/50">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight">Electronics</div>
                  <div className="text-sm text-muted-foreground">Daily tech</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/?category=Beauty" className="group">
            <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-card/40 p-5 backdrop-blur transition-colors hover:border-primary/40">
              <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_30%_0%,rgba(34,197,94,0.18),rgba(34,197,94,0))]" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/50">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight">Beauty</div>
                  <div className="text-sm text-muted-foreground">Glow picks</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/?category=Home" className="group">
            <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-card/40 p-5 backdrop-blur transition-colors hover:border-primary/40">
              <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_30%_0%,rgba(34,197,94,0.18),rgba(34,197,94,0))]" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/50">
                  <HomeIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight">Home</div>
                  <div className="text-sm text-muted-foreground">Elevate space</div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <section id="shop" className="mt-12 grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur lg:sticky lg:top-24">
          <div className="text-sm font-semibold tracking-tight">Filters</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Refine by category, price, and rating.
          </div>
          <form action="/" className="mt-6 space-y-5">
            <div className="space-y-2">
              <div className="text-sm font-medium">Category</div>
              <select
                name="category"
                defaultValue={category}
                className="h-11 w-full rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Price</div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="minPrice"
                  inputMode="decimal"
                  placeholder="Min"
                  className="h-11 rounded-2xl bg-background/60"
                  defaultValue={minPrice ?? ""}
                />
                <Input
                  name="maxPrice"
                  inputMode="decimal"
                  placeholder="Max"
                  className="h-11 rounded-2xl bg-background/60"
                  defaultValue={maxPrice ?? ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Rating</div>
              <select
                name="minRating"
                defaultValue={minRating ?? ""}
                className="h-11 w-full rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Any</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
              </select>
            </div>

            <input type="hidden" name="q" value={q} />

            <div className="flex items-center gap-2">
              <Button type="submit" className="h-11 flex-1 rounded-2xl">
                Apply
              </Button>
              <Button type="submit" name="q" value="" variant="outline" className="h-11 rounded-2xl">
                Reset
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold tracking-tight">Products</div>
              <div className="text-sm text-muted-foreground">
                {products.length} result{products.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <Card className="rounded-3xl border-border/60 bg-card/40 p-10 backdrop-blur">
              <div className="text-sm font-medium">No products yet.</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Import products from the Admin dashboard to populate the storefront.
              </div>
              <div className="mt-6">
                <Button asChild className="rounded-2xl">
                  <a href="/admin/import">Go to Admin</a>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className={
                    i === 0
                      ? "sm:col-span-2"
                      : i === 5
                        ? "lg:col-span-2"
                        : ""
                  }
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
