"use client";

import { useState } from "react";

export type FaqItem = { q: string; qUrdu?: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[color:var(--line)] overflow-hidden rounded-3xl border border-line bg-surface">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-semibold text-main">{it.q}</span>
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform dark:bg-brand-800/40 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-sub">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
