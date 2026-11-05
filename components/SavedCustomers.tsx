"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { BillView, fmtRange } from "./BillView";
import { fmt } from "./ui";
import {
  listCustomers,
  listBills,
  deleteBill,
  deleteCustomer,
  updateCustomer,
  type Customer,
  type Bill,
} from "@/lib/account-client";

/**
 * Collapsible list of the logged-in user's customers (FAQ-style accordion).
 * Expand a customer to see their saved bills, start a new bill for them, or delete.
 * `onPick(name)` is how "naya bill" hands the customer name back to the caller
 * (the calculator prefills its name field; the account page navigates to it).
 */
export function SavedCustomers({
  onPick,
  onEditBill,
  refreshKey = 0,
  title = "Mere Customers",
}: {
  onPick: (name: string) => void;
  onEditBill?: (bill: Bill) => void;
  refreshKey?: number;
  title?: string;
}) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

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
    if (user) load();
  }, [user, load, refreshKey]);

  async function removeCustomer(c: Customer) {
    if (!confirm(`"${c.name}" aur us ke saare bill delete kar dein?`)) return;
    try {
      await deleteCustomer(c.documentId);
      if (openId === c.documentId) setOpenId(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete nahi hua");
    }
  }

  async function renameCustomer(c: Customer) {
    const next = window.prompt("Customer ka naya naam likhein:", c.name);
    if (next === null) return;
    const name = next.trim();
    if (!name || name === c.name) return;
    try {
      await updateCustomer(c.documentId, name);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Naam update nahi hua");
    }
  }

  if (!user) return null;

  return (
    <div className="mt-10 no-print">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-main">
          {title} <span className="urdu text-base text-sub">میرے کسٹمر</span>
        </h3>
        {customers.length > 0 && <span className="text-xs text-sub">{customers.length} customer</span>}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-line bg-surface p-6 text-center text-sm text-sub shadow-soft">Load ho raha hai…</div>
      ) : err ? (
        <div className="rounded-3xl border border-red-300 bg-red-50 p-5 text-center text-sm text-red-600 dark:bg-red-950/30">{err}</div>
      ) : customers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-surface p-6 text-center text-sm text-sub shadow-soft">
          Abhi koi customer save nahi hua. Upar naam likh kar bill “💾 Save” karein.
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <CustomerRow
              key={c.documentId}
              customer={c}
              open={openId === c.documentId}
              onToggle={() => setOpenId((id) => (id === c.documentId ? null : c.documentId))}
              onPick={onPick}
              onEditBill={onEditBill}
              onRename={() => renameCustomer(c)}
              onDeleteCustomer={() => removeCustomer(c)}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerRow({
  customer,
  open,
  onToggle,
  onPick,
  onEditBill,
  onRename,
  onDeleteCustomer,
  onChanged,
}: {
  customer: Customer;
  open: boolean;
  onToggle: () => void;
  onPick: (name: string) => void;
  onEditBill?: (bill: Bill) => void;
  onRename: () => void;
  onDeleteCustomer: () => void;
  onChanged: () => void;
}) {
  const [bills, setBills] = useState<Bill[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<Bill | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBills(await listBills(customer.documentId));
    } catch {
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [customer.documentId]);

  useEffect(() => {
    if (open && bills === null) load();
  }, [open, bills, load]);

  async function removeBill(b: Bill) {
    if (!confirm("Ye bill delete kar dein?")) return;
    try {
      await deleteBill(b.documentId);
      await load();
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete nahi hua");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
      <div className="flex items-center">
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 font-display font-bold text-brand-700 dark:bg-brand-800/40 dark:text-brand-100">
            {customer.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-main">{customer.name}</span>
            <span className="block text-xs text-sub">
              {customer.code ? `${customer.code} · ` : ""}{customer.billCount ?? 0} bill
            </span>
          </span>
          <span className={`ml-auto shrink-0 text-sub transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
        </button>
        <button
          onClick={onRename}
          className="flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-800/40 dark:text-brand-100"
          aria-label="Customer ka naam edit"
        >
          ✏️ <span className="hidden sm:inline">Naam</span>
        </button>
        <button
          onClick={onDeleteCustomer}
          className="mx-2 flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
          aria-label="Customer delete"
        >
          🗑 <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-3 pb-3 pt-2">
          <button
            onClick={() => onPick(customer.name)}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            ➕ Is customer ka naya bill
          </button>

          {loading ? (
            <div className="py-3 text-center text-sm text-sub">Load ho raha hai…</div>
          ) : !bills || bills.length === 0 ? (
            <div className="py-3 text-center text-sm text-sub">Koi bill nahi.</div>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {bills.map((b) => (
                <li key={b.documentId} className="flex items-center justify-between gap-3 py-2.5">
                  <button onClick={() => setView(b)} className="min-w-0 flex-1 text-left">
                    <span className="block font-semibold text-main">Rs {fmt(b.totalAmount || 0)}</span>
                    <span className="block text-xs text-sub">
                      {fmtRange(b.startDate, b.endDate)} · {b.totalMun || 0} Mun {b.totalKg || 0} Kg
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setView(b)} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-sub hover:border-brand">
                      Dekhein
                    </button>
                    {onEditBill && (
                      <button
                        onClick={() => onEditBill(b)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-800/40 dark:text-brand-100"
                        aria-label="Bill edit"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => removeBill(b)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
                      aria-label="Bill delete"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view && <BillView bill={view} customerName={customer.name} onClose={() => setView(null)} />}
    </div>
  );
}
