import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { CurrencyToggle } from "@/lib/currency";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/tours", label: "Tours" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "bg-background/85 backdrop-blur border-b border-border"
          : "bg-background/0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img src={logo} alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-display text-base font-semibold tracking-tight text-foreground">
              Woodapple
            </span>
            <span className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Tours &amp; Travel
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-primary [&[data-status=active]]:text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden text-xs font-medium text-muted-foreground hover:text-primary md:inline-flex"
          >
            Admin
          </Link>
          <CurrencyToggle className="hidden sm:inline-flex" />
          <Link
            to="/contact"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow md:inline-flex"
          >
            Plan My Trip
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-md px-2 py-3 text-base font-medium text-foreground/80 hover:bg-muted [&[data-status=active]]:text-primary"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between px-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Currency</span>
              <CurrencyToggle />
            </div>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Plan My Trip
            </Link>
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 text-center text-xs text-muted-foreground hover:text-primary"
            >
              Admin login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

