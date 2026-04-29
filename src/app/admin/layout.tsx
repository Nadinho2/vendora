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

  if (!userId) redirect("/login?next=/admin/products");

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
  const isAdmin = profileValue?.role === "admin" || profileValue?.is_admin === true;

  if (!isAdmin) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="p-8">
          <div className="text-sm font-medium">Access denied.</div>
          <div className="mt-1 text-sm text-muted-foreground">
            You need an admin account to view this dashboard.
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
            Import and manage products.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/import">Import</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Products</Link>
          </Button>
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
