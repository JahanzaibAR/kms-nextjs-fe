"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { rateForDate, type RateMap } from "@/lib/mandi";
import { useSite } from "./SiteProvider";
import { useAuth } from "./AuthProvider";
import { BillSheet, computeBill, type BillRow } from "./BillSheet";
import { createBill, createCustomer } from "@/lib/account-client";
import { fmt } from "./ui";

type Row = BillRow;

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function diffDays(aISO: string, bISO: string) {
  const a = new Date(aISO + "T00:00:00");
  const b = new Date(bISO + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function fmtDMY(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}
function round(n: number) {
  return Math.round(n);
}

export function MandiBill({
  rateMap,
  defaultStartDate,
  latestRateDate,
}: {
  rateMap: RateMap;
  defaultStartDate: string;
  latestRateDate: string;
}) {
  const site = useSite();
  const { user } = useAuth();

  // Max selectable day = last day we have a mandi rate for. Initialised from the
  // (stable) prop so prerender never touches `new Date()`; after mount we clamp
  // it down to "today" on the client so future days can never be selected.
  const [maxDate, setMaxDate] = useState(latestRateDate || defaultStartDate);
  useEffect(() => {
    const t = toISO(new Date());
    const base = latestRateDate || t;
    setMaxDate(base < t ? base : t);
  }, [latestRateDate]);

  const [name, setName] = useState("");
  const [session, setSession] = useState<"subah" | "shaam">("subah");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(() => {
    const plus4 = toISO(addDays(new Date(defaultStartDate + "T00:00:00"), 4));
    const cap = latestRateDate || defaultStartDate;
    const e = plus4 > cap ? cap : plus4;
    return e < defaultStartDate ? defaultStartDate : e;
  });
  const [commission, setCommission] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [prevBalance, setPrevBalance] = useState(0);
  const [paid, setPaid] = useState(0);
  const [showBill, setShowBill] = useState(false);
  const [billLang, setBillLang] = useState<"roman" | "urdu">("roman");
  const [sharing, setSharing] = useState(false);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const billRef = useRef<HTMLDivElement>(null);

  const days = Math.max(1, diffDays(startDate, endDate) + 1);

  // Prefill the customer name from ?customer= (used by "Naya Bill" on the account page).
  useEffect(() => {
    try {
      const c = new URLSearchParams(window.location.search).get("customer");
      if (c) setName(c);
    } catch {
      /* ignore */
    }
  }, []);

  // Auto-dismiss the "rate only entered up to X" popup.
  useEffect(() => {
    if (!limitMsg) return;
    const t = setTimeout(() => setLimitMsg(null), 2600);
    return () => clearTimeout(t);
  }, [limitMsg]);

  // Auto-dismiss the save toast.
  useEffect(() => {
    if (!savedMsg) return;
    const t = setTimeout(() => setSavedMsg(null), 2800);
    return () => clearTimeout(t);
  }, [savedMsg]);

  function showLimit() {
    setLimitMsg(`منڈی ریٹ ${fmtDMY(maxDate)} تک درج ہے`);
  }

  // ----- Start / End / days stay in sync; nothing can go past maxDate -----
  function onStartChange(v: string) {
    if (!v) return;
    let s = v;
    if (s > maxDate) {
      s = maxDate;
      showLimit();
    }
    setStartDate(s);
    if (endDate < s) setEndDate(s);
  }
  function onEndChange(v: string) {
    if (!v) return;
    let e = v;
    if (e > maxDate) {
      e = maxDate;
      showLimit();
    }
    if (e < startDate) e = startDate;
    setEndDate(e);
  }
  function setDaysCount(n: number) {
    const target = Math.max(1, Math.floor(n || 1));
    let newEnd = toISO(addDays(new Date(startDate + "T00:00:00"), target - 1));
    if (newEnd > maxDate) {
      newEnd = maxDate;
      showLimit();
    }
    setEndDate(newEnd < startDate ? startDate : newEnd);
  }

  // Build / resize rows whenever the range changes, preserving existing entries by index.
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
  }, [startDate, endDate]);

  // Changing the global commission updates all rows.
  useEffect(() => {
    setRows((prev) => prev.map((r) => ({ ...r, comm: commission })));
  }, [commission]);

  const dates = useMemo(() => {
    const base = new Date(startDate + "T00:00:00");
    return Array.from({ length: days }, (_, i) => addDays(base, i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  // Calculations (shared with saved-bill previews via computeBill)
  const calc = useMemo(() => computeBill(rows), [rows]);

  const baqaya = round(calc.totalAmount + (prevBalance || 0) - (paid || 0));

  async function saveBill() {
    if (!user) return;
    const custName = name.trim();
    if (!custName) {
      setSavedMsg("Pehle customer ka naam likhein");
      return;
    }
    if (calc.totalAmount <= 0) {
      setSavedMsg("Pehle doodh ki miqdaar likhein");
      return;
    }
    setSaving(true);
    try {
      const customer = await createCustomer(custName);
      await createBill({
        customer: customer.documentId,
        billName: custName,
        startDate,
        endDate,
        commission,
        prevBalance,
        paid,
        totalMun: calc.mun,
        totalKg: calc.kg,
        totalAmount: calc.totalAmount,
        baqaya,
        entries: rows.map((r, i) => ({ date: toISO(dates[i]), ...r })),
      });
      setSavedMsg(`✓ ${custName} ka bill save ho gaya`);
    } catch (e) {
      setSavedMsg(e instanceof Error ? e.message : "Save nahi hua");
    } finally {
      setSaving(false);
    }
  }

  function resetBill() {
    setName("");
    setPrevBalance(0);
    setPaid(0);
    setCommission(0);
    setSession("subah");
    setStartDate(defaultStartDate);
    const plus4 = toISO(addDays(new Date(defaultStartDate + "T00:00:00"), 4));
    setEndDate(plus4 > maxDate ? maxDate : plus4);
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

  function sendWhatsAppText() {
    const text = encodeURIComponent(buildBillText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  // Capture the bill sheet as a PNG and share it (native share sheet -> WhatsApp etc.).
  async function sendWhatsAppImage() {
    const node = billRef.current;
    if (!node) return;
    setSharing(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: Math.min(3, (window.devicePixelRatio || 1) * 2),
      });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("no blob");
      const file = new File([blob], `mandi-bill${name ? "-" + name.replace(/\s+/g, "-") : ""}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${site.name} — Bill`,
          text: name ? `${name} ka doodh ka bill` : "Doodh ka mandi bill",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        sendWhatsAppText();
      }
    } catch {
      sendWhatsAppText();
    } finally {
      setSharing(false);
    }
  }

  return (
    <div>
      {/* ===== Inputs ===== */}
      <div className="grid gap-4 rounded-3xl border border-line bg-surface p-4 shadow-soft sm:p-6 no-print">
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
            <input
              type="date"
              value={startDate}
              max={maxDate}
              onChange={(e) => onStartChange(e.target.value)}
              className="bill-input"
            />
          </Field>
          <Field label="Aakhri Tareekh" urdu="آخری تاریخ">
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={maxDate}
              onChange={(e) => onEndChange(e.target.value)}
              className="bill-input"
            />
          </Field>
          <Field label="Kiraya Commission" urdu="کرایہ کمیشن">
            <input
              type="number"
              inputMode="numeric"
              value={commission || ""}
              onChange={(e) => setCommission(Number(e.target.value) || 0)}
              placeholder="0"
              className="bill-input"
            />
          </Field>
        </div>

        {/* Days counter — stays in sync with the two dates above */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-sub">
            Kitne Din <span className="urdu">کتنے دن</span>
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setDaysCount(days - 1)} className="bill-stepper" aria-label="Kam karein">−</button>
            <input
              type="number"
              inputMode="numeric"
              value={days}
              min={1}
              onChange={(e) => setDaysCount(Number(e.target.value) || 1)}
              className="bill-input w-16 text-center"
            />
            <button onClick={() => setDaysCount(days + 1)} className="bill-stepper" aria-label="Barhayein">+</button>
          </div>
          <span className="text-xs text-sub tabular-nums">
            {dates.length ? `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])}` : ""}
          </span>
        </div>
      </div>

      {/* ===== Subah / Shaam toggle ===== */}
      <div className="mt-5 flex items-center justify-between gap-3 no-print">
        <div className="inline-flex rounded-full border border-line bg-surface p-1 text-sm font-semibold shadow-soft">
          <button
            onClick={() => setSession("subah")}
            className={`rounded-full px-4 py-1.5 transition-colors sm:px-5 ${
              session === "subah" ? "bg-brand text-white" : "text-sub hover:text-brand-700"
            }`}
          >
            ☀ Subah <span className="urdu">صبح</span>
          </button>
          <button
            onClick={() => setSession("shaam")}
            className={`rounded-full px-4 py-1.5 transition-colors sm:px-5 ${
              session === "shaam" ? "bg-brand text-white" : "text-sub hover:text-brand-700"
            }`}
          >
            🌙 Shaam <span className="urdu">شام</span>
          </button>
        </div>
      </div>

      {/* ===== Table (compact, fits mobile — no horizontal scroll) ===== */}
      <div className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface shadow-soft no-print">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-brand-50 text-main dark:bg-brand-800/50">
            <tr>
              <th className="w-[24%] px-2 py-3 text-left font-semibold">Din</th>
              <th className="px-1 py-3 text-center font-semibold">Mun</th>
              <th className="px-1 py-3 text-center font-semibold">Kg</th>
              <th className="px-1 py-3 text-center font-semibold">Rate</th>
              <th className="w-[26%] px-2 py-3 text-right font-semibold">Raqam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {dates.map((d, i) => {
              const r = rows[i];
              if (!r) return null;
              const amt = calc.perRow[i]?.rowAmt ?? 0;
              const mun = session === "subah" ? r.subahMun : r.shaamMun;
              const kg = session === "subah" ? r.subahKg : r.shaamKg;
              const rate = session === "subah" ? r.subahRate : r.shaamRate;
              const missingRate = rate === 0 && (mun || kg);
              const noRate =
                (r.subahRate === 0 && (r.subahMun || r.subahKg)) ||
                (r.shaamRate === 0 && (r.shaamMun || r.shaamKg));
              return (
                <tr key={i} className="align-middle">
                  <td className="whitespace-nowrap px-2 py-2 font-medium text-main">{fmtDate(d)}</td>
                  <td className="px-1 py-2">
                    <NumCell
                      value={mun}
                      onChange={(v) => updateRow(i, session === "subah" ? { subahMun: v } : { shaamMun: v })}
                      placeholder="mun"
                    />
                  </td>
                  <td className="px-1 py-2">
                    <NumCell
                      value={kg}
                      onChange={(v) => updateRow(i, session === "subah" ? { subahKg: v } : { shaamKg: v })}
                      placeholder="kg"
                    />
                  </td>
                  <td className="px-1 py-2">
                    <RateCell
                      value={rate}
                      onChange={(v) => updateRow(i, session === "subah" ? { subahRate: v } : { shaamRate: v })}
                      missing={!!missingRate}
                    />
                  </td>
                  <td
                    className={`whitespace-nowrap px-2 py-2 text-right font-semibold tabular-nums ${
                      noRate ? "text-red-500" : "text-brand-700 dark:text-brand-100"
                    }`}
                  >
                    Rs {fmt(round(amt))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-sub no-print">
        ⚠ Rate <span className="font-semibold text-red-500">0</span> ho to laal khaane par tap kar ke mandi rate likhein.
        Net Rate = Mandi Rate + Commission. Subah/Shaam alag alag toggle se likhein.
      </p>

      {/* ===== Totals + Balance ===== */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr] no-print">
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard label="Kul Doodh" value={`${calc.mun} Mun ${calc.kg} Kg`} />
          <SummaryCard label="Kul Raqam" value={`Rs ${fmt(calc.totalAmount)}`} accent />
        </div>
        <div className="rounded-3xl border border-line bg-surface p-4 shadow-soft sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Pichla Baqaya" urdu="پچھلا بقایا">
              <input type="number" inputMode="numeric" value={prevBalance || ""} onChange={(e) => setPrevBalance(Number(e.target.value) || 0)} placeholder="0" className="bill-input" />
            </Field>
            <Field label="Amount Paid" urdu="ادا شدہ رقم">
              <input type="number" inputMode="numeric" value={paid || ""} onChange={(e) => setPaid(Number(e.target.value) || 0)} placeholder="0" className="bill-input" />
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
        <button onClick={() => setShowBill(true)} className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">
          💬 WhatsApp Bhejein
        </button>
        {user ? (
          <button
            onClick={saveBill}
            disabled={saving}
            className="rounded-full bg-gradient-to-br from-gold-400 to-gold px-5 py-3 text-sm font-semibold text-brand-950 shadow-[0_12px_28px_-10px_rgba(201,151,31,0.8)] disabled:opacity-60"
          >
            {saving ? "..." : "💾 Save"}
          </button>
        ) : (
          <Link
            href="/account"
            className="rounded-full border border-dashed border-gold-400 bg-gold-100/40 px-5 py-3 text-sm font-semibold text-gold-700 hover:border-gold"
          >
            🔐 Login kar ke save karein
          </Link>
        )}
        <button onClick={() => window.print()} className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-main hover:border-brand">
          🖨 PDF / Print
        </button>
        <button onClick={resetBill} className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-sub hover:border-brand">
          + Naya Bill
        </button>
      </div>

      {/* ===== Future-date / rate-limit popup ===== */}
      {limitMsg && (
        <div className="fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 no-print">
          <div className="urdu rounded-2xl bg-ink px-6 py-4 text-center text-lg text-cream shadow-card" dir="rtl">
            {limitMsg}
          </div>
        </div>
      )}

      {/* ===== Save toast ===== */}
      {savedMsg && (
        <div className="fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 no-print">
          <div className="rounded-2xl bg-brand px-6 py-3 text-center text-sm font-semibold text-white shadow-card">
            {savedMsg}
          </div>
        </div>
      )}

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
            <div ref={billRef}>
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
            <p className="mt-3 text-center text-xs font-medium text-white/80">WhatsApp par kaise bhejein?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={sendWhatsAppImage}
                disabled={sharing}
                className="rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {sharing ? "..." : "📷 Image bhejein"}
              </button>
              <button
                onClick={sendWhatsAppText}
                className="rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white"
              >
                💬 Text bhejein
              </button>
            </div>
            <button
              onClick={() => window.print()}
              className="mt-2 w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              🖨 Print / PDF
            </button>
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
      <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-medium text-sub">
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
      className="h-10 w-full min-w-0 rounded-lg border border-line bg-[color:var(--bg)] px-1.5 text-center text-sm text-main outline-none focus:border-brand-400"
    />
  );
}

function RateCell({ value, onChange, missing }: { value: number; onChange: (v: number) => void; missing: boolean }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value || ""}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      placeholder="?"
      className={`h-10 w-full min-w-0 rounded-lg border px-1.5 text-center text-sm tabular-nums outline-none ${
        missing ? "border-red-400 bg-red-50 text-red-600 placeholder:text-red-400 dark:bg-red-950/30" : "border-line bg-[color:var(--bg)] text-sub focus:border-brand-400"
      }`}
    />
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border border-line p-4 shadow-soft sm:p-5 ${accent ? "bg-gradient-to-br from-brand-600 to-brand-800 text-white" : "bg-surface"}`}>
      <div className={`text-xs font-semibold uppercase tracking-wider ${accent ? "text-brand-100" : "text-gold-600"}`}>{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${accent ? "text-white" : "text-main"}`}>{value}</div>
    </div>
  );
}

