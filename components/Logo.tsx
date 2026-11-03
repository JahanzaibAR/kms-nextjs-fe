"use client";

import { useSite } from "./SiteProvider";

export function Logo({ compact = false }: { compact?: boolean }) {
  const site = useSite();
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-[0_6px_16px_-6px_rgba(14,107,76,0.9)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
          {/* milk drop */}
          <path
            d="M16 3.5c3.6 4.6 7 8.3 7 12.4a7 7 0 11-14 0C9 11.8 12.4 8.1 16 3.5z"
            fill="#fff"
          />
          <path
            d="M16 3.5c3.6 4.6 7 8.3 7 12.4a7 7 0 01-7 7V3.5z"
            fill="var(--color-gold-200)"
          />
          <circle cx="13" cy="17" r="1.6" fill="var(--color-gold-400)" opacity="0.7" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gold shadow-sm ring-2 ring-[color:var(--surface)]" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-gold-600">
            {site.logoTop}
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-main">
            {site.logoBottom}{" "}
            <span className="text-sm font-normal text-sub">Supplier</span>
          </span>
        </span>
      )}
    </span>
  );
}
