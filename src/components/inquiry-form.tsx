import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Check } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { sendInquiryEmail } from "@/lib/api/inquiry-email.functions";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  travel_dates: z.string().trim().max(80).optional().or(z.literal("")),
  group_size: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Values, string>>;

export function InquiryForm({ tourId, tourTitle }: { tourId?: string; tourTitle?: string }) {
  const [v, setV] = useState<Values>({
    name: "", email: "", country: "", travel_dates: "", group_size: "", message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const mut = useMutation({
    mutationFn: async (values: Values) => {
      const { error } = await supabase.from("inquiries").insert({
        tour_id: tourId ?? null,
        tour_title: tourTitle ?? null,
        name: values.name,
        email: values.email,
        country: values.country || null,
        travel_dates: values.travel_dates || null,
        group_size: values.group_size || null,
        message: values.message || null,
      });
      if (error) throw error;
      try {
        await sendInquiryEmail({
          data: {
            name: values.name,
            email: values.email,
            country: values.country || "",
            travel_dates: values.travel_dates || "",
            group_size: values.group_size || "",
            message: values.message || "",
            tour_title: tourTitle || "",
          },
        });
      } catch (err) {
        console.error("sendInquiryEmail failed", err);
      }
    },
    onError: (e: Error) => setSubmitError(e.message || "Something went wrong. Please try again."),
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const parsed = schema.safeParse(v);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof Values;
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    mut.mutate(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <Input label="Name" value={v.name} onChange={(x) => set("name", x)} required error={errors.name} />
      <Input label="Email" type="email" value={v.email} onChange={(x) => set("email", x)} required error={errors.email} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Country" value={v.country ?? ""} onChange={(x) => set("country", x)} error={errors.country} />
        <Input label="Group size" value={v.group_size ?? ""} onChange={(x) => set("group_size", x)} placeholder="e.g. 2" error={errors.group_size} />
      </div>
      <Input label="Travel dates" value={v.travel_dates ?? ""} onChange={(x) => set("travel_dates", x)} placeholder="e.g. Oct 2026" error={errors.travel_dates} />
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Message</span>
        <textarea
          value={v.message ?? ""}
          onChange={(e) => set("message", e.target.value)}
          rows={3}
          maxLength={1500}
          aria-invalid={!!errors.message}
          className={`rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none ${errors.message ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"}`}
        />
        {errors.message && <span className="text-xs text-destructive">{errors.message}</span>}
      </label>
      {submitError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{submitError}</p>}
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

function Input({ label, value, onChange, type = "text", required, placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} maxLength={255}
        aria-invalid={!!error}
        className={`rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none ${error ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"}`}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
