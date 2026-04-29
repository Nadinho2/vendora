import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminImportPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <div className="text-sm font-semibold">AliExpress import</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Search AliExpress by keyword/category, then import products into Supabase.
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Keyword</div>
            <Input placeholder="e.g. wireless earbuds" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Category</div>
            <Input placeholder="e.g. electronics" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button disabled>Search AliExpress</Button>
          <Button disabled variant="outline">
            Bulk import
          </Button>
          <Button disabled variant="outline">
            Daily sync
          </Button>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-background p-4">
          <div className="text-sm font-medium">Next step</div>
          <div className="mt-1 text-sm text-muted-foreground">
            The UI is ready. Once you confirm, I’ll add the official AliExpress Open
            Platform / Affiliate API integration (search, import, bulk import, and
            daily sync).
          </div>
        </div>
      </Card>

      <Card className="h-fit p-6">
        <div className="text-sm font-semibold">Requirements</div>
        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
          <div>ALIEXPRESS_APP_KEY</div>
          <div>ALIEXPRESS_APP_SECRET</div>
          <div>ALIEXPRESS_TRACKING_ID</div>
          <div>SUPABASE_URL / SUPABASE_ANON_KEY</div>
        </div>
      </Card>
    </div>
  );
}

