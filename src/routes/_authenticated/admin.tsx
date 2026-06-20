import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Pencil, Plus, Trash2, LogOut, Loader2, ShieldAlert, Star, ArrowLeft,
  Mail, MailOpen, Inbox, MessageSquareQuote, Settings as SettingsIcon,
  LayoutDashboard, Map as MapIcon, Search, GripVertical, X, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toursListQuery, type Tour, type TourCategory, type ItineraryDay, type FaqItem } from "@/lib/tours";
import {
  testimonialsQuery, currencyRatesQuery, trustStatsQuery,
  DEFAULT_RATES, DEFAULT_TRUST, type Testimonial, type CurrencyRates, type TrustStats,
} from "@/lib/settings";
import { TourImageUploader } from "@/components/tour-image-uploader";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Woodapple Tours" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type TabId = "overview" | "tours" | "inquiries" | "testimonials" | "settings";
type TourDraft = Omit<Tour, "id" | "created_at"> & { id?: string };

const emptyDraft: TourDraft = {
  title: "", slug: "", category: "trekking",
  short_description: "", full_description: "",
  itinerary: [], duration_days: 1, price_usd: 0,
  group_size: "2-10", difficulty: "Moderate", best_season: "",
  included: [], excluded: [], faq: [], images: [], featured: false,
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<TourDraft | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [tab, setTab] = useState<TabId>("overview");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      setUserEmail(userRes.user?.email ?? "");
      if (!uid) return setIsAdmin(false);
      const { data, error } = await supabase
        .from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      setIsAdmin(!error && !!data);
    })();
  }, []);

  const toursQ = useQuery(toursListQuery());

  const saveMut = useMutation({
    mutationFn: async (draft: TourDraft) => {
      const payload = { ...draft, price_usd: Number(draft.price_usd), duration_days: Number(draft.duration_days) };
      if (draft.id) {
        const { error } = await supabase.from("tours").update(payload).eq("id", draft.id);
        if (error) throw error;
      } else {
        const { id: _omit, ...insertPayload } = payload;
        void _omit;
        const { error } = await supabase.from("tours").insert(insertPayload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tours"] }); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tours"] }),
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  // Reset search when tab changes
  useEffect(() => { setSearch(""); }, [tab]);

  const filteredTours = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return toursQ.data ?? [];
    return (toursQ.data ?? []).filter((t) =>
      t.title.toLowerCase().includes(s) ||
      t.slug.toLowerCase().includes(s) ||
      t.category.toLowerCase().includes(s)
    );
  }, [toursQ.data, search]);

  if (isAdmin === null) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-border/60">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({userEmail}) is signed in, but doesn't have the admin role yet.
          </p>
          <button onClick={signOut} className="mt-5 text-sm font-semibold text-primary hover:underline">Sign out</button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "tours", label: "Tours", icon: MapIcon },
    { id: "inquiries", label: "Inquiries", icon: Inbox },
    { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> Back to website
          </Link>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {userEmail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {tab === "tours" && (
            <button onClick={() => setEditing(emptyDraft)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> New tour
            </button>
          )}
          <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <OverviewPanel onJump={setTab} />}

      {tab === "tours" && (
        <>
          <div className="mt-6 flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tours…"
                className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <span className="text-xs text-muted-foreground">{filteredTours.length} of {toursQ.data?.length ?? 0}</span>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
            {toursQ.isLoading ? (
              <div className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filteredTours.length === 0 ? (
              <div className="p-16 text-center text-sm text-muted-foreground">No tours match.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Tour</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTours.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium">
                          {t.featured && <Star className="h-3.5 w-3.5 fill-[color:var(--saffron)] text-[color:var(--saffron)]" />}
                          {t.title}
                        </div>
                        <div className="text-xs text-muted-foreground">/{t.slug}</div>
                      </td>
                      <td className="px-4 py-3 capitalize">{t.category}</td>
                      <td className="px-4 py-3">{t.duration_days}</td>
                      <td className="px-4 py-3">${t.price_usd}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            to="/tours/$slug"
                            params={{ slug: t.slug }}
                            className="rounded-md p-2 hover:bg-muted"
                            aria-label="View on site"
                            target="_blank"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Link>
                          <button onClick={() => setEditing({ ...t })} className="rounded-md p-2 hover:bg-muted" aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete "${t.title}"? This cannot be undone.`)) deleteMut.mutate(t.id); }}
                            className="rounded-md p-2 text-destructive hover:bg-destructive/10" aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === "inquiries" && <InquiriesPanel />}
      {tab === "testimonials" && <TestimonialsPanel />}
      {tab === "settings" && <SettingsPanel />}

      {editing && (
        <TourEditor
          draft={editing}
          onCancel={() => setEditing(null)}
          onSave={(d) => saveMut.mutate(d)}
          saving={saveMut.isPending}
          error={saveMut.error instanceof Error ? saveMut.error.message : null}
        />
      )}
    </div>
  );
}

/* ----------------------------- Overview ----------------------------- */

function OverviewPanel({ onJump }: { onJump: (t: TabId) => void }) {
  const toursQ = useQuery(toursListQuery());
  const inquiriesQ = useQuery(inquiriesQuery);
  const testimonialsQ = useQuery(testimonialsQuery());

  const tours = toursQ.data ?? [];
  const inquiries = inquiriesQ.data ?? [];
  const testimonials = testimonialsQ.data ?? [];
  const unread = inquiries.filter((i) => !i.read).length;
  const featured = tours.filter((t) => t.featured).length;
  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : "—";
  const recent = inquiries.slice(0, 5);

  const cards = [
    { label: "Tours", value: tours.length, sub: `${featured} featured`, tab: "tours" as TabId, icon: MapIcon },
    { label: "Inquiries", value: inquiries.length, sub: `${unread} unread`, tab: "inquiries" as TabId, icon: Inbox },
    { label: "Testimonials", value: testimonials.length, sub: `${avgRating} avg rating`, tab: "testimonials" as TabId, icon: MessageSquareQuote },
    { label: "Currencies", value: 3, sub: "USD · AUD · EUR", tab: "settings" as TabId, icon: SettingsIcon },
  ];

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => onJump(c.tab)}
              className="group rounded-2xl bg-card p-5 text-left ring-1 ring-border/60 transition hover:ring-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="mt-2 font-display text-3xl font-semibold">{c.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-border/60">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Recent inquiries</h2>
          <button onClick={() => onJump("inquiries")} className="text-xs font-semibold text-primary hover:underline">
            View all →
          </button>
        </div>
        {inquiriesQ.isLoading ? (
          <div className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : recent.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No inquiries yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((i) => (
              <li key={i.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                <span className={`grid h-8 w-8 place-items-center rounded-full ${i.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  {i.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{i.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{i.tour_title ?? "General"} · {i.email}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(i.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Tour editor ----------------------------- */

function TourEditor({ draft, onCancel, onSave, saving, error }: {
  draft: TourDraft; onCancel: () => void; onSave: (d: TourDraft) => void; saving: boolean; error: string | null;
}) {
  const [d, setD] = useState<TourDraft>(draft);
  const set = <K extends keyof TourDraft>(k: K, v: TourDraft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  const setArr = (k: "included" | "excluded" | "images", str: string) =>
    set(k, str.split("\n").map((s) => s.trim()).filter(Boolean));

  // Itinerary helpers
  const addDay = () => set("itinerary", [
    ...d.itinerary,
    { day: d.itinerary.length + 1, title: "", description: "" },
  ]);
  const updateDay = (idx: number, patch: Partial<ItineraryDay>) =>
    set("itinerary", d.itinerary.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeDay = (idx: number) =>
    set("itinerary", d.itinerary.filter((_, i) => i !== idx).map((it, i) => ({ ...it, day: i + 1 })));

  // FAQ helpers
  const addFaq = () => set("faq", [...d.faq, { q: "", a: "" }]);
  const updateFaq = (idx: number, patch: Partial<FaqItem>) =>
    set("faq", d.faq.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeFaq = (idx: number) => set("faq", d.faq.filter((_, i) => i !== idx));

  // Auto-slug
  const autoSlug = (title: string) => {
    if (d.slug) return;
    const s = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    set("slug", s);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-black/50 sm:items-center sm:justify-center sm:p-6">
      <div className="w-full max-w-3xl rounded-t-2xl bg-background p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{d.id ? "Edit tour" : "New tour"}</h2>
          <button onClick={onCancel} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(d); }}
          className="mt-5 grid max-h-[75vh] gap-4 overflow-y-auto pr-1"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" value={d.title} onChange={(v) => { set("title", v); autoSlug(v); }} required />
            <Field label="Slug" value={d.slug} onChange={(v) => set("slug", v)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Category" value={d.category}
              onChange={(v) => set("category", v as TourCategory)}
              options={["trekking", "cultural", "adventure", "wildlife"]}
            />
            <NumField label="Duration (days)" value={d.duration_days} onChange={(v) => set("duration_days", v)} />
            <NumField label="Price (USD)" value={d.price_usd} onChange={(v) => set("price_usd", v)} step={1} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Group size" value={d.group_size} onChange={(v) => set("group_size", v)} />
            <Field label="Difficulty" value={d.difficulty} onChange={(v) => set("difficulty", v)} />
            <Field label="Best season" value={d.best_season} onChange={(v) => set("best_season", v)} />
          </div>
          <TextareaField label="Short description" value={d.short_description} onChange={(v) => set("short_description", v)} rows={2} />
          <TextareaField label="Full description" value={d.full_description} onChange={(v) => set("full_description", v)} rows={4} />
          <TextareaField label="Included (one per line)" value={d.included.join("\n")} onChange={(v) => setArr("included", v)} rows={4} />
          <TextareaField label="Excluded (one per line)" value={d.excluded.join("\n")} onChange={(v) => setArr("excluded", v)} rows={3} />
          <TourImageUploader value={d.images} onChange={(next: string[]) => set("images", next)} />

          {/* Itinerary builder */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Itinerary</span>
              <button type="button" onClick={addDay} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">
                <Plus className="h-3 w-3" /> Add day
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {d.itinerary.length === 0 && (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">No days yet.</p>
              )}
              {d.itinerary.map((it, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Day {it.day}</span>
                    <input
                      value={it.title}
                      onChange={(e) => updateDay(idx, { title: e.target.value })}
                      placeholder="Day title"
                      className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                    />
                    <button type="button" onClick={() => removeDay(idx)} className="rounded-md p-1 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={it.description}
                    onChange={(e) => updateDay(idx, { description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FAQ builder */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">FAQs</span>
              <button type="button" onClick={addFaq} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">
                <Plus className="h-3 w-3" /> Add FAQ
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {d.faq.length === 0 && (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">No FAQs yet.</p>
              )}
              {d.faq.map((it, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        value={it.q}
                        onChange={(e) => updateFaq(idx, { q: e.target.value })}
                        placeholder="Question"
                        className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-medium focus:border-primary focus:outline-none"
                      />
                      <textarea
                        value={it.a}
                        onChange={(e) => updateFaq(idx, { a: e.target.value })}
                        placeholder="Answer"
                        rows={2}
                        className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <button type="button" onClick={() => removeFaq(idx)} className="rounded-md p-1 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4" />
            Featured on homepage
          </label>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="sticky bottom-0 -mx-1 flex justify-end gap-2 border-t border-border bg-background px-1 pt-4">
            <button type="button" onClick={onCancel} className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {d.id ? "Save changes" : "Create tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
    </label>
  );
}

function NumField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm capitalize focus:border-primary focus:outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function TextareaField({ label, value, onChange, rows = 3, mono }: { label: string; value: string; onChange: (v: string) => void; rows?: number; mono?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)}
        className={`rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none ${mono ? "font-mono text-xs" : ""}`} />
    </label>
  );
}

/* ----------------------------- Inquiries ----------------------------- */

type Inquiry = {
  id: string;
  tour_id: string | null;
  tour_title: string | null;
  name: string;
  email: string;
  country: string | null;
  travel_dates: string | null;
  group_size: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
};

const inquiriesQuery = queryOptions({
  queryKey: ["inquiries"],
  queryFn: async (): Promise<Inquiry[]> => {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Inquiry[];
  },
});

function InquiriesPanel() {
  const qc = useQueryClient();
  const q = useQuery(inquiriesQuery);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const toggleRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from("inquiries").update({ read }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("inquiries").update({ read: true }).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });

  const items = q.data ?? [];
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === "unread" && i.read) return false;
      if (filter === "read" && !i.read) return false;
      if (!s) return true;
      return (
        i.name.toLowerCase().includes(s) ||
        i.email.toLowerCase().includes(s) ||
        (i.tour_title ?? "").toLowerCase().includes(s) ||
        (i.message ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, search, filter]);

  const exportCsv = () => {
    const header = ["Name", "Email", "Country", "Tour", "Travel dates", "Group size", "Message", "Read", "Received"];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = filtered.map((i) => [
      i.name, i.email, i.country ?? "", i.tour_title ?? "",
      i.travel_dates ?? "", i.group_size ?? "", (i.message ?? "").replace(/\n/g, " "),
      i.read ? "yes" : "no", new Date(i.created_at).toISOString(),
    ].map(escape).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (q.isLoading) {
    return <div className="mt-6 rounded-2xl bg-card p-12 text-center ring-1 ring-border/60"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-2xl bg-card p-16 text-center ring-1 ring-border/60">
        <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-medium">No inquiries yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Submissions from the website will appear here.</p>
      </div>
    );
  }

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries…"
            className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex rounded-full border border-border p-0.5 text-xs">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 capitalize ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}{f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          {unreadCount > 0 && (
            <button onClick={() => markAllRead.mutate()} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
              Mark all read
            </button>
          )}
          <button onClick={exportCsv} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No inquiries match.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((i) => {
              const isOpen = openId === i.id;
              return (
                <li key={i.id} className={!i.read ? "bg-primary/[0.03]" : ""}>
                  <button
                    onClick={() => {
                      setOpenId(isOpen ? null : i.id);
                      if (!i.read) toggleRead.mutate({ id: i.id, read: true });
                    }}
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left hover:bg-muted/30"
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-full ${i.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                      {i.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={`truncate text-sm ${i.read ? "font-medium" : "font-semibold"}`}>{i.name}</span>
                        {!i.read && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">New</span>}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {i.tour_title ?? "General inquiry"} · {i.email}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(i.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t border-border bg-muted/20 px-4 py-4 text-sm">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                        <Detail label="Country" value={i.country} />
                        <Detail label="Group size" value={i.group_size} />
                        <Detail label="Travel dates" value={i.travel_dates} />
                        <Detail label="Received" value={new Date(i.created_at).toLocaleString()} />
                      </dl>
                      {i.message && (
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</div>
                          <p className="mt-1 whitespace-pre-wrap text-sm">{i.message}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a href={`mailto:${i.email}`} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                          Reply by email
                        </a>
                        <button
                          onClick={() => toggleRead.mutate({ id: i.id, read: !i.read })}
                          className="rounded-full border border-border px-4 py-2 text-xs hover:bg-muted"
                        >
                          Mark as {i.read ? "unread" : "read"}
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this inquiry?")) del.mutate(i.id); }}
                          className="rounded-full border border-border px-4 py-2 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

/* ----------------------------- Testimonials ----------------------------- */

type TestimonialDraft = Omit<Testimonial, "id" | "created_at"> & { id?: string };

const emptyTestimonial: TestimonialDraft = {
  name: "", country: "", tour_title: "", rating: 5, quote: "", photo_url: "", featured: true,
};

function TestimonialsPanel() {
  const qc = useQueryClient();
  const q = useQuery(testimonialsQuery());
  const [editing, setEditing] = useState<TestimonialDraft | null>(null);

  const save = useMutation({
    mutationFn: async (d: TestimonialDraft) => {
      const payload = { ...d, rating: Number(d.rating) };
      if (d.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { id: _omit, ...insert } = payload; void _omit;
        const { error } = await supabase.from("testimonials").insert(insert);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });

  const items = q.data ?? [];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setEditing(emptyTestimonial)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New testimonial
        </button>
      </div>

      {q.isLoading ? (
        <div className="rounded-2xl bg-card p-12 text-center ring-1 ring-border/60"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-card p-16 text-center ring-1 ring-border/60">
          <MessageSquareQuote className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No testimonials yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first review to show it on the homepage.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl bg-card p-5 ring-1 ring-border/60">
              <div className="flex items-center gap-3">
                {t.photo_url ? (
                  <img src={t.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{t.name}</span>
                    {t.featured && <Star className="h-3.5 w-3.5 fill-[color:var(--saffron)] text-[color:var(--saffron)]" />}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{t.country} · {t.tour_title}</div>
                </div>
                <div className="flex">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[color:var(--saffron)] text-[color:var(--saffron)]" />
                  ))}
                </div>
              </div>
              <p className="mt-3 line-clamp-4 flex-1 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex justify-end gap-1">
                <button onClick={() => setEditing({ ...t })} className="rounded-md p-2 hover:bg-muted" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => { if (confirm("Delete this testimonial?")) del.mutate(t.id); }} className="rounded-md p-2 text-destructive hover:bg-destructive/10" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <TestimonialEditor
          draft={editing}
          onCancel={() => setEditing(null)}
          onSave={(d) => save.mutate(d)}
          saving={save.isPending}
          error={save.error instanceof Error ? save.error.message : null}
        />
      )}
    </div>
  );
}

function TestimonialEditor({ draft, onCancel, onSave, saving, error }: {
  draft: TestimonialDraft; onCancel: () => void; onSave: (d: TestimonialDraft) => void; saving: boolean; error: string | null;
}) {
  const [d, setD] = useState<TestimonialDraft>(draft);
  const set = <K extends keyof TestimonialDraft>(k: K, v: TestimonialDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-black/50 sm:items-center sm:justify-center sm:p-6">
      <div className="w-full max-w-xl rounded-t-2xl bg-background p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{d.id ? "Edit testimonial" : "New testimonial"}</h2>
          <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(d); }} className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reviewer name" value={d.name} onChange={(v) => set("name", v)} required />
            <Field label="Country" value={d.country} onChange={(v) => set("country", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tour taken" value={d.tour_title} onChange={(v) => set("tour_title", v)} />
            <NumField label="Rating (1-5)" value={d.rating} onChange={(v) => set("rating", Math.max(1, Math.min(5, v)))} />
          </div>
          <Field label="Photo URL (optional)" value={d.photo_url} onChange={(v) => set("photo_url", v)} />
          <TextareaField label="Quote" value={d.quote} onChange={(v) => set("quote", v)} rows={4} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4" />
            Show on homepage
          </label>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={onCancel} className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {d.id ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------- Settings ----------------------------- */

function SettingsPanel() {
  const qc = useQueryClient();
  const ratesQ = useQuery(currencyRatesQuery());
  const trustQ = useQuery(trustStatsQuery());

  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_RATES);
  const [trust, setTrust] = useState<TrustStats>(DEFAULT_TRUST);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => { if (ratesQ.data) setRates(ratesQ.data); }, [ratesQ.data]);
  useEffect(() => { if (trustQ.data) setTrust(trustQ.data); }, [trustQ.data]);

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert({ key, value: value as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["settings", vars.key] });
      setSavedMsg("Saved");
      setTimeout(() => setSavedMsg(null), 2000);
    },
  });

  if (ratesQ.isLoading || trustQ.isLoading) {
    return <div className="mt-6 rounded-2xl bg-card p-12 text-center ring-1 ring-border/60"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl bg-card p-6 ring-1 ring-border/60">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Currency conversion rates</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Rates relative to 1 USD. Used for the site-wide currency toggle.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); saveSetting.mutate({ key: "currency_rates", value: rates }); }}
          className="mt-5 grid gap-4"
        >
          {(Object.keys(rates) as Array<keyof CurrencyRates>).map((k) => (
            <label key={k} className="grid grid-cols-[80px_1fr] items-center gap-3 text-sm">
              <span className="font-semibold">{k}</span>
              <input
                type="number" step="0.01" min="0" value={rates[k]} disabled={k === "USD"}
                onChange={(e) => setRates((r) => ({ ...r, [k]: Number(e.target.value) }))}
                className="rounded-lg border border-input bg-background px-3 py-2 disabled:opacity-60"
              />
            </label>
          ))}
          <div className="flex items-center justify-end gap-3">
            {savedMsg && <span className="text-sm text-primary">{savedMsg}</span>}
            <button type="submit" disabled={saveSetting.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {saveSetting.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save rates
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-card p-6 ring-1 ring-border/60">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Trust bar stats</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Numbers shown in the trust bar below the homepage hero.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); saveSetting.mutate({ key: "trust_stats", value: trust }); }}
          className="mt-5 grid gap-4"
        >
          {([
            ["years_operating", "Years in operation"],
            ["happy_travelers", "Happy travelers"],
            ["destinations", "Destinations covered"],
            ["average_rating", "Average rating"],
          ] as const).map(([k, label]) => (
            <label key={k} className="grid grid-cols-[160px_1fr] items-center gap-3 text-sm">
              <span className="font-medium">{label}</span>
              <input
                type="number"
                step={k === "average_rating" ? "0.1" : "1"}
                value={trust[k]}
                onChange={(e) => setTrust((t) => ({ ...t, [k]: Number(e.target.value) }))}
                className="rounded-lg border border-input bg-background px-3 py-2"
              />
            </label>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={saveSetting.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {saveSetting.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save stats
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
