import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// NOTE: Verify the sender domain (woodappletours.com) in Resend before launch,
// otherwise sends will be rejected. Until then, use Resend's onboarding@resend.dev
// or a verified test domain.
const FROM = "Woodapple Tours <noreply@woodappletours.com>";

const inputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  travel_dates: z.string().trim().max(80).optional().or(z.literal("")),
  group_size: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  tour_title: z.string().trim().max(200).optional().or(z.literal("")),
});

type Input = z.infer<typeof inputSchema>;

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function row(label: string, value?: string) {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:13px;vertical-align:top">${esc(label)}</td><td style="padding:6px 0;font-size:14px;color:#111">${esc(value)}</td></tr>`;
}

function agencyHtml(d: Input) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px">
    <h2 style="margin:0 0 12px;font-size:18px">New inquiry${d.tour_title ? `: ${esc(d.tour_title)}` : ""}</h2>
    <table style="border-collapse:collapse">
      ${row("Name", d.name)}
      ${row("Email", d.email)}
      ${row("Country", d.country || "")}
      ${row("Group size", d.group_size || "")}
      ${row("Travel dates", d.travel_dates || "")}
      ${row("Tour", d.tour_title || "")}
      ${row("Message", d.message || "")}
    </table>
    <p style="margin-top:16px;color:#666;font-size:12px">Reply directly to this email to respond to the customer.</p>
  </div>`;
}

function customerHtml(d: Input) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;color:#111">
    <h2 style="margin:0 0 12px;font-size:20px">Dhanyabad, ${esc(d.name)} 🙏</h2>
    <p style="font-size:14px;line-height:1.6">Thanks for reaching out to Woodapple Tours and Travel. We've received your inquiry${d.tour_title ? ` about <strong>${esc(d.tour_title)}</strong>` : ""} and a member of our Kathmandu team will reply within 24 hours.</p>
    <p style="font-size:14px;line-height:1.6;margin-top:16px"><strong>Your details</strong></p>
    <table style="border-collapse:collapse">
      ${row("Country", d.country || "")}
      ${row("Group size", d.group_size || "")}
      ${row("Travel dates", d.travel_dates || "")}
      ${row("Message", d.message || "")}
    </table>
    <p style="font-size:13px;color:#666;margin-top:20px">— Woodapple Tours and Travel<br/>Thamel, Kathmandu, Nepal</p>
  </div>`;
}

async function resendSend(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

export const sendInquiryEmail = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const inbox = process.env.AGENCY_INBOX_EMAIL;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    if (!inbox) throw new Error("AGENCY_INBOX_EMAIL is not configured");

    const subject = `New inquiry: ${data.tour_title || "General"} — ${data.name}`;

    await resendSend(apiKey, {
      from: FROM,
      to: [inbox],
      reply_to: data.email,
      subject,
      html: agencyHtml(data),
    });

    await resendSend(apiKey, {
      from: FROM,
      to: [data.email],
      subject: `We received your inquiry — Woodapple Tours`,
      html: customerHtml(data),
    });

    return { ok: true };
  });
