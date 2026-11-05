"use client";

// Browser-side auth against Strapi's users-permissions plugin.
// Login/signup return a long-lived JWT in the body; we store it and send it as
// a Bearer token on every customer/bill request. No cookies, no refresh flow.

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "https://kms-strapi-be-production.up.railway.app";

const STORE_KEY = "kms-auth";

export type AuthUser = {
  id: number;
  documentId?: string;
  username: string;
  email?: string;
  name?: string;
};

export type AuthState = { jwt: string; user: AuthUser } | null;

export function getAuth(): AuthState {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

function setAuth(state: AuthState) {
  try {
    if (state) localStorage.setItem(STORE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}

export function getToken(): string | null {
  return getAuth()?.jwt ?? null;
}

export function logout() {
  setAuth(null);
}

// Phone is used as the login identifier (username). Email is synthesised so the
// plugin's "email required/unique" rule is satisfied — it is never used for mail.
function phoneToEmail(phone: string) {
  const clean = phone.replace(/[^0-9a-zA-Z]/g, "") || "user";
  return `${clean}@kms.local`;
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const msg = body?.error?.message as string | undefined;
    if (msg) {
      if (/already taken|already exists|unique/i.test(msg)) return "Ye phone number pehle se registered hai";
      if (/invalid identifier or password/i.test(msg)) return "Phone ya password ghalat hai";
      return msg;
    }
  } catch {
    /* ignore */
  }
  return "Kuch ghalat ho gaya, dobara koshish karein";
}

export async function register(input: { name: string; phone: string; password: string }): Promise<AuthState> {
  const phone = input.phone.trim();
  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: phone,
      email: phoneToEmail(phone),
      password: input.password,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  const state: AuthState = {
    jwt: data.jwt,
    user: { ...data.user, name: input.name.trim() || phone },
  };
  setAuth(state);
  return state;
}

export async function login(input: { phone: string; password: string }): Promise<AuthState> {
  const phone = input.phone.trim();
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: phone, password: input.password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  const existing = getAuth();
  const state: AuthState = {
    jwt: data.jwt,
    user: { ...data.user, name: existing?.user?.name || data.user?.username || phone },
  };
  setAuth(state);
  return state;
}
