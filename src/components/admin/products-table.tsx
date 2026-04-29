"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteProduct } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product } from "@/lib/store/products";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function AdminProductsTable({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const p of products) if (p.category) s.add(p.category);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQ =
        !query ||
        p.title.toLowerCase().includes(query) ||
        (p.category ?? "").toLowerCase().includes(query);
      const matchesCategory = !category || p.category === category;
      return matchesQ && matchesCategory;
    });
  }, [products, q, category]);

  return (
    <div className="space-y-5">
      <Card className="rounded-3xl border-border/60 bg-card/40 p-5 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold tracking-tight">Products</div>
            <div className="text-sm text-muted-foreground">
              {filtered.length} shown · {products.length} total
            </div>
          </div>
          <Button asChild className="h-11 rounded-2xl">
            <Link href="/admin/products/new">Add New</Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or category…"
              className="h-11 rounded-2xl bg-background/60 pl-9"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-2xl border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="hidden sm:block">
        <Card className="rounded-3xl border-border/60 bg-card/40 p-3 backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[76px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[120px]">Price</TableHead>
                <TableHead className="w-[140px]">Original</TableHead>
                <TableHead className="w-[140px]">Category</TableHead>
                <TableHead className="w-[90px]">Rating</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const img = p.images?.[0] ?? "";
                const hasOriginal =
                  typeof p.original_price === "number" && p.original_price > p.price;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="py-2">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                        {img ? (
                          <Image src={img} alt={p.title} fill className="object-cover" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[520px]">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${p.id}`}
                          className="line-clamp-1 text-sm font-medium tracking-tight hover:underline"
                        >
                          {p.title}
                        </Link>
                        {hasOriginal ? (
                          <Badge className="bg-primary text-primary-foreground">Sale</Badge>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {p.id}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {formatMoney(p.price)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {hasOriginal ? (
                        <span className="line-through">
                          {formatMoney(p.original_price as number)}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.category ? (
                        <Badge variant="secondary" className="bg-background/40">
                          {p.category}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {typeof p.rating === "number" ? (
                        <span className="text-sm font-medium">
                          {p.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ActionsMenu id={p.id} title={p.title} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="space-y-3 sm:hidden">
        {filtered.map((p, i) => {
          const img = p.images?.[0] ?? "";
          const hasOriginal =
            typeof p.original_price === "number" && p.original_price > p.price;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.18) }}
            >
              <Card className="rounded-3xl border-border/60 bg-card/40 p-4 backdrop-blur">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                    {img ? <Image src={img} alt={p.title} fill className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-semibold tracking-tight">
                          {p.title}
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <div className="text-sm font-semibold">{formatMoney(p.price)}</div>
                          {hasOriginal ? (
                            <div className="text-xs text-muted-foreground line-through">
                              {formatMoney(p.original_price as number)}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {p.category ? (
                            <Badge variant="secondary" className="bg-background/40">
                              {p.category}
                            </Badge>
                          ) : null}
                          {typeof p.rating === "number" ? (
                            <div className="text-xs text-muted-foreground">
                              {p.rating.toFixed(1)}★
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <ActionsMenu id={p.id} title={p.title} />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ActionsMenu({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${encodeURIComponent(id)}`}>Edit</Link>
        </DropdownMenuItem>
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              className={cn("text-destructive", "focus:text-destructive")}
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <div className="p-6">
              <div className="text-sm font-semibold tracking-tight">Delete product?</div>
              <div className="mt-2 text-sm text-muted-foreground">
                This action permanently deletes the product.
              </div>
              <div className="mt-5 rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                {title}
              </div>
              <div className="mt-6 flex gap-2">
                <DialogClose asChild>
                  <Button
                    className="flex-1 rounded-2xl"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const res = await deleteProduct(id);
                        if (!res.success) {
                          toast.error(res.error);
                          return;
                        }
                        toast.success("Deleted product");
                        router.refresh();
                      });
                    }}
                  >
                    {pending ? "Deleting…" : "Delete"}
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button className="flex-1 rounded-2xl" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
