import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { currencyRatesQuery, DEFAULT_RATES, type CurrencyCode, type CurrencyRates } from "@/lib/settings";

const STORAGE_KEY = "wa_currency";
const CURRENCIES: CurrencyCode[] = ["USD", "AUD", "EUR"];
const SYMBOLS: Record<CurrencyCode, string> = { USD: "$", AUD: "A$", EUR: "€" };

type CurrencyCtx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: CurrencyRates;
  format: (usd: number) => string;
};

const Ctx = createContext<CurrencyCtx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const ratesQ = useQuery(currencyRatesQuery());
  const rates = ratesQ.data ?? DEFAULT_RATES;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (saved && CURRENCIES.includes(saved)) setCurrencyState(saved);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, c);
  };

  const value = useMemo<CurrencyCtx>(
    () => ({
      currency,
      setCurrency,
      rates,
      format: (usd: number) => {
        const rate = rates[currency] ?? 1;
        const converted = Math.round(usd * rate);
        return `${SYMBOLS[currency]}${converted.toLocaleString()}`;
      },
    }),
    [currency, rates],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCurrency must be inside CurrencyProvider");
  return v;
}

export function CurrencyToggle({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className={`inline-flex items-center rounded-full border border-border bg-background/60 p-0.5 text-xs ${className}`}>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className={`rounded-full px-2.5 py-1 font-semibold transition ${
            currency === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={currency === c}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
