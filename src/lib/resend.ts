import { Resend } from "resend";

import { env } from "@/lib/env";

export async function sendOrderConfirmationEmail(input: {
  to: string;
  orderId: string;
  items: Array<{ title: string; quantity: number; unitPrice: number }>;
  total: number;
  currency: string;
}) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) return;

  const resend = new Resend(env.RESEND_API_KEY);

  const lines = input.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.title}</td><td style="padding:6px 0; text-align:right;">${i.quantity}</td><td style="padding:6px 0; text-align:right;">${i.unitPrice.toFixed(
          2,
        )}</td></tr>`,
    )
    .join("");

  await resend.emails.send({
    from: env.RESEND_FROM,
    to: input.to,
    subject: `Vendora order confirmation · ${input.orderId}`,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5; color: #111;">
        <h2 style="margin:0 0 12px;">Order confirmed</h2>
        <p style="margin:0 0 16px;">Thanks for your order on Vendora.</p>
        <div style="margin:0 0 10px; font-weight:600;">Order ID</div>
        <div style="margin:0 0 18px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;">${input.orderId}</div>
        <table style="width:100%; border-collapse: collapse; font-size:14px;">
          <thead>
            <tr>
              <th style="text-align:left; padding:6px 0; border-bottom:1px solid #eee;">Item</th>
              <th style="text-align:right; padding:6px 0; border-bottom:1px solid #eee;">Qty</th>
              <th style="text-align:right; padding:6px 0; border-bottom:1px solid #eee;">Price</th>
            </tr>
          </thead>
          <tbody>${lines}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:10px 0; border-top:1px solid #eee; font-weight:600; text-align:right;">Total</td>
              <td style="padding:10px 0; border-top:1px solid #eee; font-weight:600; text-align:right;">${input.total.toFixed(
                2,
              )} ${input.currency}</td>
            </tr>
          </tfoot>
        </table>
        <p style="margin:18px 0 0; color:#666; font-size:13px;">BUY BETTER WITH VENDORA</p>
      </div>
    `,
  });
}

