import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseEnvIssue } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseIssue = getSupabaseEnvIssue();
  if (supabaseIssue) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="p-8">
          <div className="text-sm font-medium">Supabase not configured</div>
          <div className="mt-1 text-sm text-muted-foreground">{supabaseIssue}</div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) redirect("/login?next=/admin");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin,role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="p-8">
          <div className="text-sm font-medium">Admin access check failed.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {profileError.message}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account">Account</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const profileValue = profile as { is_admin?: boolean | null; role?: string | null } | null;
  const role = (profileValue?.role ?? "").toLowerCase();
  const isAdmin = role === "admin" || profileValue?.is_admin === true;

  if (!isAdmin) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="p-8">
          <div className="text-sm font-medium">Access denied.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            You need an admin account to view this dashboard.
          </div>
          <div className="mt-4 rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
            <div>Signed in as: {data.user?.email ?? userId}</div>
            <div className="mt-1">
              Profile admin flags: role={profileValue?.role ?? "null"}, is_admin=
              {String(profileValue?.is_admin ?? null)}
            </div>
          </div>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-tight">Admin</div>
          <div className="text-sm text-muted-foreground">
            Manage orders and products.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/orders">Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/import">Import</Link>
          </Button>
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
