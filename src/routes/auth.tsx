import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock } from "lucide-react";

const searchSchema = z.object({
  denied: z.coerce.number().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Admin sign in — Woodapple Tours" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

async function isAdmin(userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

function AuthPage() {
  const navigate = useNavigate();
  const { denied } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    denied ? "This account does not have admin access." : null,
  );

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      if (await isAdmin(data.session.user.id)) {
        navigate({ to: "/admin", replace: true });
      } else {
        await supabase.auth.signOut();
      }
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user || !(await isAdmin(data.user.id))) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }
      navigate({ to: "/admin", replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl bg-card p-8 ring-1 ring-border/60">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Restricted area. Sign in to manage tours.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Back to website</Link>
        </div>
      </div>
    </div>
  );
}
