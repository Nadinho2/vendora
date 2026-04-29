"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [active, setActive] = useState(0);
  const src = safeImages[active] ?? safeImages[0] ?? null;

  return (
    <div className="space-y-3">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-border/60 bg-muted/30 text-left"
          >
            {src ? (
              <Image
                src={src}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Click to zoom
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative aspect-square bg-muted/30 md:aspect-auto md:h-full">
              {src ? <Image src={src} alt={title} fill className="object-cover" /> : null}
            </div>
            <div className="p-6">
              <div className="text-sm font-semibold tracking-tight">Images</div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {safeImages.slice(0, 12).map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted/30",
                      i === active && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                    )}
                  >
                    <Image src={img} alt={title} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {safeImages.slice(0, 10).map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted/30",
                i === active && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
            >
              <Image src={img} alt={title} fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
