import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-[420px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

