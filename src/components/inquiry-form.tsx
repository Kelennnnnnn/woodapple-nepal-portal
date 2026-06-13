import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Check } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  travel_dates: z.string().trim().max(80).optional().or(z.literal("")),
  group_size: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export function InquiryForm({ tourId, tourTitle }: { tourId?: string; tourTitle?: string }) {
  const [v, setV] = useState<Values>({
    name: "", email: "", country: "", travel_dates: "", group_size: "", message: "",
  });
  const [fieldError, setFieldError] = useState<string | null>(null);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((p) => ({ ...p, [k]: val }));

  const mut = useMutation({
    mutationFn: async (values: Values) => {
      const parsed = schema.safeParse(values);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { error } = await supabase.from("inquiries").insert({
        tour_id: tourId ?? null,
        tour_title: tourTitle ?? null,
        name: parsed.data.name,
        email: parsed.data.email,
        country: parsed.data.country || null,
        travel_dates: parsed.data.travel_dates || null,
        group_size: parsed.data.group_size || null,
        message: parsed.data.message || null,
      });
      if (error) throw error;
    },
    onError: (e: Error) => setFieldError(e.message),
  });

  if (mut.isSuccess) {
    return (
      <div className="rounded-xl bg-primary/5 p-5 text-center ring-1 ring-primary/20">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-5 w-5" />
        </div>
        <p className="mt-3 font-display text-base font-semibold">Thank you!</p>
        <p className="mt-1 text-sm text-muted-foreground">We respond within 12 hours.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setFieldError(null); mut.mutate(v); }}
      className="space-y-3"
    >
      <Input label="Name" value={v.name} onChange={(x) => set("name", x)} required />
      <Input label="Email" type="email" value={v.email} onChange={(x) => set("email", x)} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Country" value={v.country ?? ""} onChange={(x) => set("country", x)} />
        <Input label="Group size" value={v.group_size ?? ""} onChange={(x) => set("group_size", x)} placeholder="e.g. 2" />
      </div>
      <Input label="Travel dates" value={v.travel_dates ?? ""} onChange={(x) => set("travel_dates", x)} placeholder="e.g. Oct 2026" />
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Message</span>
        <textarea
          value={v.message ?? ""}
          onChange={(e) => set("message", e.target.value)}
          rows={3}
          maxLength={1500}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </label>
      {fieldError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{fieldError}</p>}
      <button
        type="submit"
        disabled={mut.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Send inquiry
      </button>
    </form>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</span>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} maxLength={255}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}
