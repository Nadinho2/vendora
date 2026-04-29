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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16" />
      }
    >
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"signup" | "google" | null>(null);

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
          <CardTitle>Create account</CardTitle>
          <CardDescription>Sign up with email/password or continue with Google.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Full name</div>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

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

          <div className="space-y-2">
            <div className="text-sm font-medium">Password</div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </div>

          <Button
            className="w-full"
            disabled={
              loading !== null ||
              fullName.trim().length === 0 ||
              email.trim().length === 0 ||
              password.length < 8
            }
            onClick={async () => {
              const supabase = getClient();
              if (!supabase) return;
              setLoading("signup");
              const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: { full_name: fullName },
                  emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                },
              });
              setLoading(null);
              if (error) {
                toast.error(error.message);
                return;
              }
              if (data.session) {
                toast.success("Account created.");
                router.replace(nextPath);
                router.refresh();
                return;
              }
              toast.success("Account created. Check your email to confirm, then sign in.");
            }}
          >
            {loading === "signup" ? "Creating…" : "Create account"}
          </Button>

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
            Already have an account?{" "}
            <a
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              className="text-foreground underline underline-offset-4"
            >
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
