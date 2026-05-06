"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createWhatsAppOrder } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/utils";

function normalizeWhatsAppNumber(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export function CheckoutForm({
  productId,
  userEmail,
  brandName,
}: {
  productId?: string;
  userEmail?: string | null;
  brandName?: string;
}) {
  const [pending, startTransition] = useTransition();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const waNumberRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const waNumber = normalizeWhatsAppNumber(waNumberRaw);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-sm font-semibold">Checkout via WhatsApp</div>
        <div className="text-sm text-muted-foreground">
          We’ll open WhatsApp with your order details.
        </div>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-2">
          <div className="text-sm font-medium">Full name</div>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="h-11 rounded-2xl bg-background/60"
            autoComplete="name"
          />
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Phone number</div>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +234..."
            className="h-11 rounded-2xl bg-background/60"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Delivery address</div>
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, city, state"
            className="min-h-24 rounded-2xl bg-background/60"
          />
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Note (optional)</div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any extra instructions (optional)"
            className="min-h-20 rounded-2xl bg-background/60"
          />
        </div>
      </div>

      <Button
        className="h-11 w-full rounded-2xl"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            if (!waNumber) {
              toast.error("WhatsApp number is not configured. Set NEXT_PUBLIC_WHATSAPP_NUMBER.");
              return;
            }
            if (!fullName.trim()) {
              toast.error("Enter your full name.");
              return;
            }
            if (!phone.trim()) {
              toast.error("Enter your phone number.");
              return;
            }
            if (!address.trim()) {
              toast.error("Enter your delivery address.");
              return;
            }

            toast.loading("Creating order…", { id: "whatsapp-checkout" });
            try {
              const res = await createWhatsAppOrder({
                productId,
                customer: {
                  fullName,
                  phone,
                  address,
                  note,
                },
              });

              if (!res.success) {
                if (res.error === "Unauthorized") {
                  const next = `/checkout${productId ? `?productId=${encodeURIComponent(productId)}` : ""}`;
                  window.location.href = `/login?next=${encodeURIComponent(next)}`;
                  return;
                }
                toast.error(res.error, { id: "whatsapp-checkout" });
                return;
              }

              const data = res.data;
              const brand = brandName?.trim() || "Vendora";
              const lines = data.items.map((i) => `- ${i.title} x${i.quantity}`).join("\n");
              const totalItems = data.items.reduce((sum, i) => sum + i.quantity, 0);

              const message =
                `Hello ${brand}, I want to place an order.%0A%0A` +
                `Order ID: ${encodeURIComponent(data.orderId)}%0A%0A` +
                `Items:%0A${encodeURIComponent(lines)}%0A%0A` +
                `Total items: ${totalItems}%0A` +
                `Total: ${encodeURIComponent(formatMoney(data.total))}%0A%0A` +
                `Customer details:%0A` +
                `Full name: ${encodeURIComponent(fullName.trim())}%0A` +
                `Phone: ${encodeURIComponent(phone.trim())}%0A` +
                `Address: ${encodeURIComponent(address.trim())}` +
                (userEmail ? `%0AEmail: ${encodeURIComponent(userEmail)}` : "") +
                (note.trim() ? `%0A%0ANote: ${encodeURIComponent(note.trim())}` : "");

              toast.success("Order created. Opening WhatsApp…", { id: "whatsapp-checkout" });
              const url = `https://wa.me/${waNumber}?text=${message}`;
              window.location.href = url;
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Checkout failed", { id: "whatsapp-checkout" });
            }
          })
        }
      >
        {pending ? "Opening WhatsApp…" : "Continue on WhatsApp"}
      </Button>

      <div className="text-xs text-muted-foreground">
        Admin fix: set NEXT_PUBLIC_WHATSAPP_NUMBER in your environment (e.g. 2348012345678).
      </div>
    </div>
  );
}
