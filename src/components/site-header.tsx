"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, Menu, Search, ShoppingBag, User } from "lucide-react";
import { toast } from "sonner";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getSupabaseEnvIssue } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const search = searchParams.toString();
  const currentPath = `${pathname}${search ? `?${search}` : ""}`;
  const loginHref = `/login?next=${encodeURIComponent(currentPath)}`;
  const signupHref = `/signup?next=${encodeURIComponent(currentPath)}`;

  useEffect(() => {
    const issue = getSupabaseEnvIssue();
    if (issue) return;

    const supabase = createSupabaseBrowserClient();

    let cancelled = false;

    void supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) return;
      if (error) return;
      setEmail(data.user?.email ?? null);
      const userId = data.user?.id;
      if (userId) {
        void supabase
          .from("profiles")
          .select("is_admin,role")
          .eq("id", userId)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (cancelled) return;
            const profileValue = profile as
              | { is_admin?: boolean | null; role?: string | null }
              | null;
            const isAdminValue = profileValue?.role === "admin" || profileValue?.is_admin === true;
            setIsAdmin(isAdminValue);
          });
      } else {
        setIsAdmin(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setEmail(session?.user?.email ?? null);
      if (!session?.user?.id) setIsAdmin(false);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const issue = getSupabaseEnvIssue();
    if (issue) {
      toast.error(issue);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed out.");
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card/60 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(34,197,94,0.22),rgba(34,197,94,0))]" />
              <span className="relative text-sm font-semibold tracking-tight">V</span>
            </div>
            <div className="leading-none">
              <div className="text-sm font-semibold tracking-tight">Vendora</div>
              <div className="text-xs text-muted-foreground">
                BUY BETTER WITH VENDORA
              </div>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <Link href="/?category=Fashion" className="hover:text-foreground">
              Fashion
            </Link>
            <Link href="/?category=Electronics" className="hover:text-foreground">
              Electronics
            </Link>
            <Link href="/?category=Beauty" className="hover:text-foreground">
              Beauty
            </Link>
            <Link href="/?category=Home" className="hover:text-foreground">
              Home
            </Link>
          </nav>

          <form action="/" className="ml-auto hidden w-full max-w-xl lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search products…"
                className="h-11 pl-9 pr-24 rounded-2xl bg-card/40 backdrop-blur"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1.5 h-8 rounded-xl px-4"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="h-4 w-4" />
            </Button>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cart"
                className="relative"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-sm" />
              </Button>
            </Link>

            {email ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{email}</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/products">Admin</Link>
                      </DropdownMenuItem>
                    </>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      void handleSignOut();
                    }}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Sign in">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={loginHref}>Sign in</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={signupHref}>Create account</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <ModeToggle />
          </div>
        </div>

        <div className="pb-3 lg:hidden">
          <form action="/" className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search products…"
                className="h-11 w-full rounded-2xl bg-card/40 pl-9 pr-3 backdrop-blur"
                autoComplete="off"
              />
            </div>
          </form>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/?category=Fashion"
              className="shrink-0 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
            >
              Fashion
            </Link>
            <Link
              href="/?category=Electronics"
              className="shrink-0 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
            >
              Electronics
            </Link>
            <Link
              href="/?category=Beauty"
              className="shrink-0 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
            >
              Beauty
            </Link>
            <Link
              href="/?category=Home"
              className="shrink-0 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
