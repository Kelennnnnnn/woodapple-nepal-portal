import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, LogOut, Loader2, ShieldAlert, Star, ArrowLeft, Mail, MailOpen, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toursListQuery, type Tour, type TourCategory } from "@/lib/tours";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Woodapple Tours" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

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
  const [tab, setTab] = useState<"tours" | "inquiries">("tours");

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
          <p className="mt-4 rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
            Ask a backend administrator to grant the admin role to your user ID by inserting a row into <code className="font-mono">user_roles</code>.
          </p>
          <button onClick={signOut} className="mt-5 text-sm font-semibold text-primary hover:underline">Sign out</button>
        </div>
      </div>
    );
  }

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

      <div className="mt-6 flex gap-1 border-b border-border">
        {([
          { id: "tours" as const, label: "Tours" },
          { id: "inquiries" as const, label: "Inquiries" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {tab === "tours" ? (
        <div className="mt-6 overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
          {toursQ.isLoading ? (
            <div className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>
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
                {(toursQ.data ?? []).map((t) => (
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
      ) : (
        <InquiriesPanel />
      )}

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

function TourEditor({ draft, onCancel, onSave, saving, error }: {
  draft: TourDraft; onCancel: () => void; onSave: (d: TourDraft) => void; saving: boolean; error: string | null;
}) {
  const [d, setD] = useState<TourDraft>(draft);
  const set = <K extends keyof TourDraft>(k: K, v: TourDraft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  const setJson = (k: "itinerary" | "faq", str: string) => {
    try { set(k, JSON.parse(str)); } catch { /* keep typing */ }
  };
  const setArr = (k: "included" | "excluded" | "images", str: string) =>
    set(k, str.split("\n").map((s) => s.trim()).filter(Boolean));

  return (
    <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-black/50 sm:items-center sm:justify-center sm:p-6">
      <div className="w-full max-w-3xl rounded-t-2xl bg-background p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{d.id ? "Edit tour" : "New tour"}</h2>
          <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(d); }}
          className="mt-5 grid max-h-[70vh] gap-4 overflow-y-auto pr-1"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" value={d.title} onChange={(v) => set("title", v)} required />
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
          <TextareaField
            label="Included (one per line)"
            value={d.included.join("\n")}
            onChange={(v) => setArr("included", v)}
            rows={4}
          />
          <TextareaField
            label="Excluded (one per line)"
            value={d.excluded.join("\n")}
            onChange={(v) => setArr("excluded", v)}
            rows={3}
          />
          <TextareaField
            label="Images (one URL per line)"
            value={d.images.join("\n")}
            onChange={(v) => setArr("images", v)}
            rows={3}
          />
          <TextareaField
            label="Itinerary (JSON array of {day, title, description})"
            value={JSON.stringify(d.itinerary, null, 2)}
            onChange={(v) => setJson("itinerary", v)}
            rows={6} mono
          />
          <TextareaField
            label="FAQ (JSON array of {q, a})"
            value={JSON.stringify(d.faq, null, 2)}
            onChange={(v) => setJson("faq", v)}
            rows={5} mono
          />
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
