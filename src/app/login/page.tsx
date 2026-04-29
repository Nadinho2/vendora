"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseEnvIssue } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function safeNextPath(value: string | null) {
  if (!value) return "/account";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  if (value.includes("://")) return "/";
  if (value.includes("\\")) return "/";
  return value;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16" />
      }
    >
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"magic" | "google" | "password" | null>(
    null,
  );

  function getClient(input?: { silent?: boolean }) {
    const issue = getSupabaseEnvIssue();
    if (issue) {
      if (!input?.silent) toast.error(issue);
      return null;
    }
    return createSupabaseBrowserClient();
  }

  useEffect(() => {
    const supabase = getClient({ silent: true });
    if (!supabase) return;

    let cancelled = false;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (cancelled) return;
      if (error) return;
      if (data.session) {
        router.replace(nextPath);
        router.refresh();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Get a magic link or continue with Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Email</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
            />
          </div>
          <Button
            className="w-full"
            disabled={loading !== null || email.trim().length === 0}
            onClick={async () => {
              const supabase = getClient();
              if (!supabase) return;
              setLoading("magic");
              const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                  emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                },
              });
              setLoading(null);
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success("Check your email for a magic link.");
            }}
          >
            {loading === "magic" ? "Sending…" : "Send magic link"}
          </Button>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              PASSWORD SIGN-IN
            </div>
            <div className="mt-3 grid gap-3">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                autoComplete="current-password"
              />
              <Button
                variant="secondary"
                className="w-full"
                disabled={loading !== null || email.trim().length === 0 || password.length === 0}
                onClick={async () => {
                  const supabase = getClient();
                  if (!supabase) return;
                  setLoading("password");
                  const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                  });
                  setLoading(null);
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  toast.success("Signed in.");
                  router.replace(nextPath);
                  router.refresh();
                }}
              >
                Sign in with password
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="text-xs text-muted-foreground">OR</div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            className="w-full"
            variant="outline"
            disabled={loading !== null}
            onClick={async () => {
              const supabase = getClient();
              if (!supabase) return;
              setLoading("google");
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                },
              });
              setLoading(null);
              if (error) toast.error(error.message);
            }}
          >
            {loading === "google" ? "Redirecting…" : "Continue with Google"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <a
              href={`/signup?next=${encodeURIComponent(nextPath)}`}
              className="text-foreground underline underline-offset-4"
            >
              Create an account
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
