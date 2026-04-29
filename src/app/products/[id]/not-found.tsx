import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="p-8">
        <div className="text-sm font-medium">Product not found.</div>
        <div className="mt-1 text-sm text-muted-foreground">
          The product may have been removed or is not available.
        </div>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

