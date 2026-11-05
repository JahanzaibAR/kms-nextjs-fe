"use client";

import { KG_PER_MUN } from "@/lib/mandi";
import { useSite } from "./SiteProvider";
import { fmt } from "./ui";

export type BillRow = {
  subahMun: number;
  subahKg: number;
  shaamMun: number;
  shaamKg: number;
  subahRate: number;
  shaamRate: number;
  comm: number;
};

export type BillTotals = { mun: number; kg: number; totalAmount: number };

function round(n: number) {
  return Math.round(n);
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/** Shared bill math — used by the live calculator and by saved-bill previews. */
export function computeBill(rows: BillRow[]) {
  let totalMun = 0;
  let totalAmount = 0;
  const perRow = rows.map((r) => {
    const subahMun = (r.subahMun || 0) + (r.subahKg || 0) / KG_PER_MUN;
    const shaamMun = (r.shaamMun || 0) + (r.shaamKg || 0) / KG_PER_MUN;
    const subahAmt = subahMun * ((r.subahRate || 0) + (r.comm || 0));
    const shaamAmt = shaamMun * ((r.shaamRate || 0) + (r.comm || 0));
    const rowMun = subahMun + shaamMun;
    const rowAmt = subahAmt + shaamAmt;
    totalMun += rowMun;
    totalAmount += rowAmt;
    return { rowMun, rowAmt };
  });
  const mun = Math.floor(totalMun);
  const kg = round((totalMun - mun) * KG_PER_MUN);
  return { perRow, totalMun, totalAmount: round(totalAmount), mun, kg };
}

export function BillSheet({
  lang,
  name,
  dates,
  rows,
  perRow,
  totals,
  prevBalance,
  paid,
  baqaya,
}: {
  lang: "roman" | "urdu";
  name: string;
  dates: Date[];
  rows: BillRow[];
  perRow: { rowMun: number; rowAmt: number }[];
  totals: BillTotals;
  prevBalance: number;
  paid: number;
  baqaya: number;
}) {
  const site = useSite();
  const ur = lang === "urdu";
  return (
    <div className={`rounded-2xl bg-white p-6 text-zinc-900 shadow-2xl ${ur ? "urdu text-right" : ""}`} dir={ur ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between border-b-2 border-brand pb-3">
        <div>
          <div className="font-display text-xl font-bold text-brand-700">{site.name}</div>
          <div className="text-xs text-zinc-500">Since {site.since} · {site.phone}</div>
        </div>
        <div className="text-2xl">🥛</div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span>{ur ? "نام" : "Naam"}: <strong>{name || "—"}</strong></span>
        <span className="text-zinc-500">
          {dates.length ? `${fmtDate(dates[0])}${dates.length > 1 ? ` – ${fmtDate(dates[dates.length - 1])}` : ""}` : ""}
        </span>
      </div>

      <table className="mt-3 w-full text-xs" dir="ltr">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500">
            <th className="py-1.5 text-left">Din</th>
            <th className="py-1.5 text-right">Subah</th>
            <th className="py-1.5 text-right">Shaam</th>
            <th className="py-1.5 text-right">Raqam</th>
          </tr>
        </thead>
        <tbody>
          {dates.map((d, i) => {
            const r = rows[i];
            const amt = perRow[i]?.rowAmt ?? 0;
            if (!r || amt <= 0) return null;
            return (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-1.5">{fmtDate(d)}</td>
                <td className="py-1.5 text-right">{r.subahMun || r.subahKg ? `${r.subahMun}m ${r.subahKg}kg` : "—"}</td>
                <td className="py-1.5 text-right">{r.shaamMun || r.shaamKg ? `${r.shaamMun}m ${r.shaamKg}kg` : "—"}</td>
                <td className="py-1.5 text-right font-semibold">Rs {fmt(round(amt))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 text-sm" dir="ltr">
        <Line l={ur ? "کل دودھ" : "Kul Doodh"} r={`${totals.mun} Mun ${totals.kg} Kg`} />
        <Line l={ur ? "کل رقم" : "Kul Raqam"} r={`Rs ${fmt(totals.totalAmount)}`} bold />
        {!!prevBalance && <Line l={ur ? "پچھلا بقایا" : "Pichla Baqaya"} r={`Rs ${fmt(prevBalance)}`} />}
        {!!paid && <Line l={ur ? "ادا شدہ" : "Amount Paid"} r={`Rs ${fmt(paid)}`} />}
        {(!!prevBalance || !!paid) && <Line l={ur ? "بقایا" : "Baqaya"} r={`Rs ${fmt(baqaya)}`} bold />}
      </div>

      <div className="mt-4 text-center text-[0.7rem] text-zinc-400">
        {ur ? "شکریہ — کراچی ملک سپلائر" : "Shukriya — Karachi Milk Supplier"}
      </div>
    </div>
  );
}

function Line({ l, r, bold }: { l: string; r: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold text-brand-700" : "text-zinc-600"}`}>
      <span>{l}</span>
      <span className="tabular-nums">{r}</span>
    </div>
  );
}
