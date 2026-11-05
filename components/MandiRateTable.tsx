"use client";

import { useMemo, useState } from "react";
import { monthAverage, type MonthRates } from "@/lib/mandi";
import { fmt } from "./ui";

export function MandiRateTable({
  months,
  latestMonthKey,
}: {
  months: MonthRates[];
  latestMonthKey: string;
}) {
  const [active, setActive] = useState(latestMonthKey);
  const month = useMemo(
    () => months.find((m) => m.key === active) ?? months[months.length - 1],
    [active, months]
  );
  const avg = monthAverage(month);

  // first 10 days average (matches the site's "1–10" summary)
  const firstTen = month.days.filter((d) => d.day <= 10);
  const tenAvg = firstTen.length
    ? {
        subah: Math.round(firstTen.reduce((s, d) => s + d.subah, 0) / firstTen.length),
        shaam: Math.round(firstTen.reduce((s, d) => s + d.shaam, 0) / firstTen.length),
      }
    : { subah: 0, shaam: 0 };
  const tenKul = Math.round((tenAvg.subah + tenAvg.shaam) / 2);

  return (
    <div>
      {/* Month tabs */}
      <div className="flex flex-wrap gap-2">
        {months.map((m) => (
          <button
            key={m.key}
            onClick={() => setActive(m.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active === m.key
                ? "bg-brand text-white shadow-[0_8px_18px_-8px_rgba(14,107,76,0.9)]"
                : "border border-line bg-surface text-sub hover:border-brand"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
          <div className="max-h-[32rem] overflow-y-auto scroll-slim">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-brand-50 text-main dark:bg-brand-800/60">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold sm:px-5">Tareekh</th>
                  <th className="px-3 py-3 text-right font-semibold sm:px-5">☀ Subah</th>
                  <th className="px-3 py-3 text-right font-semibold sm:px-5">🌙 Shaam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {month.days.map((d) => (
                  <tr key={d.day} className="transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-800/20">
                    <td className="px-3 py-2.5 font-medium text-main sm:px-5">
                      {d.day} {month.label.split(" ")[0].slice(0, 3)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-sub sm:px-5">Rs {fmt(d.subah)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-sub sm:px-5">Rs {fmt(d.shaam)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Averages */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-card">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-brand-100">
              Average · {firstTen.length ? "1–10" : month.label} {month.label.split(" ")[0]}
            </div>
            <div className="mt-4 space-y-3">
              <AvgRow label="Subah" value={tenAvg.subah} light />
              <AvgRow label="Shaam" value={tenAvg.shaam} light />
              <div className="border-t border-white/20 pt-3">
                <AvgRow label="Kul Average" value={tenKul} light bold />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold-600">
              {month.label} — Mahana Average
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <AvgRow label="Subah" value={avg.subah} />
              <AvgRow label="Shaam" value={avg.shaam} />
              <div className="border-t border-line pt-3">
                <AvgRow label="Kul" value={avg.kul} bold />
              </div>
              <div className="flex items-center justify-between pt-1 text-xs text-sub">
                <span>Kam / Zyada</span>
                <span className="tabular-nums">Rs {fmt(avg.min)} – Rs {fmt(avg.max)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-sub">
                <span>Din</span>
                <span>{avg.days}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly averages roll-up */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        <div className="border-b border-line px-5 py-3 font-display text-sm font-semibold text-main">
          Mahana Average · سب مہینے
        </div>
        <div>
          <table className="w-full text-sm">
            <thead className="bg-surface-2/60">
              <tr>
                <th className="px-2.5 py-3 text-left font-semibold text-main sm:px-5">Mahina</th>
                <th className="px-2.5 py-3 text-right font-semibold text-main sm:px-5">Subah</th>
                <th className="px-2.5 py-3 text-right font-semibold text-main sm:px-5">Shaam</th>
                <th className="px-2.5 py-3 text-right font-semibold text-main sm:px-5">Kul</th>
                <th className="hidden px-2.5 py-3 text-right font-semibold text-main sm:table-cell sm:px-5">Kam / Zyada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {[...months].reverse().map((m) => {
                const a = monthAverage(m);
                return (
                  <tr key={m.key} className="hover:bg-brand-50/40 dark:hover:bg-brand-800/20">
                    <td className="px-2.5 py-3 font-medium text-main sm:px-5">{m.label} <span className="text-xs text-sub">({a.days} din)</span></td>
                    <td className="px-2.5 py-3 text-right tabular-nums text-sub sm:px-5">{fmt(a.subah)}</td>
                    <td className="px-2.5 py-3 text-right tabular-nums text-sub sm:px-5">{fmt(a.shaam)}</td>
                    <td className="px-2.5 py-3 text-right font-semibold tabular-nums text-brand-700 dark:text-brand-100 sm:px-5">{fmt(a.kul)}</td>
                    <td className="hidden px-2.5 py-3 text-right text-xs tabular-nums text-sub sm:table-cell sm:px-5">Rs {fmt(a.min)} – {fmt(a.max)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AvgRow({ label, value, light, bold }: { label: string; value: number; light?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${light ? "text-brand-100" : "text-sub"} text-sm`}>{label}</span>
      <span className={`tabular-nums ${bold ? "font-display text-lg font-bold" : "font-semibold"} ${light ? "text-white" : "text-main"}`}>
        Rs {fmt(value)}
      </span>
    </div>
  );
}
