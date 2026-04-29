"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";
import type { User } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import { sendOrderConfirmationEmail } from "@/lib/resend";
import { supabase } from "@/lib/supabase";
import type { Database, Json } from "@/lib/supabase/database.types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type ActivityLogInsert = Database["public"]["Tables"]["activity_logs"]["Insert"];

function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

function err(message: string): ActionResult<never> {
  return { success: false, error: message };
}

function normalizeEmbeddedRow<T>(value: unknown): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] as T | undefined) ?? null;
  return value as T;
}

async function getServerClient() {
  return supabase.serverAction();
}

async function requireUser() {
  const client = await getServerClient();
  const { data, error } = await client.auth.getUser();
  if (error) return err(error.message);
  const user = data.user;
  if (!user) return err("Unauthorized");
  return ok({ client, user });
}

async function requireAdmin() {
  const userRes = await requireUser();
  if (!userRes.success) return userRes;

  const { client, user } = userRes.data;
  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return err(error.message);
  if (!profile) return err("Profile not found");

  const profileRow = profile as ProfileRow;
  const isAdmin = profileRow.role === "admin" || profileRow.is_admin === true;

  if (!isAdmin) return err("Forbidden");
  return ok({ client, user, profile: profileRow });
}

async function logAdminActivity(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Json | null;
}) {
  const client = await getServerClient();
  const row: ActivityLogInsert = {
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? null,
  };
  await client.from("activity_logs").insert(row);
}

const EmailSchema = z.string().email();
const PasswordSchema = z.string().min(8);

const ProductDataSchema = z.object({
  title: z.string().min(1),
  price: z.number().nonnegative(),
  original_price: z.number().nonnegative().nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  images: z.array(z.string().url()).default([]),
  rating: z.number().min(0).max(5).nullable().optional(),
  affiliate_url: z.string().url().nullable().optional(),
  shipping_info: z.custom<Json>().nullable().optional(),
  variants: z.custom<Json>().nullable().optional(),
});

const ProductFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

const OrderCreateSchema = z.object({
  shipping_address: z.custom<Json>(),
  payment_method: z.string().optional(),
});

const OrderStatusSchema = z.enum(["pending", "paid", "cancelled"]);

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  full_name: string;
}): Promise<ActionResult<{ userId: string }>> {
  const parsed = z
    .object({ email: EmailSchema, password: PasswordSchema, full_name: z.string().min(1) })
    .safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const client = await getServerClient();
  const { data, error } = await client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error) return err(error.message);
  const userId = data.user?.id;
  if (!userId) return err("Signup failed");

  await client.from("profiles").upsert({
    id: userId,
    email: parsed.data.email,
    full_name: parsed.data.full_name,
  });

  revalidatePath("/");
  return ok({ userId });
}

