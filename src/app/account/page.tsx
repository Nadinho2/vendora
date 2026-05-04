import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseEnvIssue } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountPage() {
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
  const user = data.user;
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,avatar_url,role,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const profileValue = profile as
    | {
        full_name?: string | null;
        email?: string | null;
        avatar_url?: string | null;
        role?: string | null;
        is_admin?: boolean | null;
      }
    | null;

  const name = profileValue?.full_name ?? user.user_metadata?.full_name ?? null;
  const email = user.email ?? profileValue?.email ?? null;
  const role = (profileValue?.role ?? "").toLowerCase();
  const isAdmin = role === "admin" || profileValue?.is_admin === true;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-3xl border-border/60 bg-card/40 p-8 backdrop-blur">
          <div className="text-sm font-semibold tracking-tight">Account</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Manage your orders and profile.
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Name</div>
              <div className="mt-1 text-sm">{name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Email</div>
              <div className="mt-1 text-sm">{email ?? "—"}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button asChild className="rounded-2xl">
              <Link href="/orders">View orders</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/cart">Go to cart</Link>
            </Button>
          </div>
        </Card>

        <Card className="h-fit rounded-3xl border-border/60 bg-card/40 p-6 backdrop-blur">
          <div className="text-sm font-semibold tracking-tight">Quick actions</div>
          <div className="mt-4 space-y-2">
            {isAdmin ? (
              <Button asChild variant="outline" className="w-full rounded-2xl">
                <Link href="/admin">Admin</Link>
              </Button>
            ) : null}
            <form action={signOut}>
              <Button type="submit" variant="secondary" className="w-full rounded-2xl">
                Sign out
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
