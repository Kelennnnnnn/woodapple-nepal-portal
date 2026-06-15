import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Woodapple Tours and Travel" },
      { name: "description", content: "Get in touch with our Kathmandu team to plan your custom Nepal trip. We reply within 24 hours." },
      { property: "og:title", content: "Contact Woodapple Tours" },
      { property: "og:description", content: "Plan your custom Nepal trip with our Kathmandu team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Contact</div>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold sm:text-5xl">
            Tell us about your dream trip
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Fill in the form, send us an email or drop by our office in Thamel. We reply to every inquiry within 24 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="rounded-2xl bg-card p-6 ring-1 ring-border/60 sm:p-8"
          >
            {sent ? (
              <div className="rounded-xl bg-primary/5 p-6 text-center">
                <h2 className="font-display text-2xl font-semibold text-primary">Dhanyabad! 🙏</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your message is on its way to Kathmandu. We'll be in touch within a day.
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Country" name="country" />
                  <Field label="When are you thinking?" name="when" placeholder="e.g. Mar–Apr 2026" />
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Which experience interests you?</span>
                  <select className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                    <option>Himalayan trek</option>
                    <option>Cultural / heritage tour</option>
                    <option>Jungle safari</option>
                    <option>Spiritual journey</option>
                    <option>Custom multi-region trip</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Tell us a little more</span>
                  <textarea
                    rows={5}
                    placeholder="Group size, fitness level, anything you've always wanted to see…"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Send inquiry
                </button>
              </div>
            )}
          </form>

          <aside className="space-y-4">
            {[
              { icon: MapPin, title: "Visit us", body: "Thamel Marg, Ward 26\nKathmandu 44600, Nepal" },
              { icon: Phone, title: "Call / WhatsApp", body: "+977 1 4XX XXXX\n+977 98XX XXXXXX" },
              { icon: Mail, title: "Email", body: "hello@woodappletours.com" },
              { icon: Clock, title: "Office hours", body: "Sun – Fri · 9:00 – 18:00 NPT" },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-sm font-semibold uppercase tracking-wider">{title}</div>
                    <div className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{body}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-[color:var(--mountain)] p-5 text-mountain-foreground">
              <div className="text-xs uppercase tracking-wider opacity-80">Credentials</div>
              <div className="mt-2 space-y-1 text-sm">
                <div>NTB License: TL / 0000</div>
                <div>Company Reg.: OCR / 00000 / 069/070</div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}{required && <span className="text-primary">*</span>}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}
