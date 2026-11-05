"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { SavedCustomers } from "@/components/SavedCustomers";

export default function AccountPage() {
  const { user, ready } = useAuth();

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-main">
          Mere Bills <span className="urdu text-2xl text-sub">میرے بل</span>
        </h1>
        <p className="mt-2 text-sm text-sub">Apne customers aur un ke saare bill yahan save aur manage karein.</p>

        <div className="mt-6">
          {!ready ? (
            <div className="rounded-3xl border border-line bg-surface p-8 text-center text-sub shadow-soft">Load ho raha hai…</div>
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
/* Auth (login / signup) — phone + password (+ naam for signup)        */
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
        <button onClick={() => setMode("login")} className={`flex-1 rounded-full py-2 transition-colors ${mode === "login" ? "bg-brand text-white" : "text-sub"}`}>
          Login
        </button>
        <button onClick={() => setMode("signup")} className={`flex-1 rounded-full py-2 transition-colors ${mode === "signup" ? "bg-brand text-white" : "text-sub"}`}>
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
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xxxxxxxxx" inputMode="tel" autoComplete="username" className="bill-input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-sub">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoComplete={mode === "signup" ? "new-password" : "current-password"} className="bill-input" />
        </label>

        {err && <p className="text-sm font-medium text-red-500">{err}</p>}

        <button type="submit" disabled={busy} className="mt-1 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(14,107,76,0.9)] disabled:opacity-60">
          {busy ? "..." : mode === "signup" ? "Account Banayein" : "Login Karein"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-sub">Password bhool gaye? Admin se rabta karein — manually reset ho jayega.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Logged-in: greeting + logout + customers accordion                  */
/* ------------------------------------------------------------------ */
function BillsManager() {
  const { user, logout } = useAuth();
  const router = useRouter();

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
        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(14,107,76,0.9)]"
      >
        ➕ Naya Bill Banayein
      </Link>

      <SavedCustomers onPick={(nm) => router.push(`/mandi-bill?customer=${encodeURIComponent(nm)}`)} />
    </div>
  );
}
