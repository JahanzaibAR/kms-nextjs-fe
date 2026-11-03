"use client";

import { createContext, useContext } from "react";
import type { Site, CtaContent } from "@/lib/strapi";

type SiteCtx = { site: Site; cta: CtaContent };

const SiteContext = createContext<SiteCtx | null>(null);

export function SiteProvider({
  site,
  cta,
  children,
}: {
  site: Site;
  cta: CtaContent;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={{ site, cta }}>{children}</SiteContext.Provider>;
}

export function useSite(): Site {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx.site;
}

export function useCta(): CtaContent {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useCta must be used inside <SiteProvider>");
  return ctx.cta;
}
