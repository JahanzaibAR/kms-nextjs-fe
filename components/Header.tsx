"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/nav";
import { useLang } from "./LanguageProvider";
import { useSite } from "./SiteProvider";
import { useAuth } from "./AuthProvider";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { lang, setLang } = useLang();
  const site = useSite();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl shadow-[0_8px_30px_-18px_rgba(10,60,42,0.5)]"
          : ""
      }`}
      style={{
        background: scrolled ? "color-mix(in srgb, var(--surface) 82%, transparent)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active =
              item.href === pathname ||
              (item.href !== "/" && pathname.startsWith(item.href.split("#")[0]) && item.href.length > 1 && !item.href.includes("#"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-100"
                    : "text-sub hover:text-brand-700 hover:bg-brand-50/60 dark:hover:bg-brand-800/30"
                }`}
              >
                {lang === "ur" ? <span className="urdu">{item.urdu}</span> : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center rounded-full border border-line p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === "en" ? "bg-brand text-white" : "text-sub"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ur")}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === "ur" ? "bg-brand text-white urdu" : "text-sub urdu"
              }`}
            >
              اردو
            </button>
          </div>

          <a
            href={site.whatsappOrder}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(14,107,76,0.8)] transition-transform hover:-translate-y-0.5 sm:flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 004.74 1.2c5.46 0 9.9-4.43 9.9-9.9S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 01-1.26-4.4c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.23 3.7 8.23 8.24 0 4.54-3.7 8.23-8.24 8.23zm4.5-6.16c-.25-.12-1.47-.72-1.7-.8-.22-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
            </svg>
            {lang === "ur" ? <span className="urdu">آرڈر</span> : "Order"}
          </a>

          {/* Account / Bills */}
          <Link
            href="/account"
            className="flex h-10 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-semibold text-sub transition-colors hover:border-brand hover:text-brand-700"
            title={user ? "Mere Bills" : "Login"}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6z" />
            </svg>
            <span className="hidden sm:inline">{user ? user.name || "Bills" : "Login"}</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden"
            aria-label="Menu"
          >
            <div className="relative h-4 w-5">
              <span className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-line bg-surface transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-[32rem]" : "max-h-0 border-t-0"
        }`}
      >
        <nav className="flex flex-col gap-1 p-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium hover:bg-brand-50 dark:hover:bg-brand-800/30"
            >
              <span>{item.label}</span>
              <span className="urdu text-sub">{item.urdu}</span>
            </Link>
          ))}
          <a
            href={site.whatsappOrder}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-semibold text-white"
          >
            WhatsApp Order
          </a>
        </nav>
      </div>
    </header>
  );
}
