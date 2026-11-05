"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getAuth,
  login as doLogin,
  register as doRegister,
  logout as doLogout,
  type AuthUser,
} from "@/lib/auth-client";

type AuthCtx = {
  user: AuthUser | null;
  ready: boolean;
  login: (input: { phone: string; password: string }) => Promise<void>;
  register: (input: { name: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = getAuth();
    setUser(a?.user ?? null);
    setReady(true);
  }, []);

  const login = useCallback(async (input: { phone: string; password: string }) => {
    const a = await doLogin(input);
    setUser(a?.user ?? null);
  }, []);

  const register = useCallback(async (input: { name: string; phone: string; password: string }) => {
    const a = await doRegister(input);
    setUser(a?.user ?? null);
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
