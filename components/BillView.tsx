"use client";

import { useRef, useState } from "react";
import { useSite } from "./SiteProvider";
import { BillSheet, computeBill, type BillRow } from "./BillSheet";
import type { Bill } from "@/lib/account-client";

/** Saved-bill preview modal: view in Roman/Urdu, share as image, or print. */
export function BillView({ bill, customerName, onClose }: { bill: Bill; customerName: string; onClose: () => void }) {
  const site = useSite();
  const [lang, setLang] = useState<"roman" | "urdu">("roman");
  const [sharing, setSharing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const rows: BillRow[] = (bill.entries || []).map((e) => ({
    subahMun: e.subahMun,
    subahKg: e.subahKg,
    shaamMun: e.shaamMun,
    shaamKg: e.shaamKg,
    subahRate: e.subahRate,
    shaamRate: e.shaamRate,
    comm: e.comm,
  }));
  const dates = (bill.entries || []).map((e) => new Date(e.date + "T00:00:00"));
  const computed = computeBill(rows);
  const totals = {
    mun: bill.totalMun ?? computed.mun,
    kg: bill.totalKg ?? computed.kg,
    totalAmount: bill.totalAmount ?? computed.totalAmount,
  };

  async function shareImage() {
    const node = ref.current;
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
      const file = new File([blob], `bill-${customerName.replace(/\s+/g, "-")}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${site.name} — Bill`, text: `${customerName} ka doodh ka bill` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* ignore */
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 no-print" onClick={onClose}>
      <div className="my-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex rounded-full bg-white/90 p-0.5 text-xs font-semibold">
            <button onClick={() => setLang("roman")} className={`rounded-full px-3 py-1.5 ${lang === "roman" ? "bg-brand text-white" : "text-brand-900"}`}>Roman</button>
            <button onClick={() => setLang("urdu")} className={`rounded-full px-3 py-1.5 ${lang === "urdu" ? "bg-brand text-white" : "text-brand-900"}`}>اردو</button>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-900">✕</button>
        </div>
        <div ref={ref}>
          <BillSheet
            lang={lang}
            name={customerName}
            dates={dates}
            rows={rows}
            perRow={computed.perRow}
            totals={totals}
            prevBalance={bill.prevBalance || 0}
            paid={bill.paid || 0}
            baqaya={bill.baqaya || 0}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={shareImage} disabled={sharing} className="rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {sharing ? "..." : "📷 Image bhejein"}
          </button>
          <button onClick={() => window.print()} className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white">
            🖨 Print / PDF
          </button>
        </div>
      </div>

      {/* print sheet */}
      <div className="print-area hidden print:block">
        <BillSheet
          lang={lang}
          name={customerName}
          dates={dates}
          rows={rows}
          perRow={computed.perRow}
          totals={totals}
          prevBalance={bill.prevBalance || 0}
          paid={bill.paid || 0}
          baqaya={bill.baqaya || 0}
        />
      </div>
    </div>
  );
}

export function fmtRange(start?: string, end?: string) {
  const f = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };
  const a = f(start);
  const b = f(end);
  if (a && b && a !== b) return `${a} – ${b}`;
  return a || b || "";
}
