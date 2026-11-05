"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { useSite } from "@/components/SiteProvider";
import { BillSheet, computeBill, type BillRow } from "@/components/BillSheet";
import { fmt } from "@/components/ui";
import {
  listCustomers,
  deleteCustomer,
  listBills,
  deleteBill,
  type Customer,
  type Bill,
} from "@/lib/account-client";

export default function AccountPage() {
  const { user, ready } = useAuth();

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-main">
          Mere Bills{" "}
          <span className="urdu text-2xl text-sub">میرے بل</span>
        </h1>
        <p className="mt-2 text-sm text-sub">
          Apne customers aur un ke saare bill yahan save aur manage karein.
        </p>

        <div className="mt-6">
          {!ready ? (
            <div className="rounded-3xl border border-line bg-surface p-8 text-center text-sub shadow-soft">
              Load ho raha hai…
            </div>
          ) : user ? (
            <BillsManager />
          ) : (
            <AuthForms />
          )}
        </div>
      </div>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/* Auth (login / signup)                                               */
/* ------------------------------------------------------------------ */
function AuthForms() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!phone.trim() || !password) {
      setErr("Phone aur password zaroori hai");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setErr("Apna naam likhein");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") await register({ name, phone, password });
      else await login({ phone, password });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Kuch ghalat ho gaya");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="mx-auto mb-6 flex w-full max-w-xs rounded-full border border-line p-1 text-sm font-semibold">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full py-2 transition-colors ${mode === "login" ? "bg-brand text-white" : "text-sub"}`}
        >
          Login
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-2 transition-colors ${mode === "signup" ? "bg-brand text-white" : "text-sub"}`}
        >
          Naya Account
        </button>
      </div>

      <form onSubmit={submit} className="mx-auto grid max-w-sm gap-4">
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-sub">Aap ka Naam</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" className="bill-input" />
          </label>
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-sub">Phone Number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03xxxxxxxxx"
            inputMode="tel"
            autoComplete="username"
            className="bill-input"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-sub">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="bill-input"
          />
        </label>

        {err && <p className="text-sm font-medium text-red-500">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(14,107,76,0.9)] disabled:opacity-60"
        >
          {busy ? "..." : mode === "signup" ? "Account Banayein" : "Login Karein"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-sub">
        Password bhool gaye? Admin se rabta karein — manually reset ho jayega.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bills manager (logged in)                                           */
/* ------------------------------------------------------------------ */
function BillsManager() {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setCustomers(await listCustomers());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load nahi hua");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function removeCustomer(c: Customer) {
    if (!confirm(`"${c.name}" aur us ke saare bill delete kar dein?`)) return;
    try {
      await deleteCustomer(c.documentId);
      if (selected?.documentId === c.documentId) setSelected(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete nahi hua");
    }
  }

  if (selected) {
    return <CustomerBills customer={selected} onBack={() => { setSelected(null); load(); }} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm text-sub">
          Salam, <span className="font-semibold text-main">{user?.name || user?.username}</span>
        </div>
        <button onClick={logout} className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-sub hover:border-brand">
          Logout
        </button>
      </div>

      <Link
        href="/mandi-bill"
        className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(14,107,76,0.9)]"
      >
        ➕ Naya Bill Banayein
      </Link>

      {loading ? (
        <div className="rounded-3xl border border-line bg-surface p-8 text-center text-sub shadow-soft">Load ho raha hai…</div>
      ) : err ? (
        <div className="rounded-3xl border border-red-300 bg-red-50 p-6 text-center text-sm text-red-600 dark:bg-red-950/30">{err}</div>
      ) : customers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-surface p-8 text-center text-sub shadow-soft">
          Abhi koi customer save nahi hua. Bill banate waqt customer ka naam likh kar “💾 Save” dabayein.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
          <div className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gold-600">
            Customers ({customers.length})
          </div>
          <ul className="divide-y divide-[color:var(--line)]">
            {customers.map((c) => (
              <li key={c.documentId} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-brand-50/40 dark:hover:bg-brand-800/20">
                <button onClick={() => setSelected(c)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 font-display font-bold text-brand-700 dark:bg-brand-800/40 dark:text-brand-100">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-main">{c.name}</span>
                    <span className="block text-xs text-sub">{c.billCount ?? 0} bill</span>
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(c)} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-sub hover:border-brand">
                    Kholein
                  </button>
                  <button onClick={() => removeCustomer(c)} className="grid h-8 w-8 place-items-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Delete">
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One customer's bills                                                */
/* ------------------------------------------------------------------ */
function CustomerBills({ customer, onBack }: { customer: Customer; onBack: () => void }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [view, setView] = useState<Bill | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setBills(await listBills(customer.documentId));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Load nahi hua");
    } finally {
      setLoading(false);
    }
  }, [customer.documentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function removeBill(b: Bill) {
    if (!confirm("Ye bill delete kar dein?")) return;
    try {
      await deleteBill(b.documentId);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete nahi hua");
    }
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sub hover:text-brand-700">
        ← Wapas
      </button>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-main">{customer.name}</h2>
      </div>

      <Link
        href={`/mandi-bill?customer=${encodeURIComponent(customer.name)}`}
        className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(14,107,76,0.9)]"
      >
        ➕ Is customer ka naya bill
      </Link>

      {loading ? (
        <div className="rounded-3xl border border-line bg-surface p-8 text-center text-sub shadow-soft">Load ho raha hai…</div>
      ) : err ? (
        <div className="rounded-3xl border border-red-300 bg-red-50 p-6 text-center text-sm text-red-600 dark:bg-red-950/30">{err}</div>
      ) : bills.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-surface p-8 text-center text-sub shadow-soft">
          Is customer ka koi bill save nahi hua.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
          <ul className="divide-y divide-[color:var(--line)]">
            {bills.map((b) => (
              <li key={b.documentId} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-brand-50/40 dark:hover:bg-brand-800/20">
                <button onClick={() => setView(b)} className="min-w-0 flex-1 text-left">
                  <span className="block font-semibold text-main">Rs {fmt(b.totalAmount || 0)}</span>
                  <span className="block text-xs text-sub">
                    {fmtRange(b.startDate, b.endDate)} · {b.totalMun || 0} Mun {b.totalKg || 0} Kg
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setView(b)} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-sub hover:border-brand">
                    Dekhein
                  </button>
                  <button onClick={() => removeBill(b)} className="grid h-8 w-8 place-items-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Delete">
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {view && <BillView bill={view} customerName={customer.name} onClose={() => setView(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Saved-bill preview modal (view / WhatsApp / print)                  */
/* ------------------------------------------------------------------ */
function BillView({ bill, customerName, onClose }: { bill: Bill; customerName: string; onClose: () => void }) {
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

function fmtRange(start?: string, end?: string) {
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
