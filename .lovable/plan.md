
## Goal

Lock the admin dashboard down to users with the `admin` role (the `user_roles` table + `has_role()` function already exist), and surface a discoverable way to reach the login page.

## 1. RBAC enforcement

**`src/routes/_authenticated/route.tsx`** — extend the existing gate. After `supabase.auth.getUser()` succeeds, query `user_roles` for `role = 'admin'` for that user id. If absent, sign the user out and `redirect({ to: "/auth" })` with a search param like `?denied=1`. This keeps the integration-managed `ssr: false` shape but adds the role check.

**`src/routes/auth.tsx`**:
- After a successful `signInWithPassword`, query `user_roles` for an admin row. If none, call `supabase.auth.signOut()` and show "This account does not have admin access." Do not navigate to `/admin`.
- Same check inside the existing `getSession()` effect so an already-signed-in non-admin doesn't auto-redirect to `/admin`.
- Read `?denied=1` from the URL and show the same "not authorized" message when present.
- Keep the existing sign-up toggle (the `grant_first_user_admin` trigger still bootstraps the first account as admin); add a small note that new accounts only get access if granted the admin role.

No DB migration is needed — `user_roles`, the `app_role` enum, `has_role()`, and the first-user-admin trigger are already in place.

## 2. Visible Admin Login link

**`src/components/site-footer.tsx`** — add a small "Admin login" `<Link to="/auth">` in the bottom credentials/copyright bar (subtle, muted styling, right-aligned next to the "Made in Kathmandu" line).

**`src/components/site-header.tsx`** — add a small "Admin" link in the desktop nav cluster (left of `CurrencyToggle`, muted styling so it doesn't compete with primary nav) and include it in the mobile menu list.

## Out of scope

- No changes to other routes, tour pages, or the admin dashboard internals.
- No new tables, policies, or migrations.
