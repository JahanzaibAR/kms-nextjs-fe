"use client";

import { useEffect, useMemo, useState } from "react";
import { KG_PER_MUN, rateForDate, type RateMap } from "@/lib/mandi";
import { useSite } from "./SiteProvider";
import { fmt } from "./ui";

type Row = {
  subahMun: number;
  subahKg: number;
  shaamMun: number;
  shaamKg: number;
  subahRate: number;
  shaamRate: number;
  comm: number;
};

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function round(n: number) {
  return Math.round(n);
}

const quickRanges = [5, 10, 15, 20, 25, 31];

export function MandiBill({
  rateMap,
  defaultStartDate,
}: {
  rateMap: RateMap;
  defaultStartDate: string;
}) {
  const site = useSite();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [days, setDays] = useState(5);
  const [commission, setCommission] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [prevBalance, setPrevBalance] = useState(0);
  const [paid, setPaid] = useState(0);
  const [showBill, setShowBill] = useState(false);
  const [billLang, setBillLang] = useState<"roman" | "urdu">("roman");

  // Build / resize rows whenever date or day-count changes, preserving existing entries by index.
  useEffect(() => {
    const base = new Date(startDate + "T00:00:00");
    setRows((prev) => {
      const next: Row[] = [];
      for (let i = 0; i < days; i++) {
        const date = addDays(base, i);
        const r = rateForDate(rateMap, date);
        const old = prev[i];
        next.push(
          old
            ? { ...old, subahRate: old.subahRate || r.subah, shaamRate: old.shaamRate || r.shaam }
            : {
                subahMun: 0,
                subahKg: 0,
                shaamMun: 0,
                shaamKg: 0,
                subahRate: r.subah,
                shaamRate: r.shaam,
                comm: commission,
              }
        );
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, days]);

  // Apply global commission to rows that still match the previous global value is complex;
  // instead expose a button-free behavior: changing commission updates all rows.
  useEffect(() => {
    setRows((prev) => prev.map((r) => ({ ...r, comm: commission })));
  }, [commission]);

  const dates = useMemo(() => {
    const base = new Date(startDate + "T00:00:00");
    return Array.from({ length: days }, (_, i) => addDays(base, i));
  }, [startDate, days]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  // Calculations
  const calc = useMemo(() => {
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
  }, [rows]);

  const baqaya = round(calc.totalAmount + (prevBalance || 0) - (paid || 0));

  function resetBill() {
    setName("");
    setPrevBalance(0);
    setPaid(0);
    setCommission(0);
    setDays(5);
    setStartDate(defaultStartDate);
    setRows([]);
  }

  function buildBillText() {
    const lines: string[] = [];
    lines.push(`*${site.name}* — Mandi Bill`);
    if (name) lines.push(`Naam: ${name}`);
    lines.push(`Tareekh: ${fmtDate(dates[0] ?? new Date())}${dates.length > 1 ? ` – ${fmtDate(dates[dates.length - 1])}` : ""}`);
    lines.push("");
    dates.forEach((d, i) => {
      const r = rows[i];
      if (!r) return;
      const amt = calc.perRow[i]?.rowAmt ?? 0;
      if (amt <= 0) return;
      const parts: string[] = [];
      if (r.subahMun || r.subahKg) parts.push(`S:${r.subahMun}m ${r.subahKg}kg @${fmt(r.subahRate + r.comm)}`);
      if (r.shaamMun || r.shaamKg) parts.push(`Sh:${r.shaamMun}m ${r.shaamKg}kg @${fmt(r.shaamRate + r.comm)}`);
      lines.push(`${fmtDate(d)} — ${parts.join(" | ")} = Rs ${fmt(round(amt))}`);
    });
    lines.push("");
    lines.push(`Kul Doodh: ${calc.mun} Mun ${calc.kg} Kg`);
    lines.push(`*Kul Raqam: Rs ${fmt(calc.totalAmount)}*`);
    if (prevBalance) lines.push(`Pichla Baqaya: Rs ${fmt(prevBalance)}`);
    if (paid) lines.push(`Amount Paid: Rs ${fmt(paid)}`);
    if (prevBalance || paid) lines.push(`*Baqaya: Rs ${fmt(baqaya)}*`);
    return lines.join("\n");
  }

  function sendWhatsApp() {
    const text = encodeURIComponent(buildBillText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div>
      {/* ===== Inputs ===== */}
      <div className="grid gap-4 rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6 no-print">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Dukandaar / Bhenswala ka Naam" urdu="دکاندار یا بھینس والے کا نام">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Naam likhein"
              className="bill-input"
            />
          </Field>
          <Field label="Shuru Tareekh" urdu="شروع تاریخ">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bill-input" />
          </Field>
          <Field label="Kiraya Commission" urdu="کرایہ کمیشن">
            <input
              type="number"
              value={commission || ""}
              onChange={(e) => setCommission(Number(e.target.value) || 0)}
              placeholder="0"
              className="bill-input"
            />
          </Field>
          <Field label="Kitne Din" urdu="کتنے دن">
            <div className="flex items-center gap-2">
              <button onClick={() => setDays((d) => Math.max(1, d - 1))} className="bill-stepper">−</button>
              <input
                type="number"
                value={days}
                min={1}
                max={31}
                onChange={(e) => setDays(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                className="bill-input text-center"
              />
              <button onClick={() => setDays((d) => Math.min(31, d + 1))} className="bill-stepper">+</button>
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-sub">Quick:</span>
          {quickRanges.map((q) => (
            <button
              key={q}
              onClick={() => setDays(q)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                days === q ? "border-brand bg-brand text-white" : "border-line text-sub hover:border-brand"
              }`}
            >
              {q} din
            </button>
          ))}
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="mt-5 overflow-x-auto scroll-slim rounded-3xl border border-line bg-surface shadow-soft no-print">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-brand-50 text-main dark:bg-brand-800/50">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Din</th>
              <th className="px-2 py-3 text-center font-semibold" colSpan={2}>☀ Subah (Mun / Kg)</th>
              <th className="px-2 py-3 text-center font-semibold" colSpan={2}>🌙 Shaam (Mun / Kg)</th>
              <th className="px-2 py-3 text-center font-semibold">Rate+Comm</th>
              <th className="px-3 py-3 text-right font-semibold">Raqam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {dates.map((d, i) => {
              const r = rows[i];
              if (!r) return null;
              const amt = calc.perRow[i]?.rowAmt ?? 0;
              const noRate = (r.subahRate === 0 && (r.subahMun || r.subahKg)) || (r.shaamRate === 0 && (r.shaamMun || r.shaamKg));
              return (
                <tr key={i} className="align-middle">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-main">{fmtDate(d)}</td>
                  <td className="px-1 py-2"><NumCell value={r.subahMun} onChange={(v) => updateRow(i, { subahMun: v })} placeholder="mun" /></td>
                  <td className="px-1 py-2"><NumCell value={r.subahKg} onChange={(v) => updateRow(i, { subahKg: v })} placeholder="kg" /></td>
                  <td className="px-1 py-2"><NumCell value={r.shaamMun} onChange={(v) => updateRow(i, { shaamMun: v })} placeholder="mun" /></td>
                  <td className="px-1 py-2"><NumCell value={r.shaamKg} onChange={(v) => updateRow(i, { shaamKg: v })} placeholder="kg" /></td>
                  <td className="px-1 py-2">
                    <div className="flex flex-col gap-1">
                      <RateCell value={r.subahRate} onChange={(v) => updateRow(i, { subahRate: v })} missing={r.subahRate === 0} tag="S" />
                      <RateCell value={r.shaamRate} onChange={(v) => updateRow(i, { shaamRate: v })} missing={r.shaamRate === 0} tag="Sh" />
                    </div>
                  </td>
                  <td className={`whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums ${noRate ? "text-red-500" : "text-brand-700 dark:text-brand-100"}`}>
                    Rs {fmt(round(amt))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-sub no-print">
        ⚠ Rate <span className="font-semibold text-red-500">0</span> ho to laal khaane par tap kar ke mandi rate likhein. Net Rate = Mandi Rate + Commission.
      </p>

      {/* ===== Totals + Balance ===== */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr] no-print">
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard label="Kul Doodh" value={`${calc.mun} Mun ${calc.kg} Kg`} />
          <SummaryCard label="Kul Raqam" value={`Rs ${fmt(calc.totalAmount)}`} accent />
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Pichla Baqaya" urdu="پچھلا بقایا">
              <input type="number" value={prevBalance || ""} onChange={(e) => setPrevBalance(Number(e.target.value) || 0)} placeholder="0" className="bill-input" />
            </Field>
            <Field label="Amount Paid" urdu="ادا شدہ رقم">
              <input type="number" value={paid || ""} onChange={(e) => setPaid(Number(e.target.value) || 0)} placeholder="0" className="bill-input" />
            </Field>
            <Field label="Baqaya" urdu="بقایا">
              <div className="grid h-11 place-items-center rounded-xl bg-brand-50 font-display text-lg font-bold text-brand-700 dark:bg-brand-800/40 dark:text-brand-100">
                Rs {fmt(baqaya)}
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="mt-6 flex flex-wrap gap-3 no-print">
        <button onClick={() => setShowBill(true)} className="rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(14,107,76,0.9)]">
          Bill Dekhein / بل دیکھیں
        </button>
        <button onClick={sendWhatsApp} className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">
          💬 WhatsApp Bhejein
        </button>
        <button onClick={() => window.print()} className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-main hover:border-brand">
          🖨 PDF / Print
        </button>
        <button onClick={resetBill} className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-sub hover:border-brand">
          + Naya Bill
        </button>
      </div>

      {/* ===== Bill preview (modal + print-area) ===== */}
      {showBill && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 no-print" onClick={() => setShowBill(false)}>
          <div className="my-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex rounded-full bg-white/90 p-0.5 text-xs font-semibold">
                <button onClick={() => setBillLang("roman")} className={`rounded-full px-3 py-1.5 ${billLang === "roman" ? "bg-brand text-white" : "text-brand-900"}`}>Roman</button>
                <button onClick={() => setBillLang("urdu")} className={`rounded-full px-3 py-1.5 ${billLang === "urdu" ? "bg-brand text-white" : "text-brand-900"}`}>اردو</button>
              </div>
              <button onClick={() => setShowBill(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-900">✕</button>
            </div>
            <BillSheet
              lang={billLang}
              name={name}
              dates={dates}
              rows={rows}
              perRow={calc.perRow}
              totals={calc}
              prevBalance={prevBalance}
              paid={paid}
              baqaya={baqaya}
            />
            <div className="mt-3 flex gap-3">
              <button onClick={() => window.print()} className="flex-1 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white">🖨 Print / پرنٹ</button>
              <button onClick={sendWhatsApp} className="flex-1 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white">WhatsApp Bhejein</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print sheet (always rendered for window.print without modal) */}
      <div className="print-area hidden print:block">
        <BillSheet
          lang={billLang}
          name={name}
          dates={dates}
          rows={rows}
          perRow={calc.perRow}
          totals={calc}
          prevBalance={prevBalance}
          paid={paid}
          baqaya={baqaya}
        />
      </div>
    </div>
  );
}

function Field({ label, urdu, children }: { label: string; urdu?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-sub">
        <span>{label}</span>
        {urdu && <span className="urdu">{urdu}</span>}
      </span>
      {children}
    </label>
  );
}

function NumCell({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value || ""}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      placeholder={placeholder}
      className="h-10 w-16 rounded-lg border border-line bg-[color:var(--bg)] px-2 text-center text-sm text-main outline-none focus:border-brand-400"
    />
  );
}

function RateCell({ value, onChange, missing, tag }: { value: number; onChange: (v: number) => void; missing: boolean; tag: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-5 text-[0.65rem] font-semibold text-sub">{tag}</span>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="?"
        className={`h-8 w-20 rounded-lg border px-2 text-center text-xs tabular-nums outline-none ${
          missing ? "border-red-400 bg-red-50 text-red-600 placeholder:text-red-400 dark:bg-red-950/30" : "border-line bg-[color:var(--bg)] text-sub"
        }`}
      />
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border border-line p-5 shadow-soft ${accent ? "bg-gradient-to-br from-brand-600 to-brand-800 text-white" : "bg-surface"}`}>
      <div className={`text-xs font-semibold uppercase tracking-wider ${accent ? "text-brand-100" : "text-gold-600"}`}>{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${accent ? "text-white" : "text-main"}`}>{value}</div>
    </div>
  );
}

function BillSheet({
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
  rows: Row[];
  perRow: { rowMun: number; rowAmt: number }[];
  totals: { mun: number; kg: number; totalAmount: number };
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