export async function signInWithEmail(input: {
  email: string;
  password: string;
}): Promise<ActionResult<{ userId: string }>> {
  const parsed = z.object({ email: EmailSchema, password: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const client = await getServerClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return err(error.message);

  const userId = data.user?.id;
  if (!userId) return err("Signin failed");

  revalidatePath("/");
  return ok({ userId });
}

export async function signInWithOtp(input: {
  email: string;
}): Promise<ActionResult<{ sent: true }>> {
  const parsed = z.object({ email: EmailSchema }).safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const client = await getServerClient();
  const { error } = await client.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${env.SITE_URL}/auth/callback?next=/`,
    },
  });
  if (error) return err(error.message);
  return ok({ sent: true });
}

export async function signOut(): Promise<ActionResult<{ signedOut: true }>> {
  const client = await getServerClient();
  const { error } = await client.auth.signOut();
  if (error) return err(error.message);
  revalidatePath("/");
  return ok({ signedOut: true });
}

export async function getCurrentUser(): Promise<
  ActionResult<{ user: User; profile: ProfileRow | null }>
> {
  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return err(error.message);
  return ok({ user, profile: (profile as ProfileRow | null) ?? null });
}

export async function updateProfile(input: {
  full_name?: string;
  avatar_url?: string;
}): Promise<ActionResult<{ profile: ProfileRow }>> {
  const parsed = z
    .object({
      full_name: z.string().min(1).optional(),
      avatar_url: z.string().url().optional(),
    })
    .safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { data: profile, error } = await client
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      avatar_url: parsed.data.avatar_url,
    })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return err(error.message);
  revalidatePath("/");
  return ok({ profile: profile as ProfileRow });
}

export async function getAllProducts(input: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<ActionResult<{ products: ProductRow[] }>> {
  const parsed = ProductFiltersSchema.safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const client = await getServerClient();
  let query = client.from("products").select("*").order("created_at", { ascending: false });

  if (parsed.data.search) query = query.ilike("title", `%${parsed.data.search.trim()}%`);
  if (parsed.data.category) query = query.eq("category", parsed.data.category);
  if (typeof parsed.data.minPrice === "number") query = query.gte("price", parsed.data.minPrice);
  if (typeof parsed.data.maxPrice === "number") query = query.lte("price", parsed.data.maxPrice);

  const { data, error } = await query;
  if (error) return err(error.message);
  return ok({ products: (data as ProductRow[]) ?? [] });
}

export async function getProductById(id: string): Promise<ActionResult<{ product: ProductRow }>> {
  const parsed = z.string().min(1).safeParse(id);
  if (!parsed.success) return err("Invalid input");

  const client = await getServerClient();
  const { data, error } = await client.from("products").select("*").eq("id", id).single();
  if (error) return err(error.message);
  return ok({ product: data as ProductRow });
}

export async function getFeaturedProducts(limit: number): Promise<ActionResult<{ products: ProductRow[] }>> {
  const parsed = z.number().int().min(1).max(50).safeParse(limit);
  if (!parsed.success) return err("Invalid input");

  const client = await getServerClient();
  const { data, error } = await client
    .from("products")
    .select("*")
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(parsed.data);

  if (error) return err(error.message);
  return ok({ products: (data as ProductRow[]) ?? [] });
}

export async function createProduct(input: unknown): Promise<ActionResult<{ product: ProductRow }>> {
  const parsed = ProductDataSchema.safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const adminRes = await requireAdmin();
  if (!adminRes.success) return adminRes;
  const { client, user } = adminRes.data;

  const { data, error } = await client
    .from("products")
    .insert({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return err(error.message);

  const created = data as ProductRow;
  await logAdminActivity({
    actorUserId: user.id,
    action: "product.create",
    entityType: "product",
    entityId: created.id ?? null,
    metadata: { title: parsed.data.title },
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  return ok({ product: created });
}

export async function updateProduct(input: {
  id: string;
  productData: unknown;
}): Promise<ActionResult<{ product: ProductRow }>> {
  const parsed = z
    .object({
      id: z.string().min(1),
      productData: ProductDataSchema.partial(),
    })
    .safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const adminRes = await requireAdmin();
  if (!adminRes.success) return adminRes;
  const { client, user } = adminRes.data;

  const { data, error } = await client
    .from("products")
    .update({
      ...parsed.data.productData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error) return err(error.message);

  await logAdminActivity({
    actorUserId: user.id,
    action: "product.update",
    entityType: "product",
    entityId: parsed.data.id,
    metadata: parsed.data.productData as unknown as Json,
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.id}`);
  return ok({ product: data as ProductRow });
}

export async function deleteProduct(id: string): Promise<ActionResult<{ deleted: true }>> {
  const parsed = z.string().min(1).safeParse(id);
  if (!parsed.success) return err("Invalid input");

  const adminRes = await requireAdmin();
  if (!adminRes.success) return adminRes;
  const { client, user } = adminRes.data;

  const { error } = await client.from("products").delete().eq("id", parsed.data);
  if (error) return err(error.message);

  await logAdminActivity({
    actorUserId: user.id,
    action: "product.delete",
    entityType: "product",
    entityId: parsed.data,
    metadata: null,
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  return ok({ deleted: true });
}

export async function getUserCart(): Promise<
  ActionResult<{ items: Array<CartItemRow & { product: ProductRow | null }> }>
> {
  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { data, error } = await client
    .from("cart_items")
    .select("id,user_id,product_id,variant_id,quantity,created_at,updated_at,product:products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  const raw = (data ?? []) as Array<CartItemRow & { product: unknown }>;
  const items = raw.map((row) => ({
    ...row,
    product: normalizeEmbeddedRow<ProductRow>(row.product),
  }));
  return ok({ items });
}

export async function addToCart(input: {
  productId: string;
  quantity: number;
}): Promise<ActionResult<{ added: true }>> {
  const parsed = z
    .object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) })
    .safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { data: existing, error: existingError } = await client
    .from("cart_items")
    .select("id,quantity")
    .eq("user_id", user.id)
    .eq("product_id", parsed.data.productId)
    .maybeSingle();

  if (existingError) return err(existingError.message);

  const existingRow = existing as { id: string; quantity: number } | null;

  if (existingRow?.id) {
    const nextQty = existingRow.quantity + parsed.data.quantity;
    const { error } = await client
      .from("cart_items")
      .update({ quantity: nextQty, updated_at: new Date().toISOString() })
      .eq("id", existingRow.id);
    if (error) return err(error.message);
  } else {
    const { error } = await client.from("cart_items").insert({
      user_id: user.id,
      product_id: parsed.data.productId,
      quantity: parsed.data.quantity,
      updated_at: new Date().toISOString(),
    });
    if (error) return err(error.message);
  }

  revalidatePath("/cart");
  return ok({ added: true });
}

export async function updateCartItem(input: {
  cartItemId: string;
  quantity: number;
}): Promise<ActionResult<{ updated: true }>> {
  const parsed = z
    .object({ cartItemId: z.string().min(1), quantity: z.number().int().min(1).max(99) })
    .safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { error } = await client
    .from("cart_items")
    .update({ quantity: parsed.data.quantity, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.cartItemId)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  revalidatePath("/cart");
  return ok({ updated: true });
}

export async function removeFromCart(cartItemId: string): Promise<ActionResult<{ removed: true }>> {
  const parsed = z.string().min(1).safeParse(cartItemId);
  if (!parsed.success) return err("Invalid input");

  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { error } = await client
    .from("cart_items")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  revalidatePath("/cart");
  return ok({ removed: true });
}

export async function clearCart(): Promise<ActionResult<{ cleared: true }>> {
  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { error } = await client.from("cart_items").delete().eq("user_id", user.id);
  if (error) return err(error.message);
  revalidatePath("/cart");
  return ok({ cleared: true });
}

export async function createOrder(input: unknown): Promise<ActionResult<{ orderId: string }>> {
  const parsed = OrderCreateSchema.safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { data: cartRows, error: cartError } = await client
    .from("cart_items")
    .select("id,quantity,product:products(id,title,price,affiliate_url)")
    .eq("user_id", user.id);

  if (cartError) return err(cartError.message);

  const rows = (cartRows ?? []) as Array<{ id: string; quantity: number; product: unknown }>;

  const items = rows.flatMap((r) => {
    const product = normalizeEmbeddedRow<Pick<ProductRow, "id" | "title" | "price" | "affiliate_url">>(r.product);
    if (!product) return [];
    return [
      {
        product_id: product.id,
        title: product.title,
        unit_price: product.price,
        quantity: r.quantity,
      },
    ];
  });

  if (items.length === 0) return err("Cart is empty");

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const currency = "USD";

  const { data: order, error: orderError } = await client
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total,
      currency,
      shipping_address: parsed.data.shipping_address,
      payment_method: parsed.data.payment_method ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) return err(orderError?.message ?? "Order creation failed");

  const orderId = (order as Pick<OrderRow, "id">).id;

  const { error: itemsError } = await client.from("order_items").insert(
    items.map((i) => ({
      order_id: orderId,
      product_id: i.product_id,
      title: i.title,
      unit_price: i.unit_price,
      quantity: i.quantity,
    })),
  );

  if (itemsError) return err(itemsError.message);

  const { error: clearError } = await client.from("cart_items").delete().eq("user_id", user.id);
  if (clearError) return err(clearError.message);

  if (user.email) {
    await sendOrderConfirmationEmail({
      to: user.email,
      orderId,
      items: items.map((i) => ({ title: i.title, quantity: i.quantity, unitPrice: i.unit_price })),
      total,
      currency,
    });
  }

  revalidatePath("/cart");
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return ok({ orderId });
}

export async function getUserOrders(): Promise<ActionResult<{ orders: OrderRow[] }>> {
  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok({ orders: (data as OrderRow[]) ?? [] });
}

export async function getOrderById(orderId: string): Promise<
  ActionResult<{ order: OrderRow; items: OrderItemRow[] }>
> {
  const parsed = z.string().min(1).safeParse(orderId);
  if (!parsed.success) return err("Invalid input");

  const userRes = await requireUser();
  if (!userRes.success) return userRes;
  const { client, user } = userRes.data;

  const { data: order, error: orderError } = await client
    .from("orders")
    .select("*")
    .eq("id", parsed.data)
    .eq("user_id", user.id)
    .single();

  if (orderError) return err(orderError.message);

  const { data: items, error: itemsError } = await client
    .from("order_items")
    .select("*")
    .eq("order_id", parsed.data)
    .order("created_at", { ascending: true });

  if (itemsError) return err(itemsError.message);

  return ok({ order: order as OrderRow, items: (items as OrderItemRow[]) ?? [] });
}

export async function getAllOrders(input: { status?: string }): Promise<ActionResult<{ orders: OrderRow[] }>> {
  const parsed = z.object({ status: OrderStatusSchema.optional() }).safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const adminRes = await requireAdmin();
  if (!adminRes.success) return adminRes;
  const { client } = adminRes.data;

  let query = client.from("orders").select("*").order("created_at", { ascending: false });
  if (parsed.data.status) query = query.eq("status", parsed.data.status);

  const { data, error } = await query;
  if (error) return err(error.message);
  return ok({ orders: (data as OrderRow[]) ?? [] });
}

export async function updateOrderStatus(input: { orderId: string; status: string }): Promise<ActionResult<{ order: OrderRow }>> {
  const parsed = z.object({ orderId: z.string().min(1), status: OrderStatusSchema }).safeParse(input);
  if (!parsed.success) return err("Invalid input");

  const adminRes = await requireAdmin();
  if (!adminRes.success) return adminRes;
  const { client, user } = adminRes.data;

  const { data: order, error } = await client
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.orderId)
    .select("*")
    .single();

  if (error) return err(error.message);

  await logAdminActivity({
    actorUserId: user.id,
    action: "order.status.update",
    entityType: "order",
    entityId: parsed.data.orderId,
    metadata: { status: parsed.data.status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${parsed.data.orderId}`);
  return ok({ order: order as OrderRow });
}
