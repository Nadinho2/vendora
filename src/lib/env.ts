import { z } from "zod";

function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, schema);
}

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(z.string().url()).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(z.string().min(1)).optional(),
  SUPABASE_URL: emptyToUndefined(z.string().url()).optional(),
  SUPABASE_ANON_KEY: emptyToUndefined(z.string().min(1)).optional(),

  RESEND_API_KEY: emptyToUndefined(z.string().min(1)).optional(),
  RESEND_FROM: emptyToUndefined(z.string().min(1)).optional(),
  NEXT_PUBLIC_SITE_URL: emptyToUndefined(z.string().url()).optional(),

  ALIEXPRESS_APP_KEY: emptyToUndefined(z.string().min(1)).optional(),
  ALIEXPRESS_APP_SECRET: emptyToUndefined(z.string().min(1)).optional(),
  ALIEXPRESS_TRACKING_ID: emptyToUndefined(z.string().min(1)).optional(),
});

const raw = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  ALIEXPRESS_APP_KEY: process.env.ALIEXPRESS_APP_KEY,
  ALIEXPRESS_APP_SECRET: process.env.ALIEXPRESS_APP_SECRET,
  ALIEXPRESS_TRACKING_ID: process.env.ALIEXPRESS_TRACKING_ID,
} satisfies Record<keyof z.infer<typeof EnvSchema>, unknown>;

const parsed = EnvSchema.safeParse(raw);

function pick(name: keyof z.infer<typeof EnvSchema>) {
  return parsed.success ? parsed.data[name] : undefined;
}

export const env = {
  SUPABASE_URL: pick("NEXT_PUBLIC_SUPABASE_URL") ?? pick("SUPABASE_URL") ?? "",
  SUPABASE_ANON_KEY:
    pick("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? pick("SUPABASE_ANON_KEY") ?? "",
  RESEND_API_KEY: pick("RESEND_API_KEY"),
  RESEND_FROM: pick("RESEND_FROM"),
  SITE_URL: pick("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  ALIEXPRESS_APP_KEY: pick("ALIEXPRESS_APP_KEY"),
  ALIEXPRESS_APP_SECRET: pick("ALIEXPRESS_APP_SECRET"),
  ALIEXPRESS_TRACKING_ID: pick("ALIEXPRESS_TRACKING_ID"),
} as const;

function isProbablyJwt(value: string) {
  return value.startsWith("eyJ");
}

function isSupabasePublishableKey(value: string) {
  return value.startsWith("sb_publishable_");
}

export function getSupabaseEnvIssue(): string | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }

  if (isSupabasePublishableKey(env.SUPABASE_ANON_KEY)) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY looks like a Supabase publishable key. Use the 'anon public' API key (JWT starting with 'eyJ') from Supabase Dashboard → Project Settings → API.";
  }

  if (!isProbablyJwt(env.SUPABASE_ANON_KEY)) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY does not look like a Supabase anon key. Use the 'anon public' API key (JWT starting with 'eyJ') from Supabase Dashboard → Project Settings → API.";
  }

  return null;
}
